import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore }) => {
  return (
    <div className="relative bg-[#FDD468] rounded-[26px] p-6 sm:p-8 overflow-hidden shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#EAC458]">
      {/* Background soft lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>

      {/* Left Text content */}
      <div className="space-y-3 z-10 max-w-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2238] tracking-tight">
          Hey there!
        </h2>
        <p className="text-xs sm:text-sm text-[#3E3827] leading-relaxed">
          Welcome to your curated daily reader. Explore fresh diagnostics, policy insights, and breakthroughs across our four core sections.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onExplore}
            className="px-6 py-3 rounded-2xl bg-[#1E2238] text-white text-xs font-bold hover:bg-[#2C3150] transition-transform active:scale-98 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right side illustration matching the vector character at desk in download.jpg */}
      <div className="relative z-10 w-44 sm:w-56 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-sm"
        >
          {/* Desk shadow & surface */}
          <ellipse cx="100" cy="148" rx="80" ry="8" fill="#E8BD4D" />
          <rect x="30" y="96" width="140" height="6" rx="3" fill="#6A5137" />
          <rect x="42" y="102" width="6" height="46" rx="2" fill="#523C27" />
          <rect x="152" y="102" width="6" height="46" rx="2" fill="#523C27" />

          {/* Computer monitor */}
          <rect x="68" y="44" width="64" height="44" rx="5" fill="#FFFFFF" stroke="#E2D0B6" strokeWidth="2" />
          <rect x="74" y="50" width="52" height="32" rx="3" fill="#D5F4F7" />
          <circle cx="100" cy="66" r="6" fill="#2B7A78" />
          {/* Stand */}
          <rect x="97" y="88" width="6" height="8" fill="#B0A493" />
          <rect x="88" y="96" width="24" height="3" rx="1.5" fill="#B0A493" />

          {/* Character Body */}
          {/* Torso in coral shirt */}
          <path d="M136 78 C136 70 148 70 148 78 L152 110 L130 110 Z" fill="#E85E5A" />
          {/* Arms typing */}
          <path d="M134 84 L114 92 L118 95" stroke="#E85E5A" strokeWidth="4" strokeLinecap="round" />
          {/* Head & Hair */}
          <circle cx="142" cy="56" r="11" fill="#FAD1B6" />
          {/* Hair (Brown bob) */}
          <path d="M131 56 C131 46 153 46 153 56 C153 66 149 68 149 68 C144 64 140 64 135 68 C131 68 131 60 131 56 Z" fill="#513627" />
          {/* Eyes & Smile */}
          <circle cx="138" cy="56" r="1.2" fill="#1E2238" />
          <circle cx="144" cy="56" r="1.2" fill="#1E2238" />
          <path d="M140 60 Q141 62 143 60" stroke="#1E2238" strokeWidth="1" strokeLinecap="round" />
          {/* Glasses */}
          <rect x="135" y="53" width="6" height="5" rx="1.5" stroke="#1E2238" strokeWidth="1" fill="none" />
          <rect x="142" y="53" width="6" height="5" rx="1.5" stroke="#1E2238" strokeWidth="1" fill="none" />
          <line x1="141" y1="55" x2="142" y2="55" stroke="#1E2238" strokeWidth="1" />

          {/* Chair back */}
          <rect x="148" y="68" width="6" height="42" rx="3" fill="#1E2238" />

          {/* Potted plant / Coffee Mug */}
          <rect x="156" y="86" width="9" height="10" rx="2" fill="#FFFFFF" />
          <ellipse cx="160.5" cy="86" rx="4.5" ry="1.5" fill="#B8A78F" />
          <path d="M165 89 C167 89 167 92 165 92" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  );
};
