import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { SEED_ARTICLES } from './src/data/seedArticles';
import { Article, WebhookLog, Category } from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Security Hardening: Helmet HTTP Headers
// Disable CSP for SPA to avoid breaking inline scripts/Vite HMR and AdSense/external fonts
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Security Hardening: Payload size limiting (reduced from 10mb to 256kb)
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// Security Hardening: Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 ingestion calls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many webhook requests from this IP, please try again shortly.' }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 submissions per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions from this IP. Please try again later.' }
});

// Storage directory
const DATA_DIR = path.resolve(__dirname, 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const LOGS_FILE = path.join(DATA_DIR, 'webhook_logs.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory + file-backed storage
let articles: Article[] = [];
let webhookLogs: WebhookLog[] = [];

// Initialize or load articles
function loadData() {
  try {
    articles = [...SEED_ARTICLES];
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');

    // Sanitized seed logs (zero PII, zero raw IP addresses)
    webhookLogs = [
      {
        id: 'log-init-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        sender: 'Automated Crawler Dispatch',
        status: 'success',
        articleTitle: 'Commercial Cyber Liability: Modern Standards & Underwriting Shifts',
        category: 'insurance',
        cpcEstimate: 38.5,
        payloadSnippet: '{"category":"insurance","source":"Standards Bulletin"}'
      },
      {
        id: 'log-init-2',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        sender: 'Automated Crawler Dispatch',
        status: 'success',
        articleTitle: 'Interest Rate Trajectories & Fixed-Yield Allocation Strategies',
        category: 'finance',
        cpcEstimate: 34.0,
        payloadSnippet: '{"category":"finance","source":"Global Markets Treasury"}'
      }
    ];
    fs.writeFileSync(LOGS_FILE, JSON.stringify(webhookLogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error loading data:', err);
    articles = [...SEED_ARTICLES];
  }
}

function saveArticles() {
  try {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving articles:', e);
  }
}

function saveLogs() {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(webhookLogs.slice(0, 100), null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving logs:', e);
  }
}

loadData();

// Security: Read API key strictly from environment.
// Refuse to start in production if key is missing or shorter than 32 characters.
const CONFIGURED_API_KEY =
  process.env.MAKE_WEBHOOK_API_KEY ||
  (process.env.NODE_ENV !== 'production' ? crypto.randomBytes(32).toString('hex') : '');

if (process.env.NODE_ENV === 'production') {
  if (!CONFIGURED_API_KEY || CONFIGURED_API_KEY.length < 32) {
    console.error(
      'FATAL SECURITY ERROR: MAKE_WEBHOOK_API_KEY environment variable is required and must be at least 32 characters in production.'
    );
    process.exit(1);
  }
}

// Fail-closed authentication middleware: read from 'x-api-key' header ONLY
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  // Reject query string keys to prevent credentials leaking into server access logs
  if (req.query.apiKey) {
    return res.status(400).json({ error: 'API key must not be passed in query string' });
  }

  const incomingKey = req.headers['x-api-key'];

  if (!incomingKey || typeof incomingKey !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: missing x-api-key header' });
  }

  if (!CONFIGURED_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: webhook authentication not configured' });
  }

  // Timing-safe comparison using fixed-length SHA-256 hashes to prevent timing attacks
  const hashIncoming = crypto.createHash('sha256').update(incomingKey).digest();
  const hashConfigured = crypto.createHash('sha256').update(CONFIGURED_API_KEY).digest();

  if (!crypto.timingSafeEqual(hashIncoming, hashConfigured)) {
    return res.status(401).json({ error: 'Unauthorized: invalid x-api-key' });
  }

  next();
}

// Helper to estimate CPC based on category
function getEstimatedCategoryCpc(category: Category): number {
  switch (category) {
    case 'insurance':
      return Number((28 + Math.random() * 18).toFixed(2));
    case 'finance':
      return Number((24 + Math.random() * 15).toFixed(2));
    case 'car-diy':
      return Number((16 + Math.random() * 12).toFixed(2));
    case 'ai-news':
      return Number((25 + Math.random() * 15).toFixed(2));
    default:
      return 18.0;
  }
}

// Category fallback imagery
function getDefaultImage(category: Category): string {
  switch (category) {
    case 'insurance':
      return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80';
    case 'finance':
      return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80';
    case 'car-diy':
      return 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1200&auto=format&fit=crop&q=80';
    case 'ai-news':
      return 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80';
  }
}

// REST API ROUTES

// 1. GET /api/articles (Public)
app.get('/api/articles', (req: Request, res: Response) => {
  const { category, search, tag, limit } = req.query;

  let results = [...articles];

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((a) => a.category === category);
  }

  if (tag && typeof tag === 'string') {
    results = results.filter((a) => a.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (limit && !isNaN(Number(limit))) {
    results = results.slice(0, Number(limit));
  }

  res.json({
    count: results.length,
    articles: results
  });
});

// 2. GET /api/articles/:slug (Public)
app.get('/api/articles/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const article = articles.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Find related articles in same category
  const related = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  res.json({ article, related });
});

// 3. POST /api/webhook/make - Ingestion endpoint (Secured with rate limit and timing-safe auth)
app.post('/api/webhook/make', webhookLimiter, requireApiKey, (req: Request, res: Response) => {
  const {
    title,
    category,
    summary,
    content,
    sourceUrl,
    sourceName,
    authorName,
    tags,
    imageUrl,
    cpcKeywords,
    estimatedCpcEur
  } = req.body;

  if (!title || !category || (!summary && !content)) {
    const logItem: WebhookLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      sender: 'Webhook Dispatcher',
      status: 'failed',
      articleTitle: title || 'Untitled Ingestion Request',
      category: (category as Category) || 'insurance',
      cpcEstimate: 0,
      payloadSnippet: JSON.stringify(req.body).slice(0, 120)
    };
    webhookLogs.unshift(logItem);
    saveLogs();

    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, category (insurance|finance|car-diy|ai-news), and summary/content'
    });
  }

  const validCategories: Category[] = ['insurance', 'finance', 'car-diy', 'ai-news'];
  const safeCategory: Category = validCategories.includes(category as Category)
    ? (category as Category)
    : 'finance';

  const cleanTitle = String(title).trim();
  const slug =
    cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 6);

  const wordCount = ((content || summary) as string).split(/\s+/).length;
  const readingTime = Math.max(2, Math.ceil(wordCount / 200));

  const authorsMap: Record<Category, { name: string; role: string; avatar: string; expertise: string }> = {
    insurance: {
      name: authorName || 'Dr. Helena Lindqvist',
      role: 'Senior Actuarial Specialist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      expertise: 'Enterprise Risk & Solvency Frameworks'
    },
    finance: {
      name: authorName || 'Alister Thorne',
      role: 'Wealth Structuring Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      expertise: 'Macroeconomics & Strategic Asset Allocation'
    },
    'car-diy': {
      name: authorName || 'Stefan Kowalski',
      role: 'Master Automotive Technician & Author',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      expertise: 'Master Diagnostics & Mechanical Fabrication'
    },
    'ai-news': {
      name: authorName || 'Sofia Chen-Lindt',
      role: 'AI Ethics & Systems Fellow',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      expertise: 'Digital Governance & Machine Learning Ethics'
    }
  };

  const calculatedCpc = estimatedCpcEur ? Number(estimatedCpcEur) : getEstimatedCategoryCpc(safeCategory);

  const newArticle: Article = {
    id: 'art-' + Date.now(),
    slug,
    title: cleanTitle,
    category: safeCategory,
    summary: summary || String(content).slice(0, 180) + '...',
    content: content || summary,
    publishedAt: new Date().toISOString(),
    author: authorsMap[safeCategory],
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [safeCategory.toUpperCase(), 'Market Brief'],
    imageUrl: imageUrl || getDefaultImage(safeCategory),
    sourceName: sourceName || 'Automated Digest',
    sourceUrl: sourceUrl || 'https://news.google.com',
    readingTimeMinutes: readingTime,
    cpcKeywords: Array.isArray(cpcKeywords) && cpcKeywords.length > 0 ? cpcKeywords : [cleanTitle.toLowerCase()],
    estimatedCpcEur: calculatedCpc,
    makePipelineId: 'pipe-' + Date.now().toString(36)
  };

  articles.unshift(newArticle);
  saveArticles();

  // Privacy protection: do not log client IP addresses
  const logItem: WebhookLog = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    sender: 'Authenticated Webhook Ingestion',
    status: 'success',
    articleTitle: cleanTitle,
    category: safeCategory,
    cpcEstimate: calculatedCpc,
    payloadSnippet: JSON.stringify({
      title: cleanTitle,
      category: safeCategory,
      source: sourceName || 'External Ingest'
    }).slice(0, 140)
  };
  webhookLogs.unshift(logItem);
  saveLogs();

  res.status(201).json({
    success: true,
    message: 'Article successfully ingested and published',
    article: {
      id: newArticle.id,
      slug: newArticle.slug,
      title: newArticle.title,
      category: newArticle.category,
      url: `/article/${newArticle.slug}`,
      cpcKeywords: newArticle.cpcKeywords,
      estimatedCpcEur: newArticle.estimatedCpcEur
    }
  });
});

// 4. POST /api/webhook/simulate - Mounted ONLY in non-production environments and protected with auth
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/webhook/simulate', requireApiKey, (req: Request, res: Response) => {
    const { category } = req.body;

    const mockDispatches = [
      {
        category: 'insurance',
        title: 'Capital Solvency Standards 2026: What Policyholders Need to Know',
        summary: 'Updated technical amendments provide enhanced capital stability buffers while stabilizing long-term annuities and property indemnity terms.',
        content: `Insurance supervisors have finalized technical amendments to the regulatory solvency architecture.\n\n### Enhanced Long-Term Guarantee Measures\nUnder the revised framework, domestic insurers gain greater flexibility to hold long-term infrastructure bonds without excessive punitive capital charges.\n\nFor commercial policyholders and private pension annuitants, this stabilizes policy payout projections against volatile sovereign bond spread oscillations.`,
        tags: ['Capital Solvency', 'Commercial Coverage', 'Policyholder Protections'],
        sourceName: 'Actuarial Standards Dispatch',
        sourceUrl: 'https://www.actuaries.org',
        cpcKeywords: ['commercial property insurance broker', 'solvency audit compliance'],
        estimatedCpcEur: 39.2
      },
      {
        category: 'finance',
        title: 'Dividend Aristocrats: Resilient High-Cashflow Equities for Long-Term Portfolios',
        summary: 'Analyzing blue-chip industrial and healthcare stalwarts with over 20 consecutive years of dividend growth and resilient free cashflow margins.',
        content: `In an era of fluctuating central bank interest benchmarks, dividend growth equities continue to offer a defensive, tax-advantaged hedge for wealth preservation.\n\n### Screening for Quality & Free Cash Flow Coverage\nWe screened for companies maintaining uninterrupted annual dividend hikes spanning two economic cycles and low debt ratios.`,
        tags: ['Dividend Investing', 'Equities', 'Wealth Strategy', 'Passive Income'],
        sourceName: 'Market Insights Journal',
        sourceUrl: 'https://www.treasurymarkets.org',
        cpcKeywords: ['best dividend stocks', 'wealth management advisory', 'high yield dividend portfolio'],
        estimatedCpcEur: 33.1
      },
      {
        category: 'car-diy',
        title: 'Diagnosing Common Rail Diesel High-Pressure Fuel Pump Failures DIY',
        summary: 'How to inspect fuel filter metal shavings, measure rail pressure transducer voltages, and purge high-pressure fuel systems safely at home.',
        content: `High-pressure fuel pumps are susceptible to internal roller cam delamination if subjected to low-lubricity fuel or moisture contamination.\n\n### Visual Metal Shaving Inspection\n1. Remove the fuel metering unit solenoid using a Torx driver.\n2. Direct a bright inspection light into the intake gallery. Any presence of micro flakes confirms pump failure.\n3. Warning: If shavings are detected, do not start the engine to avoid circulating filings through injectors.`,
        tags: ['Diesel Repair', 'Fuel System DIY', 'Car Maintenance'],
        sourceName: 'Auto Diagnostics Forum',
        sourceUrl: 'https://www.autodiagnostics.org',
        cpcKeywords: ['diesel fuel pump repair cost', 'diy auto repair tutorial'],
        estimatedCpcEur: 21.8
      },
      {
        category: 'ai-news',
        title: 'Green Computing Standards: Measuring Energy Efficiency per Token in Foundation Models',
        summary: 'Standardization institutes introduce unified environmental efficiency metrics for generative artificial intelligence compute clusters.',
        content: `Energy consumption in training and deploying frontier AI models has spurred regulatory agencies to establish binding environmental accountability standards.\n\n### The Energy-Efficiency Disclosure Rulebook\nCloud providers and model publishers must disclose standardized energy consumption metrics including Watt-hours per 1,000 output tokens.`,
        tags: ['Green AI', 'Energy Standards', 'Compute Clusters'],
        sourceName: 'Digital Economy Desk',
        sourceUrl: 'https://www.techreview.org',
        cpcKeywords: ['green data center hosting', 'sustainable ai computing', 'enterprise ai server hardware'],
        estimatedCpcEur: 35.8
      }
    ];

    let chosen = mockDispatches.find((d) => d.category === category);
    if (!chosen) {
      chosen = mockDispatches[Math.floor(Math.random() * mockDispatches.length)];
    }

    const cleanTitle =
      chosen.title +
      ' [' +
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
      ']';
    const slug =
      chosen.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 6);

    const newArticle: Article = {
      id: 'art-' + Date.now(),
      slug,
      title: cleanTitle,
      category: chosen.category as Category,
      summary: chosen.summary,
      content: chosen.content,
      publishedAt: new Date().toISOString(),
      author: {
        name: 'Editorial Staff',
        role: 'Research Analyst',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        expertise: 'Automated Research Digest'
      },
      tags: chosen.tags,
      imageUrl: getDefaultImage(chosen.category as Category),
      sourceName: chosen.sourceName,
      sourceUrl: chosen.sourceUrl,
      readingTimeMinutes: 4,
      cpcKeywords: chosen.cpcKeywords,
      estimatedCpcEur: chosen.estimatedCpcEur,
      makePipelineId: 'pipe-sim-' + Date.now().toString(36)
    };

    articles.unshift(newArticle);
    saveArticles();

    const logItem: WebhookLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      sender: 'Authenticated Development Simulation',
      status: 'simulated',
      articleTitle: cleanTitle,
      category: chosen.category as Category,
      cpcEstimate: chosen.estimatedCpcEur,
      payloadSnippet: JSON.stringify({
        scenario: 'Simulated Ingest',
        crawledCategory: chosen.category,
        title: cleanTitle
      }).slice(0, 140)
    };
    webhookLogs.unshift(logItem);
    saveLogs();

    res.json({
      success: true,
      message: 'Simulation completed successfully',
      article: newArticle,
      log: logItem
    });
  });
}

// 5. GET /api/webhook/logs - Secured with requireApiKey (Privacy preserved: zero raw IP addresses)
app.get('/api/webhook/logs', requireApiKey, (_req: Request, res: Response) => {
  res.json({ logs: webhookLogs.slice(0, 50) });
});

// NOTE: GET /api/make-config was permanently DELETED to prevent exposing API keys, curl commands, or blueprints.

// 6. GET /api/stats (Public aggregation metrics)
app.get('/api/stats', (_req: Request, res: Response) => {
  const counts: Record<Category, number> = {
    insurance: 0,
    finance: 0,
    'car-diy': 0,
    'ai-news': 0
  };

  let totalCpc = 0;
  for (const a of articles) {
    if (counts[a.category] !== undefined) {
      counts[a.category]++;
    }
    totalCpc += a.estimatedCpcEur || 0;
  }

  const avgCpc = articles.length ? (totalCpc / articles.length).toFixed(2) : '0.00';

  res.json({
    totalArticles: articles.length,
    categoryCounts: counts,
    averageCpcEur: Number(avgCpc),
    totalWebhookInvocations: webhookLogs.length
  });
});

// 7. GET /robots.txt - Standard crawler directive for European & American search engines
app.get('/robots.txt', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`);
});

// 8. GET /sitemap.xml - Dynamic XML sitemap for Google Search Console & Bing Webmaster
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/?category=finance`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/?category=insurance`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/?category=car-diy`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/?category=ai-news`, priority: '0.9', changefreq: 'daily' }
  ];

  const articleUrls = articles.map((a) => ({
    loc: `${baseUrl}/article/${a.slug}`,
    lastmod: new Date(a.publishedAt).toISOString().split('T')[0],
    priority: '0.8',
    changefreq: 'weekly'
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...articleUrls]
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// 9. GET /ads.txt - AdSense Authorized Digital Sellers file
app.get('/ads.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`);
});

// 10. POST /api/contact - Editorial & Reader contact endpoint with strict validation & privacy protection
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/contact', contactLimiter, (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
    return res.status(400).json({ success: false, error: 'Valid name is required (max 100 characters).' });
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 254) {
    return res.status(400).json({ success: false, error: 'Valid email address is required.' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 100) {
    return res.status(400).json({ success: false, error: 'Subject is required (max 100 characters).' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5 || message.length > 3000) {
    return res.status(400).json({ success: false, error: 'Message must be between 5 and 3000 characters.' });
  }

  // Privacy protection: Zero logging of personal data (name, email, message) to stdout/logs
  console.log(`[Contact] Received sanitized inquiry: category="${subject.trim().slice(0, 30)}"`);

  res.json({ success: true, message: 'Your message has been received by the editorial desk.' });
});

// Explicit 404 handler for any unmapped /api/* endpoints
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Production / Dev Vite Integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZP Articles] Server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
