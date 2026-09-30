import fs from 'node:fs';
import path from 'node:path';
import { SEED_ARTICLES } from '../src/data/seedArticles.js';
import type { Article, WebhookLog } from '../src/types/index.js';

/**
 * Persistence layer.
 * - Upstash Redis (REST) when configured. This is what you want on Vercel.
 * - Local JSON files in ./data for local development.
 * - In-memory fallback otherwise (data is LOST between serverless invocations, a warning is logged).
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const ON_VERCEL = Boolean(process.env.VERCEL);

const DATA_DIR = path.resolve(process.cwd(), 'data');
const memory = new Map<string, string>();
let warned = false;

export const storageMode: 'redis' | 'file' | 'memory' = REDIS_URL && REDIS_TOKEN ? 'redis' : ON_VERCEL ? 'memory' : 'file';

async function redis(command: unknown[]): Promise<any> {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error(`Redis request failed with status ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(`Redis error: ${data.error}`);
  return data.result;
}

async function kvGet(key: string): Promise<string | null> {
  if (storageMode === 'redis') return ((await redis(['GET', key])) as string | null) ?? null;
  if (storageMode === 'file') {
    try {
      return fs.readFileSync(path.join(DATA_DIR, key.replace(/[^a-z0-9_-]/gi, '_') + '.json'), 'utf-8');
    } catch {
      return null;
    }
  }
  if (!warned) {
    console.warn('[store] No Redis configured on Vercel: data will NOT persist. Set UPSTASH_REDIS_REST_URL/TOKEN.');
    warned = true;
  }
  return memory.get(key) ?? null;
}

async function kvSet(key: string, value: string): Promise<void> {
  if (storageMode === 'redis') {
    await redis(['SET', key, value]);
    return;
  }
  if (storageMode === 'file') {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, key.replace(/[^a-z0-9_-]/gi, '_') + '.json'), value, 'utf-8');
    return;
  }
  memory.set(key, value);
}

async function getJson<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const MAX_ARTICLES = 300;
const MAX_LOGS = 100;
const MAX_MESSAGES = 200;

/** Seeds are used ONLY when nothing has ever been stored. Stored articles are never overwritten by a restart. */
export async function getArticles(): Promise<Article[]> {
  const stored = await getJson<Article[]>('nordic_articles');
  if (stored) return stored;
  const seeded = SEED_ARTICLES.map((a) => ({ ...a, status: 'published' as const }));
  await kvSet('nordic_articles', JSON.stringify(seeded));
  return seeded;
}

export async function saveArticles(list: Article[]): Promise<void> {
  const sorted = [...list].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  await kvSet('nordic_articles', JSON.stringify(sorted.slice(0, MAX_ARTICLES)));
}

export async function getLogs(): Promise<WebhookLog[]> {
  return (await getJson<WebhookLog[]>('nordic_logs')) ?? [];
}

export async function addLog(log: WebhookLog): Promise<void> {
  const logs = await getLogs();
  logs.unshift(log);
  await kvSet('nordic_logs', JSON.stringify(logs.slice(0, MAX_LOGS)));
}

export interface ContactMessage {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function getMessages(): Promise<ContactMessage[]> {
  return (await getJson<ContactMessage[]>('nordic_contact')) ?? [];
}

export async function addMessage(msg: ContactMessage): Promise<void> {
  const list = await getMessages();
  list.unshift(msg);
  await kvSet('nordic_contact', JSON.stringify(list.slice(0, MAX_MESSAGES)));
}
