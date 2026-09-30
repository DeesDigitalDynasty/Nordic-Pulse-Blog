import React, { useEffect, useState } from 'react';
import { Article, Category } from '../types';
import { calculateReadingTime } from '../data/seedArticles';
import { SponsorBanner } from './SponsorBanner';
import {
  ArrowLeft,
  Clock,
  Share2,
  Bookmark,
  Check,
  Calendar,
  Shield,
  TrendingUp,
  Wrench,
  Cpu,
  User,
  ExternalLink
} from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onSelectArticle: (a: Article) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  relatedArticles,
  onBack,
  onSelectArticle
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Dynamic reading time calculation based on 225 words per minute average reading speed
  const textBody = (article.content || '') + ' ' + (article.summary || '');
  const wordCount = textBody.trim().split(/\s+/).length;
  const readingTime = calculateReadingTime(textBody, 225);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categoryIcons: Record<Category, React.ReactNode> = {
    insurance: <Shield className="w-4 h-4 text-[#334D7B]" />,
    finance: <TrendingUp className="w-4 h-4 text-[#1E5D5B]" />,
    'car-diy': <Wrench className="w-4 h-4 text-[#914620]" />,
    'ai-news': <Cpu className="w-4 h-4 text-[#55387A]" />
  };

  const categoryLabels: Record<Category, string> = {
    insurance: 'Insurance',
    finance: 'Finance',
    'car-diy': 'Car Repair & DIY',
    'ai-news': 'AI News'
  };

  const paragraphs = (article.content || article.summary).split('\n\n');
  const midPoint = Math.max(1, Math.floor(paragraphs.length / 2));
  const firstHalf = paragraphs.slice(0, midPoint);
  const secondHalf = paragraphs.slice(midPoint);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#EDE8DB]">
        <button
          type="button"
          onClick={onBack}
          className="group px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-[#EDE8DB] text-xs font-bold text-[#1E2238] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Articles</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
              bookmarked
                ? 'bg-[#F9C3C9] border-[#F9C3C9] text-[#1E2238]'
                : 'bg-white/80 border-[#EDE8DB] text-slate-500 hover:text-[#1E2238]'
            }`}
            title="Bookmark Article"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-[#EDE8DB] text-xs font-semibold text-[#1E2238] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Reading Card with liquid glass styling */}
      <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-[30px] p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-[#FCEFD5] text-[#1E2238] border border-[#E8DFC8] text-xs font-bold flex items-center gap-1.5">
              {categoryIcons[article.category]}
              <span>{categoryLabels[article.category]}</span>
            </span>

            {/* Prominently displayed calculated reading time */}
            <span className="px-3.5 py-1 rounded-full bg-[#1E2238] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-[#FDD468]" />
              <span>{readingTime} min read (~{wordCount} words)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2238] tracking-tight leading-[1.2]">
            {article.title}
          </h1>

          {/* Author Byline */}
          <div className="pt-2 pb-4 border-y border-[#EDE8DB] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {article.author.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-[#EDE8DB]"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-[#1E2238] text-white text-xs font-bold flex items-center justify-center">
                  NP
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-[#1E2238]">{article.author.name}</div>
                <div className="text-[11px] text-slate-400">{article.author.role} · {article.author.expertise}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-[24px] overflow-hidden aspect-[16/9] w-full border border-[#EDE8DB] bg-[#F4EFE6] shadow-sm">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* First Half of Content */}
        <div className="prose max-w-none text-[#2D334A] text-sm sm:text-base leading-relaxed space-y-4 font-normal">
          {firstHalf.map((para, i) => {
            if (para.startsWith('### ')) {
              return (
                <h3 key={i} className="text-xl sm:text-2xl font-bold text-[#1E2238] pt-4">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>

        {/* Inline Responsive Ad Slot (Neatly formatted for desktop & mobile) */}
        <SponsorBanner variant="inline" category={article.category} />

        {/* Second Half of Content */}
        <div className="prose max-w-none text-[#2D334A] text-sm sm:text-base leading-relaxed space-y-4 font-normal">
          {secondHalf.map((para, i) => {
            if (para.startsWith('### ')) {
              return (
                <h3 key={i} className="text-xl sm:text-2xl font-bold text-[#1E2238] pt-4">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>

        {/* Topic Tags */}
        <div className="pt-6 border-t border-[#EDE8DB] space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Article Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-[#F6F2E8] border border-[#E8DFCE] text-xs font-medium text-[#1E2238]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {(article.category === 'finance' || article.category === 'insurance') && (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            General information only. This is not financial, insurance or legal advice. Check the original source and
            consult a qualified professional before making decisions.
          </p>
        )}

        {/* Sourcing reference (neutral reader information) */}
        {article.sourceName && (
          <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#EDE8DB] text-xs text-slate-600 flex items-center justify-between">
            <span>Reference: {article.sourceName}</span>
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[#1E2238] font-semibold underline flex items-center gap-1"
              >
                <span>Read original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[30px] p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#1E2238]">More in this section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((rel) => {
              const relReadingTime = calculateReadingTime(rel.content || rel.summary, 225);
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="p-4 rounded-2xl bg-[#FAF6ED] hover:bg-white border border-[#EDE8DB] cursor-pointer transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-[#1E2238] uppercase">{rel.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relReadingTime} min read
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1E2238] group-hover:text-[#4F5472] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{rel.summary}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
