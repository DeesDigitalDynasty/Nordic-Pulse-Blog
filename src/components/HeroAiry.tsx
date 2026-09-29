import React from 'react';
import { Category } from '../types';
import { Shield, TrendingUp, Wrench, Cpu, Radio, Sparkles, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroAiryProps {
  currentCategory: Category | 'all';
  onSelectCategory: (c: Category | 'all') => void;
  stats: {
    totalArticles: number;
    categoryCounts: Record<Category, number>;
    averageCpcEur: number;
  };
  onOpenMakeModal: () => void;
}

export const HeroAiry: React.FC<HeroAiryProps> = ({
  currentCategory,
  onSelectCategory,
  stats,
  onOpenMakeModal
}) => {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[#F5F1EB] via-[#FAF8F5] to-[#EAE4DC] border border-[#E5DFD7] rounded-3xl p-8 sm:p-12 shadow-xs"
        >
          {/* Subtle background ambient blob */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#8FA89B]/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            {/* Live Pipeline Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#E5DFD7] text-xs text-[#1E2624]">
              <span className="w-2 h-2 rounded-full bg-[#4A7C72] animate-pulse"></span>
              <span className="font-semibold text-[#4A7C72]">Make.com Daily Ingestion Live</span>
              <span className="text-[#A1B0AA]">·</span>
              <span className="text-[#52605B]">Avg. EU AdSense CPC: €{stats.averageCpcEur.toFixed(2)}</span>
            </div>

            {/* Editorial Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-[#1E2624] leading-[1.15]">
              European Market Intelligence for High-Intent Verticals.
            </h1>

            {/* Concise summary sentence (70% reduced text) */}
            <p className="text-sm sm:text-base text-[#52605B] max-w-2xl leading-relaxed">
              Synthesizing daily developments across European Insurance, Wealth Finance, Automotive DIY diagnostics, and EU AI Act regulations. Automated via Make.com pipelines.
            </p>

            {/* 4 Interactive Category Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <button
                type="button"
                onClick={() => onSelectCategory('insurance')}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                  currentCategory === 'insurance'
                    ? 'bg-[#1E2624] text-white border-[#1E2624] shadow-xs'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#1E2624] border-[#E5DFD7]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-4 h-4 text-[#8FA89B]" />
                  <span className="text-[10px] uppercase font-semibold text-[#4A7C72]">High CPC</span>
                </div>
                <div className="text-xs font-semibold">Insurance</div>
                <div className="text-[11px] opacity-70 mt-0.5">{stats.categoryCounts.insurance || 0} reports · ~€38</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('finance')}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                  currentCategory === 'finance'
                    ? 'bg-[#1E2624] text-white border-[#1E2624] shadow-xs'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#1E2624] border-[#E5DFD7]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-4 h-4 text-[#8FA89B]" />
                  <span className="text-[10px] uppercase font-semibold text-[#4A7C72]">High CPC</span>
                </div>
                <div className="text-xs font-semibold">Finance</div>
                <div className="text-[11px] opacity-70 mt-0.5">{stats.categoryCounts.finance || 0} reports · ~€34</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('car-diy')}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                  currentCategory === 'car-diy'
                    ? 'bg-[#1E2624] text-white border-[#1E2624] shadow-xs'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#1E2624] border-[#E5DFD7]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-4 h-4 text-[#8FA89B]" />
                  <span className="text-[10px] uppercase font-semibold text-[#4A7C72]">High Intent</span>
                </div>
                <div className="text-xs font-semibold">Car Repair & DIY</div>
                <div className="text-[11px] opacity-70 mt-0.5">{stats.categoryCounts['car-diy'] || 0} guides · ~€22</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('ai-news')}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                  currentCategory === 'ai-news'
                    ? 'bg-[#1E2624] text-white border-[#1E2624] shadow-xs'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#1E2624] border-[#E5DFD7]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-4 h-4 text-[#8FA89B]" />
                  <span className="text-[10px] uppercase font-semibold text-[#4A7C72]">Enterprise</span>
                </div>
                <div className="text-xs font-semibold">AI News & EU Act</div>
                <div className="text-[11px] opacity-70 mt-0.5">{stats.categoryCounts['ai-news'] || 0} analyses · ~€36</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
