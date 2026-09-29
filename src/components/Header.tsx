import React, { useState } from 'react';
import { Category } from '../types';
import {
  Shield,
  TrendingUp,
  Wrench,
  Cpu,
  Search,
  Zap,
  DollarSign,
  Cookie,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMakeModal: () => void;
  onOpenAdSenseModal: () => void;
  onOpenConsentModal: () => void;
  onOpenPolicyModal: (tab: 'privacy' | 'terms' | 'eeat' | 'contact') => void;
  makeStatus: { active: boolean; totalLogs: number };
  onResetView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenMakeModal,
  onOpenAdSenseModal,
  onOpenConsentModal,
  onOpenPolicyModal,
  makeStatus,
  onResetView
}) => {
  const [showSearch, setShowSearch] = useState(false);

  const categories: { id: Category | 'all'; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'all', label: 'All Verticals', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'insurance', label: 'Insurance', icon: <Shield className="w-3.5 h-3.5" />, badge: '€38 CPC' },
    { id: 'finance', label: 'Finance', icon: <TrendingUp className="w-3.5 h-3.5" />, badge: '€34 CPC' },
    { id: 'car-diy', label: 'Car Repair & DIY', icon: <Wrench className="w-3.5 h-3.5" />, badge: '€22 CPC' },
    { id: 'ai-news', label: 'AI News', icon: <Cpu className="w-3.5 h-3.5" />, badge: '€36 CPC' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5DFD7]">
      {/* Top micro ticker with EU CPC & Make.com status */}
      <div className="bg-[#F1ECE4] border-b border-[#E5DFD7]/60 px-6 sm:px-10 py-1.5 text-[11px] text-[#52605B] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[#1E2624]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FA89B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C72]"></span>
            </span>
            Make.com Daily News Crawler: Active
          </span>
          <span className="hidden md:inline-block text-[#A1B0AA]">|</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[#4A7C72] font-medium">
            <Sparkles className="w-3 h-3" />
            AdSense EU High-CPC Optimized (GDPR & TCF 2.2 Compliant)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={() => onOpenPolicyModal('eeat')}
            className="hover:text-[#1E2624] transition-colors cursor-pointer"
          >
            E-E-A-T Editorial
          </button>
          <button
            type="button"
            onClick={() => onOpenPolicyModal('privacy')}
            className="hover:text-[#1E2624] transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={onOpenConsentModal}
            className="flex items-center gap-1 text-[#4A7C72] hover:underline cursor-pointer font-medium"
          >
            <Cookie className="w-3 h-3" />
            Consent
          </button>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onResetView}
            className="group text-left cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#4A7C72] text-white flex items-center justify-center font-serif text-xl font-bold tracking-tight shadow-xs transition-transform group-hover:scale-105">
              N
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1E2624] block leading-none">
                NordicPulse
              </span>
              <span className="text-[11px] tracking-wider uppercase text-[#7D8C86] font-medium mt-1 block">
                EU Editorial & Make.com Webhook
              </span>
            </div>
          </button>

          {/* Mobile action triggers */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 rounded-2xl bg-white border border-[#E5DFD7] text-[#52605B] hover:text-[#1E2624]"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenMakeModal}
              className="px-3 py-2 rounded-2xl bg-[#4A7C72] text-white text-xs font-medium flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Make</span>
            </button>
          </div>
        </div>

        {/* Action controls & Search */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:block w-64 lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D8C86]" />
            <input
              type="text"
              placeholder="Search EU articles & keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white border border-[#E5DFD7] text-xs text-[#1E2624] placeholder-[#7D8C86] focus:outline-none focus:border-[#4A7C72] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D8C86] hover:text-[#1E2624]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* AdSense configuration & CPC center */}
          <button
            type="button"
            onClick={onOpenAdSenseModal}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#E5DFD7] hover:border-[#8FA89B] text-xs font-medium text-[#1E2624] transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <DollarSign className="w-4 h-4 text-[#4A7C72]" />
            <span>AdSense & CPC Hub</span>
          </button>

          {/* Make.com Webhook Hub trigger */}
          <button
            type="button"
            onClick={onOpenMakeModal}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#4A7C72] hover:bg-[#3B645C] text-white text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Make.com Pipeline</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
              {makeStatus.totalLogs}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-3 md:hidden overflow-hidden"
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8C86]" />
              <input
                type="text"
                placeholder="Search European articles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-[#E5DFD7] text-xs text-[#1E2624] focus:outline-none focus:border-[#4A7C72]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Navigation Pills */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-3 overflow-x-auto scrollbar-none flex items-center gap-2">
        {categories.map((cat) => {
          const isSelected = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#1E2624] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F3EFEA] text-[#52605B] border border-[#E5DFD7]'
              }`}
            >
              <span className={isSelected ? 'text-[#8FA89B]' : 'text-[#7D8C86]'}>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/15 text-white'
                      : 'bg-[#FAF8F5] text-[#4A7C72] border border-[#E5DFD7]'
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
