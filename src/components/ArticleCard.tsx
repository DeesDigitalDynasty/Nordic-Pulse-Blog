import React from 'react';
import { Article, Category } from '../types';
import { Clock, Eye, ThumbsUp, Shield, TrendingUp, Wrench, Cpu, Bookmark, ArrowUpRight } from 'lucide-react';
import { calculateReadingTime } from '../data/seedArticles';

interface ArticleCardProps {
  article: Article;
  index: number;
  onSelect: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, index, onSelect }) => {
  // Dynamically calculate estimated reading time based on 225 words per minute average reading speed
  const wordCount = ((article.content || '') + ' ' + (article.summary || '')).trim().split(/\s+/).length;
  const readingTime = calculateReadingTime(article.content || article.summary, 225);

  const categoryIcons: Record<Category, React.ReactNode> = {
    insurance: <Shield className="w-3.5 h-3.5 text-[#5B638A]" />,
    finance: <TrendingUp className="w-3.5 h-3.5 text-[#2B7A78]" />,
    'car-diy': <Wrench className="w-3.5 h-3.5 text-[#C4683C]" />,
    'ai-news': <Cpu className="w-3.5 h-3.5 text-[#6D4C94]" />
  };

  const categoryLabels: Record<Category, string> = {
    insurance: 'Insurance',
    finance: 'Finance',
    'car-diy': 'Car Repair & DIY',
    'ai-news': 'AI News'
  };

  const categoryBadgeColors: Record<Category, string> = {
    insurance: 'bg-[#EBF0FA] text-[#334D7B] border-[#D4E0F4]',
    finance: 'bg-[#D5F4F7] text-[#1E5D5B] border-[#B2EBEF]',
    'car-diy': 'bg-[#FCEAE2] text-[#914620] border-[#F6D3C3]',
    'ai-news': 'bg-[#E9E0FA] text-[#55387A] border-[#D8C7F5]'
  };

  // Mock engagement numbers for the reference UI look
  const viewCounts = ['6.5K', '5.3K', '4.2K', '3.8K', '3.1K', '2.8K', '2.4K'];
  const likeCounts = ['3.4K', '3.1K', '2.6K', '2.2K', '1.9K', '1.7K', '1.4K'];
  const views = viewCounts[index % viewCounts.length];
  const likes = likeCounts[index % likeCounts.length];

  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <div
      onClick={() => onSelect(article)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-[22px] bg-white/70 hover:bg-white/95 border border-[#EDE8DB] hover:border-[#D5CEBC] transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(30,34,56,0.06)] cursor-pointer"
    >
      {/* Left section: Number + Square Thumbnail + Title + Date */}
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        {/* Index number styled like reference image (01, 02, ...) */}
        <span className="text-sm font-semibold text-slate-400 font-mono shrink-0 pt-1 sm:pt-0">
          {formattedIndex}
        </span>

        {/* Square App-icon / Image Thumbnail */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] overflow-hidden shrink-0 border border-black/5 bg-[#F4EFE6] relative shadow-xs">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Title and date info */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryBadgeColors[article.category]}`}
            >
              {categoryLabels[article.category]}
            </span>
          </div>

          <h3 className="font-bold text-[#1E2238] text-sm sm:text-base leading-snug group-hover:text-[#4A5580] transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-[11px] text-slate-400 truncate">
            Curated by {article.author.name}
          </p>
        </div>
      </div>

      {/* Right section: Estimated Reading Time + Engagement stats */}
      <div className="flex items-center justify-between md:justify-end gap-5 pl-10 md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#EDE8DB]/60 shrink-0">
        {/* Prominent Estimated Reading Time Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F2E8] border border-[#E8DFCE] text-xs font-semibold text-[#1E2238] shadow-2xs"
          title={`Calculated at 225 words per minute: ~${wordCount} words`}
        >
          <Clock className="w-3.5 h-3.5 text-[#7E8398]" />
          <span>{readingTime} min read</span>
        </div>

        {/* Views */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{views}</span>
        </div>

        {/* Likes / Bookmarks */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
          <span>{likes}</span>
        </div>

        {/* Read action arrow */}
        <div className="w-8 h-8 rounded-xl bg-white border border-[#E8DFCE] flex items-center justify-center text-slate-500 group-hover:bg-[#1E2238] group-hover:text-white group-hover:border-[#1E2238] transition-colors shadow-2xs">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
