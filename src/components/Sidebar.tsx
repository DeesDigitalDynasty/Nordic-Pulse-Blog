import React from 'react';
import { Category } from '../types';
import {
  LayoutDashboard,
  Shield,
  TrendingUp,
  Wrench,
  Cpu,
  Bookmark,
  Sliders,
  PenTool,
  BarChart2,
  Mail,
  CalendarDays,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  currentCategory: Category | 'all';
  onSelectCategory: (c: Category | 'all') => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenSettings
}) => {
  const menuItems = [
    {
      id: 'all' as const,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'insurance' as const,
      label: 'Insurance',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'finance' as const,
      label: 'Finance',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'car-diy' as const,
      label: 'Car Repair & DIY',
      icon: <Wrench className="w-4 h-4" />
    },
    {
      id: 'ai-news' as const,
      label: 'AI News',
      icon: <Cpu className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-full lg:w-60 flex flex-col justify-between shrink-0 text-white select-none">
      <div className="space-y-8">
        {/* Brand Block matching reference image: Yellow ZP icon badge + ZP articles */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-10 h-10 rounded-xl bg-[#FDD468] text-[#1E2238] flex items-center justify-center font-bold shadow-sm">
            <span className="font-mono text-base font-extrabold tracking-tight">ZP</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-none">
              ZP
            </span>
            <span className="text-xs text-slate-300 font-medium block mt-0.5">
              articles
            </span>
          </div>
        </div>

        {/* Navigation items with the exact pastel-pink pill active styling from reference image */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCategory(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#F9C3C9] text-[#1E2238] shadow-sm font-bold scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-[#1E2238]' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 pb-2 px-3">
            <div className="h-px bg-white/10"></div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Version footprint from screenshot */}
      <div className="px-3 pt-6 pb-2 text-[11px] text-slate-500 font-mono">
        Version 1.0.1
      </div>
    </aside>
  );
};
