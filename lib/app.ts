import crypto from 'node:crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Article, Category } from '../src/types/index.js';
import { addLog, addMessage, getArticles, getLogs, getMessages, saveArticles, storageMode } from './store.js';
import { CATEGORIES, buildArticle, fetchFeedItems, ingestItems, isHttpUrl, RawItem } from './ingest.js';

/** Fields that must never leave the server. */
function toPublic(a: Article) {
  const { estimatedCpcEur, cpcKeywords, makePipelineId, status, ...rest } = a;
  return rest;
}
const isPublished = (a: Article) => a.status !== 'draft';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Fail-closed API key check. The key lives ONLY in the MAKE_WEBHOOK_API_KEY environment variable. */
function requireKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.MAKE_WEBHOOK_API_KEY;
  if (!expected || expected.length < 24) {
    return res.status(503).json({ success: false, error: 'Server is not configured for authenticated requests.' });
  }
  const provided = req.get('x-api-key') || '';
  if (!provided || !safeEqual(provided, expected)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: '256kb' }));

  const generalLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: true, legacyHeaders: false });
  const privilegedLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 60, standardHeaders: true, legacyHeaders: false });
  const contactLimiter = rateLimit({ windowMs: 60 * 60_000, limit: 5, standardHeaders: true, legacyHeaders: false });
  app.use('/api', generalLimiter);

  // ---------- Public read API ----------
  app.get('/api/articles', wrap(async (req, res) => {
    const { category, search, tag, limit } = req.query;
    let results = (await getArticles()).filter(isPublished);
    if (typeof category === 'string' && category !== 'all') results = results.filter((a) => a.category === category);
    if (typeof tag === 'string') results = results.filter((a) => a.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    if (typeof limit === 'string' && !isNaN(Number(limit))) results = results.slice(0, Math.min(Number(limit), 100));
    res.json({ count: results.length, articles: results.map(toPublic) });
  }));

  app.get('/api/articles/:slug', wrap(async (req, res) => {
    const all = (await getArticles()).filter(isPublished);
    const article = all.find((a) => a.slug === req.params.slug || a.id === req.params.slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const related = all.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3);
    res.json({ article: toPublic(article), related: related.map(toPublic) });
  }));

  app.get('/api/stats', wrap(async (_req, res) => {
    const published = (await getArticles()).filter(isPublished);
    const counts: Record<Category, number> = { insurance: 0, finance: 0, 'car-diy': 0, 'ai-news': 0 };
    for (const a of published) if (counts[a.category] !== undefined) counts[a.category]++;
    res.json({ totalArticles: published.length, categoryCounts: counts });
  }));

  // ---------- Authenticated ingestion (Make.com) ----------
  // Single article. Kept for scenarios that summarize elsewhere.
  app.post('/api/webhook/make', privilegedLimiter, requireKey, wrap(async (req, res) => {
    const { title, category, summary, content, sourceUrl, sourceName, tags, imageUrl, status } = req.body ?? {};
    const body = typeof summary === 'string' && summary.trim() ? summary : typeof content === 'string' ? content : '';
    if (typeof title !== 'string' || !title.trim() || title.length > 200 || !body.trim() || body.length > 20000) {
      return res.status(400).json({ success: false, error: 'title (max 200 chars) and summary/content (max 20000 chars) are required.' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: `category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (sourceUrl !== undefined && !isHttpUrl(sourceUrl)) {
      return res.status(400).json({ success: false, error: 'sourceUrl must be an http(s) URL.' });
    }
    const existing = await getArticles();
    if (sourceUrl && existing.some((a) => a.sourceUrl === sourceUrl)) {
      return res.status(409).json({ success: false, error: 'An article with this sourceUrl already exists.' });
    }
    const article = buildArticle({
      title,
      summary: body.slice(0, 20000),
      category,
      tags: Array.isArray(tags) ? tags : [],
      sourceName: typeof sourceName === 'string' ? sourceName : undefined,
      sourceUrl,
      imageUrl,
      forceDraft: status === 'draft'
    });
    await saveArticles([article, ...existing]);
    await addLog({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      sender: 'Make.com HTTP Module',
      status: 'success',
      articleTitle: article.title,
      category: article.category,
      payloadSnippet: JSON.stringify({ title: article.title, category: article.category }).slice(0, 140)
    });
    res.status(201).json({ success: true, article: { id: article.id, slug: article.slug, status: article.status, url: `/article/${article.slug}` } });
  }));

  // Raw items collected by Make (RSS modules). The server summarizes them with ONE Gemini call.
  app.post('/api/webhook/make/batch', privilegedLimiter, requireKey, wrap(async (req, res) => {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0 || items.length > 40) {
      return res.status(400).json({ success: false, error: 'Body must be { "items": [ { title, link, snippet?, source? } ] } with 1 to 40 items.' });
    }
    try {
      const result = await ingestItems(items as RawItem[], 'Make.com batch');
      res.json({ success: true, ...result });
    } catch (e) {
      res.status(502).json({ success: false, error: (e as Error).message });
    }
  }));

  // Server fetches the feeds in NEWS_FEEDS itself. Make only needs to call this once a day.
  app.post('/api/jobs/daily-ingest', privilegedLimiter, requireKey, wrap(async (_req, res) => {
    try {
      const items = await fetchFeedItems();
      const result = await ingestItems(items, 'Daily ingest job');
      res.json({ success: true, ...result });
    } catch (e) {
      res.status(502).json({ success: false, error: (e as Error).message });
    }
  }));

  // ---------- Authenticated admin ----------
  const logsHandler = wrap(async (_req, res) => {
    res.json({ logs: (await getLogs()).slice(0, 50).map(({ ip, ...l }) => l) });
  });
  app.get('/api/admin/logs', privilegedLimiter, requireKey, logsHandler);
  app.get('/api/webhook/logs', privilegedLimiter, requireKey, logsHandler);

  app.get('/api/admin/drafts', privilegedLimiter, requireKey, wrap(async (_req, res) => {
    const drafts = (await getArticles()).filter((a) => a.status === 'draft');
    res.json({ count: drafts.length, drafts: drafts.map((a) => ({ id: a.id, title: a.title, category: a.category, summary: a.summary, sourceUrl: a.sourceUrl })) });
  }));

  app.post('/api/admin/articles/:id/publish', privilegedLimiter, requireKey, wrap(async (req, res) => {
    const all = await getArticles();
    const target = all.find((a) => a.id === req.params.id);
    if (!target) return res.status(404).json({ success: false, error: 'Not found' });
    target.status = 'published';
    await saveArticles(all);
    res.json({ success: true, id: target.id, url: `/article/${target.slug}` });
  }));

  app.get('/api/admin/messages', privilegedLimiter, requireKey, wrap(async (_req, res) => {
    res.json({ messages: await getMessages() });
  }));

  // ---------- Contact form ----------
  app.post('/api/contact', contactLimiter, wrap(async (req, res) => {
    const clean = (v: unknown, max: number) =>
      typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max) : '';
    const name = clean(req.body?.name, 100);
    const email = clean(req.body?.email, 200);
    const subject = clean(req.body?.subject, 150);
    const message = typeof req.body?.message === 'string' ? req.body.message.trim().slice(0, 2000) : '';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide your name, a valid email and a message of at least 10 characters.' });
    }
    await addMessage({ id: 'msg-' + Date.now().toString(36), receivedAt: new Date().toISOString(), name, email, subject, message });
    res.json({ success: true, message: 'Your message has been received by the editorial desk.' });
  }));

  // ---------- SEO files ----------
  const baseUrl = (req: Request) => {
    if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
    const proto = req.get('x-forwarded-proto') === 'https' || req.protocol === 'https' ? 'https' : 'http';
    return `${proto}://${req.get('host')}`;
  };

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', wrap(async (req, res) => {
    const base = baseUrl(req);
    const cats = ['finance', 'insurance', 'car-diy', 'ai-news'];
    const urls = [
      `  <url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      ...cats.map((c) => `  <url><loc>${base}/?category=${c}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`),
      ...(await getArticles()).filter(isPublished).map(
        (a) => `  <url><loc>${base}/article/${encodeURIComponent(a.slug)}</loc><lastmod>${new Date(a.publishedAt).toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
      )
    ];
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  }));

  // Served only when a real publisher ID is configured. No placeholder IDs.
  app.get('/ads.txt', (_req, res) => {
    const id = process.env.ADSENSE_PUBLISHER_ID || '';
    if (!/^pub-\d{16}$/.test(id)) return res.status(404).type('text/plain').send('Not found');
    res.type('text/plain').send(`google.com, ${id}, DIRECT, f08c47fec0942fa0\n`);
  });

  // ---------- Fallbacks ----------
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
    console.error('[api] unhandled error:', err?.message ?? err);
    res.status(500).json({ error: 'Internal server error' });
  });

  console.log(`[NordicPulse] storage mode: ${storageMode}`);
  return app;
}

export default createApp;
