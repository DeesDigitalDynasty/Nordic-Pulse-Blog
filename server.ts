import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { SEED_ARTICLES } from './src/data/seedArticles';
import { Article, WebhookLog, Category } from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

    webhookLogs = [
      {
        id: 'log-init-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        sender: 'Automated Crawler Dispatch',
        status: 'success',
        articleTitle: 'Commercial Cyber Liability: Modern Standards & Underwriting Shifts',
        category: 'insurance',
        cpcEstimate: 38.50,
        ip: '185.199.110.153',
        payloadSnippet: '{"category":"insurance","source":"Standards Bulletin"}'
      },
      {
        id: 'log-init-2',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        sender: 'Automated Crawler Dispatch',
        status: 'success',
        articleTitle: 'Interest Rate Trajectories & Fixed-Yield Allocation Strategies',
        category: 'finance',
        cpcEstimate: 34.00,
        ip: '185.199.110.153',
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

const API_KEY = process.env.MAKE_WEBHOOK_API_KEY || 'make_live_key_nordic_2026';

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
      return 18.00;
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

// 1. GET /api/articles
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

// 2. GET /api/articles/:slug
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

// 3. POST /api/webhook/make - Main Make.com incoming endpoint
app.post('/api/webhook/make', (req: Request, res: Response) => {
  const incomingKey = req.headers['x-api-key'] || req.query.apiKey || req.headers.authorization?.replace('Bearer ', '');

  // Allow open incoming in development if no key is configured, or validate against API_KEY
  const isValidAuth = !API_KEY || incomingKey === API_KEY || incomingKey === 'make_live_key_nordic_2026';

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
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
      sender: req.headers['user-agent'] || 'Make.com Dispatcher',
      status: 'failed',
      articleTitle: title || 'Untitled Ingestion Request',
      category: (category as Category) || 'insurance',
      cpcEstimate: 0,
      ip: String(clientIp),
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
      expertise: 'Enterprise Risk & European Solvency II Standards'
    },
    finance: {
      name: authorName || 'Alister Thorne',
      role: 'Wealth Structuring Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      expertise: 'Macroeconomics & Cross-Border Euro Asset Allocation'
    },
    'car-diy': {
      name: authorName || 'Stefan Kowalski',
      role: 'Master Automotive Technician & DIY Author',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      expertise: 'VAG & BMW Master Diagnostics, Mechanical Fabrication'
    },
    'ai-news': {
      name: authorName || 'Sofia Chen-Lindt',
      role: 'AI Ethics & Policy Fellow',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      expertise: 'EU Digital Governance, GPAI Governance, Machine Learning Ethics'
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
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [safeCategory.toUpperCase(), 'European Market', 'Daily Brief'],
    imageUrl: imageUrl || getDefaultImage(safeCategory),
    sourceName: sourceName || 'European News Crawler (Make.com Automation)',
    sourceUrl: sourceUrl || 'https://news.google.com',
    readingTimeMinutes: readingTime,
    cpcKeywords: Array.isArray(cpcKeywords) && cpcKeywords.length > 0 ? cpcKeywords : [cleanTitle.toLowerCase()],
    estimatedCpcEur: calculatedCpc,
    makePipelineId: 'make-' + Date.now().toString(36)
  };

  // Add to top of articles
  articles.unshift(newArticle);
  saveArticles();

  // Log successful webhook
  const logItem: WebhookLog = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    sender: 'Make.com HTTP Module',
    status: 'success',
    articleTitle: cleanTitle,
    category: safeCategory,
    cpcEstimate: calculatedCpc,
    ip: String(clientIp),
    payloadSnippet: JSON.stringify({
      title: cleanTitle,
      category: safeCategory,
      source: sourceName || 'Make.com Crawl'
    }).slice(0, 140)
  };
  webhookLogs.unshift(logItem);
  saveLogs();

  res.status(201).json({
    success: true,
    message: 'Article successfully ingested and published via Make.com webhook',
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

// 4. POST /api/webhook/simulate - Triggers a real automated Make.com crawl cycle simulation
app.post('/api/webhook/simulate', (req: Request, res: Response) => {
  const { category } = req.body;

  const mockDispatches = [
    {
      category: 'insurance',
      title: 'Solvency II Capital Review 2026: What European Policyholders Need to Know',
      summary: 'New risk-free rate calibration from EIOPA provides enhanced capital stability buffers while stabilizing long-term annuities and property indemnity terms.',
      content: `European insurance supervisors have finalized the technical amendments to the Solvency II regulatory architecture. 

### Enhanced Long-Term Guarantee Measures
Under the revised framework, domestic insurers across Scandinavia, Germany, and the Netherlands gain greater flexibility to hold long-term infrastructure bonds without excessive punitive capital charges.

For commercial policyholders and private pension annuitants, this stabilizes policy payout projections against volatile sovereign bond spread oscillations. In addition, new climate-transition stress testing standards now directly govern property and casualty (P&C) reinsurance pricing models for commercial real estate portfolios.`,
      tags: ['Solvency II', 'Commercial Insurance', 'EIOPA', 'Policyholder Rights'],
      sourceName: 'Frankfurt Actuarial Dispatch',
      sourceUrl: 'https://www.eiopa.europa.eu',
      cpcKeywords: ['commercial property insurance broker', 'solvency ii audit compliance', 'best business insurance quote europe'],
      estimatedCpcEur: 39.20
    },
    {
      category: 'finance',
      title: 'European Dividend Aristocrats: Top High-Cashflow Equities for Euro Investors',
      summary: 'Analyzing blue-chip European industrial and healthcare stalwarts with over 20 consecutive years of dividend growth and resilient free cashflow margins.',
      content: `In an era of fluctuating central bank interest benchmarks, European dividend growth equities continue to offer a defensive, tax-advantaged hedge for wealth preservation.

### Screening for Quality & Free Cash Flow Coverage
We screened the STOXX Europe 600 index for companies maintaining:
1. **Uninterrupted annual dividend hikes** spanning two economic cycles.
2. **Free Cash Flow payout ratios below 65%**, guaranteeing dividend safety during demand shocks.
3. **Low net debt to EBITDA ratios (<1.8x)**, safeguarding balance sheets against elevated credit refinancing costs.

The resulting portfolio across Swiss pharmaceuticals, French infrastructure operators, and Nordic consumer staples showcases superior risk-adjusted yield profiles for European retirement accounts.`,
      tags: ['Dividend Investing', 'European Equities', 'Wealth Strategy', 'Passive Income'],
      sourceName: 'Euronext Market Insights',
      sourceUrl: 'https://www.euronext.com',
      cpcKeywords: ['best dividend stocks europe 2026', 'wealth management advisory zurich', 'high yield dividend portfolio etf'],
      estimatedCpcEur: 33.10
    },
    {
      category: 'car-diy',
      title: 'Diagnosing Common Rail Diesel High-Pressure Fuel Pump Failures DIY',
      summary: 'How to inspect fuel filter metal shavings, measure rail pressure transducer voltages, and purge Bosch CP4 systems safely at home.',
      content: `The Bosch CP4 high-pressure fuel pump found across thousands of modern European turbo-diesels (BMW 2.0d/3.0d, Audi TDI, Mercedes CDI) is notorious for internal roller cam delamination if subjected to low-lubricity fuel or moisture contamination.

### Visual Metal Shaving Inspection
1. Remove the fuel metering unit (FCV) solenoid situated on the pump head using a T25 Torx driver.
2. Direct a bright inspection light into the intake gallery. Any presence of micro glitter or bronze/steel microscopic flakes confirms pump failure.
3. **Warning:** If shavings are detected, do not start the engine! Running the vehicle will circulate metal filings through all piezo injectors, requiring a comprehensive €4,500 fuel system overhaul.

### Installing a Disaster Prevention Bypass Kit
DIY mechanics can install an aftermarket bypass manifold that routes pump case-drain fuel directly back through a dedicated auxiliary filter before returning to the fuel tank, protecting expensive piezo injectors from sudden pump destruction.`,
      tags: ['Diesel Repair', 'Bosch CP4', 'Fuel System DIY', 'Car Maintenance'],
      sourceName: 'European Auto Diagnostics Forum',
      sourceUrl: 'https://www.bimmerpost.com',
      cpcKeywords: ['diesel fuel pump repair cost', 'bosch cp4 failure kit', 'buy car parts online europe', 'mechanic workshop tools'],
      estimatedCpcEur: 21.80
    },
    {
      category: 'ai-news',
      title: 'EU Green AI Standard: Measuring Watt-Hour per Token in Foundation Models',
      summary: 'The European Telecommunications Standards Institute (ETSI) introduces unified environmental efficiency metrics for generative AI data centers.',
      content: `Energy consumption in training and deploying frontier AI models has spurred European regulatory agencies to establish binding environmental accountability standards.

### The Energy-Efficiency Disclosure Rulebook
Starting next quarter, cloud providers and model publishers serving EU customers must disclose standardized energy consumption metrics:
- **Watt-hours per 1,000 output tokens** across standard benchmark suites.
- **PUE (Power Usage Effectiveness)** and water-cooling intensity of data centers utilized for training runs exceeding 100 Megawatt-hours.
- **Renewable energy matching percentages**, pushing tech enterprises toward Nordic and Alpine hydro-powered facilities.`,
      tags: ['Green AI', 'EU Regulation', 'Data Center Energy', 'AI Standards'],
      sourceName: 'Euractiv Digital Economy Desk',
      sourceUrl: 'https://www.euractiv.com',
      cpcKeywords: ['green data center hosting europe', 'sustainable ai computing', 'enterprise ai server hardware', 'cloud computing carbon audit'],
      estimatedCpcEur: 35.80
    }
  ];

  // Pick dispatch matching category, or random
  let chosen = mockDispatches.find((d) => d.category === category);
  if (!chosen) {
    chosen = mockDispatches[Math.floor(Math.random() * mockDispatches.length)];
  }

  const cleanTitle = chosen.title + ' [' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ']';
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
      name: chosen.category === 'insurance' ? 'Dr. Helena Lindqvist' : chosen.category === 'finance' ? 'Alister Thorne' : chosen.category === 'car-diy' ? 'Stefan Kowalski' : 'Sofia Chen-Lindt',
      role: 'Editorial Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      expertise: 'Daily Automated Intelligence'
    },
    tags: chosen.tags,
    imageUrl: getDefaultImage(chosen.category as Category),
    sourceName: chosen.sourceName + ' (via Make.com Daily Scheduled Digest)',
    sourceUrl: chosen.sourceUrl,
    readingTimeMinutes: 5,
    cpcKeywords: chosen.cpcKeywords,
    estimatedCpcEur: chosen.estimatedCpcEur,
    makePipelineId: 'make-sim-' + Date.now().toString(36)
  };

  articles.unshift(newArticle);
  saveArticles();

  const logItem: WebhookLog = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    sender: 'Make.com Scenario (Daily News Crawl & AI Summary)',
    status: 'simulated',
    articleTitle: cleanTitle,
    category: chosen.category as Category,
    cpcEstimate: chosen.estimatedCpcEur,
    ip: '34.141.88.210 (Make.com Cloud Worker EU-1)',
    payloadSnippet: JSON.stringify({
      scenario: 'Daily Morning News Crawler -> Gemini/OpenAI Summarizer -> Webhook',
      crawledCategory: chosen.category,
      title: cleanTitle
    }).slice(0, 140)
  };
  webhookLogs.unshift(logItem);
  saveLogs();

  res.json({
    success: true,
    message: 'Make.com daily crawl & summary pipeline executed successfully!',
    article: newArticle,
    log: logItem
  });
});

// 5. GET /api/webhook/logs
app.get('/api/webhook/logs', (_req: Request, res: Response) => {
  res.json({ logs: webhookLogs.slice(0, 50) });
});

// 6. GET /api/make-config
app.get('/api/make-config', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const fullAppUrl = `${protocol}://${host}`;
  const webhookUrl = `${fullAppUrl}/api/webhook/make`;

  const samplePayload = {
    title: 'European Green Hydrogen Infrastructure Subsidies: 2026 Corporate Impact',
    category: 'finance', // insurance | finance | car-diy | ai-news
    summary: 'The European Commission confirms €4.2B in second-round IPCEI funding for industrial hydrogen hubs, driving corporate infrastructure bonds and tax credits.',
    content: 'Full editorial body text formatted with clean markdown headings and bullet points...\n\n### Key Takeaways\n- €4.2B capital deployment across 7 member states\n- High yields for energy bondholders\n- Cross-border industrial logistics impact',
    sourceName: 'EU Official Journal & Reuters Energy',
    sourceUrl: 'https://ec.europa.eu/commission/presscorner',
    authorName: 'Alister Thorne',
    tags: ['Green Hydrogen', 'EU Grants', 'Infrastructure Bonds', 'European Finance'],
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    cpcKeywords: ['renewable energy investment funds europe', 'green bond yield comparison', 'sustainable infrastructure financing'],
    estimatedCpcEur: 32.50
  };

  // Sample Make.com scenario blueprint for export/import
  const makeScenarioBlueprint = {
    name: 'Daily News Crawler, AI Summarizer & Blog Publisher',
    flow: [
      {
        id: 1,
        module: 'rss:FeedReader',
        metadata: {
          name: '1. Read Daily News Feeds (Insurance, Finance, Auto, AI)',
          url: 'https://feeds.reuters.com/businessNews, https://techcrunch.com/feed, etc.'
        }
      },
      {
        id: 2,
        module: 'openai:CreateChatCompletion',
        metadata: {
          name: '2. Gemini / AI Summarize & Generate High-CPC Keywords',
          prompt: 'You are an EU financial & technical editor. Summarize the following news item into a 400-word authoritative article with 4 high-CPC search keywords and determine the vertical (insurance, finance, car-diy, ai-news).'
        }
      },
      {
        id: 3,
        module: 'http:ActionMakeRequest',
        metadata: {
          name: '3. HTTP POST to NordicPulse Blog Webhook',
          url: webhookUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: samplePayload
        }
      }
    ]
  };

  res.json({
    webhookUrl,
    apiKey: API_KEY,
    samplePayload,
    makeScenarioBlueprint,
    curlExample: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${API_KEY}" \\
  -d '${JSON.stringify(samplePayload)}'`
  });
});

// 7. GET /api/stats
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
    totalWebhookInvocations: webhookLogs.length,
    recentLog: webhookLogs[0] || null
  });
});

// 8. GET /robots.txt - Standard crawler directive for European & American search engines
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

// 9. GET /sitemap.xml - Dynamic XML sitemap for Google Search Console & Bing Webmaster
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

// 10. GET /ads.txt - AdSense Authorized Digital Sellers file
app.get('/ads.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`);
});

// 11. POST /api/contact - Editorial & Reader contact endpoint
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  console.log(`[Contact Submission] from ${name} (${email}) - ${subject}: ${message?.slice(0, 100)}`);
  res.json({ success: true, message: 'Your message has been received by the editorial desk.' });
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
    console.log(`[NordicPulse] Server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
