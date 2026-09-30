import Parser from 'rss-parser';
import { GoogleGenAI, Type } from '@google/genai';
import { EDITORIAL_AUTHOR } from '../src/data/seedArticles.js';
import type { Article, Category, WebhookLog } from '../src/types/index.js';
import { addLog, getArticles, saveArticles } from './store.js';

export const CATEGORIES: Category[] = ['insurance', 'finance', 'car-diy', 'ai-news'];

export interface RawItem {
  title: string;
  link: string;
  snippet?: string;
  source?: string;
  pubDate?: string;
}

export interface IngestResult {
  received: number;
  duplicates: number;
  created: number;
  published: number;
  drafts: number;
}

const IMAGES: Record<Category, string> = {
  insurance: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
  finance: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
  'car-diy': 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1200&auto=format&fit=crop&q=80',
  'ai-news': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80'
};

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2000) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 80);
  return `${base || 'article'}-${Math.random().toString(36).substring(2, 6)}`;
}

function holdCategories(): Category[] {
  return (process.env.HOLD_CATEGORIES || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Category => (CATEGORIES as string[]).includes(s));
}

export function buildArticle(input: {
  title: string;
  summary: string;
  category: Category;
  tags?: string[];
  sourceName?: string;
  sourceUrl?: string;
  imageUrl?: string;
  needsReview?: boolean;
  forceDraft?: boolean;
}): Article {
  const now = new Date().toISOString();
  const draft = input.forceDraft || input.needsReview || holdCategories().includes(input.category);
  const tags = (input.tags ?? [])
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 6);
  const words = input.summary.split(/\s+/).length;
  return {
    id: 'art-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    slug: slugify(input.title),
    title: input.title.trim().slice(0, 200),
    category: input.category,
    summary: input.summary.slice(0, 400),
    content: input.summary,
    publishedAt: now,
    author: EDITORIAL_AUTHOR,
    tags: tags.length ? tags : [input.category.toUpperCase(), 'Daily Brief'],
    imageUrl: isHttpUrl(input.imageUrl) ? input.imageUrl : IMAGES[input.category],
    sourceName: input.sourceName?.slice(0, 120),
    sourceUrl: isHttpUrl(input.sourceUrl) ? input.sourceUrl : undefined,
    readingTimeMinutes: Math.max(1, Math.ceil(words / 200)),
    status: draft ? 'draft' : 'published',
    timestamp: now
  } as Article;
}

/** Pull recent items from the RSS/Atom feeds listed in NEWS_FEEDS (comma separated URLs). */
export async function fetchFeedItems(): Promise<RawItem[]> {
  const feeds = (process.env.NEWS_FEEDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(isHttpUrl);
  if (feeds.length === 0) throw new Error('NEWS_FEEDS is empty. Add up to 5 feed URLs, separated by commas.');

  const perFeed = Number(process.env.ITEMS_PER_FEED || 3);
  const maxAgeMs = Number(process.env.MAX_ITEM_AGE_HOURS || 36) * 3600_000;
  const parser = new Parser({ timeout: 8000 });

  const settled = await Promise.allSettled(feeds.slice(0, 5).map((url) => parser.parseURL(url)));
  const items: RawItem[] = [];
  settled.forEach((r, i) => {
    if (r.status !== 'fulfilled') {
      console.warn(`[ingest] feed failed: ${feeds[i]} (${(r.reason as Error)?.message ?? 'error'})`);
      return;
    }
    const sourceName = r.value.title || new URL(feeds[i]).hostname;
    r.value.items
      .filter((it) => {
        const t = it.isoDate ? Date.parse(it.isoDate) : NaN;
        return Number.isNaN(t) || Date.now() - t <= maxAgeMs;
      })
      .slice(0, perFeed)
      .forEach((it) => {
        if (it.title && isHttpUrl(it.link)) {
          items.push({
            title: it.title,
            link: it.link,
            snippet: it.contentSnippet || it.content || '',
            source: sourceName,
            pubDate: it.isoDate
          });
        }
      });
  });
  return items;
}

interface AiRow {
  index: number;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  needsReview: boolean;
}

async function summarize(items: RawItem[]): Promise<AiRow[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey });

  const payload = items.map((it, index) => ({
    index,
    source: it.source || 'unknown',
    title: it.title,
    snippet: stripHtml(it.snippet || '').slice(0, 700)
  }));

  const prompt = `You are the desk editor of a news digest. For each input item write an ORIGINAL 2 to 3 sentence summary (60 to 100 words) in your own words. Never copy sentences from the input. Use only facts present in the input; do not add facts, advice or predictions. Neutral tone.
Choose exactly one category from: ${CATEGORIES.join(', ')}. If none fits well, or the input is too thin to summarize accurately, set needsReview to true.
Return a JSON array with one object per input item, using the same index.

INPUT:
${JSON.stringify(payload)}`;

  const call = ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            index: { type: Type.INTEGER },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            category: { type: Type.STRING, enum: CATEGORIES },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            needsReview: { type: Type.BOOLEAN }
          },
          required: ['index', 'title', 'summary', 'category', 'tags', 'needsReview']
        }
      }
    }
  });
  const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Gemini request timed out')), 45_000));
  const response = await Promise.race([call, timeout]);
  const parsed = JSON.parse(response.text ?? '[]');
  if (!Array.isArray(parsed)) throw new Error('Model returned an unexpected format');
  return parsed as AiRow[];
}

/** Dedupe, summarize in ONE model call, save. Used by both the daily job and the Make batch endpoint. */
export async function ingestItems(rawItems: RawItem[], sender: string): Promise<IngestResult> {
  const max = Number(process.env.MAX_ITEMS_PER_RUN || 8);
  const existing = await getArticles();
  const seen = new Set(existing.map((a) => a.sourceUrl).filter(Boolean) as string[]);

  const fresh: RawItem[] = [];
  let duplicates = 0;
  for (const it of rawItems) {
    if (!it || typeof it.title !== 'string' || !isHttpUrl(it.link)) continue;
    if (seen.has(it.link)) {
      duplicates++;
      continue;
    }
    seen.add(it.link);
    fresh.push(it);
  }
  const batch = fresh.slice(0, max);
  const result: IngestResult = { received: rawItems.length, duplicates, created: 0, published: 0, drafts: 0 };
  if (batch.length === 0) return result;

  const rows = await summarize(batch);
  const created: Article[] = [];
  for (const row of rows) {
    const src = batch[row?.index];
    if (!src || typeof row.summary !== 'string' || row.summary.trim().length < 20) continue;
    const category = (CATEGORIES as string[]).includes(row.category) ? (row.category as Category) : null;
    created.push(
      buildArticle({
        title: typeof row.title === 'string' && row.title.trim() ? row.title : src.title,
        summary: row.summary.trim(),
        category: category ?? 'finance',
        tags: Array.isArray(row.tags) ? row.tags : [],
        sourceName: src.source,
        sourceUrl: src.link,
        needsReview: row.needsReview === true || category === null
      })
    );
  }
  if (created.length > 0) {
    await saveArticles([...created, ...existing]);
    const log: WebhookLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      sender,
      status: 'success',
      articleTitle: `${created.length} article(s) ingested`,
      category: created[0].category,
      payloadSnippet: JSON.stringify({ received: rawItems.length, duplicates, created: created.length }).slice(0, 140)
    };
    await addLog(log);
  }
  result.created = created.length;
  result.published = created.filter((a) => a.status === 'published').length;
  result.drafts = created.length - result.published;
  return result;
}
