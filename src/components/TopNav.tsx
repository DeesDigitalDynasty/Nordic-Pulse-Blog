import React from 'react';
import { Search, Sliders, Menu, X } from 'lucide-react';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenSettings?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  mobileMenuOpen,
  onToggleMobileMenu,
  onOpenSettings
}) => {
  return (
    <header className="flex items-center justify-between gap-4 pb-6">
      {/* Mobile Hamburger toggle */}
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className="lg:hidden p-2.5 rounded-xl bg-[#2A2E46] text-white border border-white/10 cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Search Bar - dark rounded pill matching styling */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search articles by title or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-14 py-2.5 rounded-2xl bg-[#2A2E46] border border-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-semibold px-1 py-0.5 rounded cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right controls: functional preferences button */}
      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#2A2E46] hover:bg-[#353B58] border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          title="Reader Preferences"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">Preferences</span>
        </button>
      )}
    </header>
  );
};
