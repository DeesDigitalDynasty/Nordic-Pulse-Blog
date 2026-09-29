import React from 'react';
import { Article } from '../types';
import { SponsorBanner } from './SponsorBanner';
import { BookOpen, Layers, Clock, Sparkles, ArrowUpRight } from 'lucide-react';
import { calculateReadingTime } from '../data/seedArticles';

interface RightWidgetsProps {
  articles: Article[];
  onSelectArticle: (a: Article) => void;
  category?: string;
}

export const RightWidgets: React.FC<RightWidgetsProps> = ({
  articles,
  onSelectArticle,
  category = 'finance'
}) => {
  // Top digest articles
  const digestArticles = articles.slice(0, 4);

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
      {/* 1. Mint / Cyan Pastel Stat Card */}
      <div className="bg-[#D5F4F7] text-[#1E2238] rounded-[24px] p-5 flex items-center gap-4 shadow-sm border border-[#B9E9EC]">
        <div className="w-12 h-12 rounded-2xl bg-[#1E2238] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Layers className="w-5 h-5 text-[#D5F4F7]" />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight leading-none text-[#1E2238]">
            4
          </div>
          <div className="text-xs font-medium text-[#4D6769] mt-1">
            Curated Verticals
          </div>
        </div>
      </div>

      {/* 2. Lavender / Lilac Pastel Stat Card */}
      <div className="bg-[#E9E0FA] text-[#1E2238] rounded-[24px] p-5 flex items-center gap-4 shadow-sm border border-[#D8C7F5]">
        <div className="w-12 h-12 rounded-2xl bg-[#1E2238] text-white flex items-center justify-center shrink-0 shadow-xs">
          <BookOpen className="w-5 h-5 text-[#E9E0FA]" />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight leading-none text-[#1E2238]">
            {articles.length}
          </div>
          <div className="text-xs font-medium text-[#5F5474] mt-1">
            Articles Available
          </div>
        </div>
      </div>

      {/* 3. Soft Salmon / Pink Pastel Stat Card */}
      <div className="bg-[#FCD8DE] text-[#1E2238] rounded-[24px] p-5 flex items-center gap-4 shadow-sm border border-[#F5C2CB]">
        <div className="w-12 h-12 rounded-2xl bg-[#1E2238] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Clock className="w-5 h-5 text-[#FCD8DE]" />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight leading-none text-[#1E2238]">
            3.5 min
          </div>
          <div className="text-xs font-medium text-[#7C545C] mt-1">
            Average Read Time
          </div>
        </div>
      </div>

      {/* 4. Daily Digest & Top Articles Card (No dates, no days of week) */}
      <div className="bg-white rounded-[24px] border border-[#EDE8DB] p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FDD468]" />
            <span className="text-xs font-bold text-[#1E2238]">Daily Digest</span>
          </div>
          <span className="text-[10px] font-semibold text-[#1E2238] bg-[#FCEFD5] border border-[#E8DFC8] px-2 py-0.5 rounded-full">
            Featured
          </span>
        </div>

        {/* Top Articles Digest List */}
        <div className="space-y-3 pt-1">
          {digestArticles.map((art, i) => {
            const readTime = calculateReadingTime(art.content || art.summary, 225);
            return (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group cursor-pointer space-y-1 pb-3 border-b border-[#F4EFE6] last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[#7E8398]">
                    {art.category.replace('-', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {readTime}m read
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1E2238] group-hover:text-[#4F5472] transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Neat Desktop Ad Slot (Non-intrusive, Liquid Glass Style) */}
      <div className="pt-1">
        <SponsorBanner variant="sidebar" category={category} />
      </div>
    </div>
  );
};
