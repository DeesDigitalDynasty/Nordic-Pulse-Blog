export type Category = 'insurance' | 'finance' | 'car-diy' | 'ai-news';

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: Category;
  summary: string;
  content: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    expertise: string;
  };
  tags: string[];
  imageUrl: string;
  sourceName?: string;
  sourceUrl?: string;
  readingTimeMinutes: number;
  /** Internal only. Never returned by the public API. */
  cpcKeywords?: string[];
  /** Internal only. Never returned by the public API. */
  estimatedCpcEur?: number;
  isSponsored?: boolean;
  makePipelineId?: string;
  /** Missing means published (older stored articles). */
  status?: 'published' | 'draft';
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  sender: string;
  status: 'success' | 'failed' | 'simulated';
  articleTitle: string;
  category: Category;
  cpcEstimate?: number;
  /** Deprecated: client IPs are no longer stored. */
  ip?: string;
  payloadSnippet: string;
}

export interface AdSenseConfig {
  publisherId: string;
  adsEnabled: boolean;
  previewMode: boolean;
  autoAds: boolean;
}

export interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  advertising: boolean; // Google AdSense & Personalized Ads
  analytics: boolean;
  updatedAt: string;
}
