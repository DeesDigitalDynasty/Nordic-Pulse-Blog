import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface SponsorBannerProps {
  variant?: 'sidebar' | 'inline' | 'mobile';
  category?: string;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({
  variant = 'sidebar',
  category = 'finance'
}) => {
  const sponsors: Record<string, { brand: string; title: string; subtitle: string; cta: string; image: string }> = {
    insurance: {
      brand: 'Acuity Risk Index',
      title: 'Next-Gen Commercial Risk Diagnostics & Policy Verification',
      subtitle: 'Real-time telemetry and actuarial scoring for modern enterprises.',
      cta: 'Learn More',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80'
    },
    finance: {
      brand: 'Apex Capital Vault',
      title: 'Automated Yield Management & Cash Reserve Portfolios',
      subtitle: 'Institutional grade asset protection with multi-bank diversification.',
      cta: 'Explore Solutions',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
    },
    'car-diy': {
      brand: 'Precision Diagnostic Pro',
      title: 'Professional Bluetooth OBD-II CAN Bus Scanner & EPB Tool',
      subtitle: 'Full system vehicle diagnostics with real-time bi-directional control.',
      cta: 'View Hardware',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80'
    },
    'ai-news': {
      brand: 'Synthetix Cloud',
      title: 'Private AI Inference & High-Throughput Sovereign Clusters',
      subtitle: 'Zero-latency dedicated model deployment with full data perimeter isolation.',
      cta: 'Deploy Cluster',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    }
  };

  const ad = sponsors[category] || sponsors.finance;

  if (variant === 'inline') {
    return (
      <div className="w-full my-6 bg-gradient-to-r from-[#FAF6ED] to-white/90 backdrop-blur-xl border border-[#E8DFC8] rounded-[24px] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-[#E8DFC8]">
            <img src={ad.image} alt={ad.brand} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FCEFD5] text-[#1E2238] border border-[#E8DFC8]">
                Sponsored
              </span>
              <span className="text-xs font-semibold text-[#666B80]">{ad.brand}</span>
            </div>
            <h4 className="text-sm font-bold text-[#1E2238] leading-tight">{ad.title}</h4>
            <p className="text-[11px] text-[#666B80] line-clamp-1">{ad.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open('https://google.com', '_blank')}
          className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E2238] text-white text-xs font-semibold hover:bg-[#2C3150] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>{ad.cta}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    );
  }

  // Sidebar or mobile card unit
  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FCEFD5] text-[#1E2238] border border-[#E8DFC8]">
          Sponsored
        </span>
        <span className="text-[11px] font-medium text-[#7E8398]">{ad.brand}</span>
      </div>

      <div className="aspect-[16/9] rounded-2xl overflow-hidden relative shadow-inner">
        <img src={ad.image} alt={ad.brand} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-bold truncate">
          {ad.brand}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-[#1E2238] leading-snug">{ad.title}</h4>
        <p className="text-[11px] text-[#666B80] line-clamp-2 leading-relaxed">{ad.subtitle}</p>
      </div>

      <button
        type="button"
        onClick={() => window.open('https://google.com', '_blank')}
        className="w-full py-2.5 rounded-xl bg-[#1E2238] text-white text-xs font-semibold hover:bg-[#2C3150] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
      >
        <span>{ad.cta}</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};
