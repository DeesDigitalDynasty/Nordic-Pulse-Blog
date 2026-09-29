import React from 'react';
import { ExternalLink, Info, ShieldCheck, Sparkles } from 'lucide-react';

interface AdSenseBannerProps {
  slotType: 'leaderboard' | 'in-feed' | 'in-article' | 'half-page';
  category?: string;
  cpcEstimate?: number;
  previewMode?: boolean;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotType,
  category = 'finance',
  cpcEstimate = 32.50,
  previewMode = true
}) => {
  // Mock high-CPC European advertiser representations for realistic AdSense preview
  const advertiserPresets: Record<string, { brand: string; headline: string; cta: string; disclaimer: string; badge: string }> = {
    insurance: {
      brand: 'Allianz Global Commercial Risk',
      headline: 'EU NIS2 Cyber Liability & Director Indemnity Underwriting',
      cta: 'Request Corporate Quote',
      disclaimer: 'Regulated under EU Solvency II Directive. Terms apply.',
      badge: 'High-CPC Corporate Insurance'
    },
    finance: {
      brand: 'BNP Paribas Private Wealth & Mortgages',
      headline: 'Lock In 4.10% Guaranteed Euro Fixed-Term Yields (2026)',
      cta: 'Explore Fixed Deposits',
      disclaimer: 'Protected up to €100,000 by EU Deposit Guarantee Scheme.',
      badge: 'High-CPC European Wealth'
    },
    'car-diy': {
      brand: 'Bosch Automotive Diagnostics Pro',
      headline: 'Professional OBD-II & CAN Bus Diagnostic Scanner with EPB Reset',
      cta: 'Shop Trade Catalog',
      disclaimer: 'Free 2-day delivery across EU & UK mainland.',
      badge: 'High-CPC Auto Aftermarket'
    },
    'ai-news': {
      brand: 'Mistral Enterprise AI & Sovereign Cloud',
      headline: 'GDPR-Compliant Frontier AI Models Hosted in Sovereign EU Data Centers',
      cta: 'Start Enterprise Trial',
      disclaimer: 'EU AI Act Level-3 Compliant. ISO 27001 Certified.',
      badge: 'High-CPC Enterprise AI'
    }
  };

  const ad = advertiserPresets[category] || advertiserPresets.finance;

  if (slotType === 'leaderboard') {
    return (
      <div className="w-full my-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white border border-[#E5DFD7] rounded-3xl p-5 shadow-xs overflow-hidden transition-all hover:border-[#8FA89B]/60">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7D8C86] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA89B]"></span>
              Advertisement · Google AdSense (IAB 728×90 Leaderboard)
            </span>
            <span className="flex items-center gap-1 text-[#4A7C72]">
              <Sparkles className="w-3 h-3" />
              High European CPC ~€{cpcEstimate.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1E2624] tracking-tight">{ad.brand}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5DFD7] text-[#52605B]">
                  {ad.badge}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-medium text-[#1E2624] leading-snug">
                {ad.headline}
              </h4>
              <p className="text-[11px] text-[#7D8C86]">{ad.disclaimer}</p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.open('https://adsense.google.com', '_blank')}
                className="px-5 py-2.5 rounded-2xl bg-[#4A7C72] hover:bg-[#3B645C] text-white text-xs font-medium tracking-wide transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>{ad.cta}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slotType === 'in-feed') {
    return (
      <div className="h-full bg-gradient-to-br from-[#FAF8F5] to-[#F1EBE4] border border-[#E5DFD7] rounded-3xl p-7 flex flex-col justify-between shadow-xs transition-all hover:border-[#8FA89B]">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#7D8C86] uppercase tracking-wider mb-4">
            <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5DFD7] text-[#4A7C72] font-semibold text-[10px]">
              Sponsored Editorial
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3 h-3 text-[#8FA89B]" />
              Verified Ad
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-xs font-medium text-[#52605B]">{ad.brand}</p>
            <h3 className="text-lg font-semibold text-[#1E2624] leading-snug">
              {ad.headline}
            </h3>
            <p className="text-xs text-[#7D8C86] line-clamp-3">
              European institutions and private operators rely on this platform for direct underwriting and compliance execution.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5DFD7]/80 flex items-center justify-between">
          <span className="text-[11px] text-[#7D8C86]">AdSense Native Unit</span>
          <button
            type="button"
            onClick={() => window.open('https://adsense.google.com', '_blank')}
            className="px-4 py-2 rounded-2xl bg-[#1E2624] text-white text-xs font-medium hover:bg-[#2C3834] transition-all flex items-center gap-1.5"
          >
            <span>{ad.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  if (slotType === 'in-article') {
    return (
      <div className="my-8 p-6 bg-[#F8F6F2] border border-[#E5DFD7] rounded-3xl">
        <div className="flex items-center justify-between text-[11px] text-[#7D8C86] mb-3">
          <span className="uppercase tracking-wider">Advertisement (IAB 300×250 / 336×280)</span>
          <span className="text-[#4A7C72] font-medium">Targeted EU Vertical</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#4A7C72] uppercase tracking-wide">{ad.brand}</span>
            <h4 className="text-base font-semibold text-[#1E2624]">{ad.headline}</h4>
            <p className="text-xs text-[#7D8C86]">{ad.disclaimer}</p>
          </div>
          <button
            type="button"
            onClick={() => window.open('https://adsense.google.com', '_blank')}
            className="shrink-0 px-5 py-2.5 rounded-2xl bg-[#4A7C72] hover:bg-[#3B645C] text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>{ad.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // half-page sticky sidebar
  return (
    <div className="sticky top-28 bg-white border border-[#E5DFD7] rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between text-[11px] text-[#7D8C86] uppercase tracking-wider">
        <span>Advertisement · 300×600</span>
        <span className="text-[#4A7C72] font-medium">EU Premium</span>
      </div>

      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E5DFD7] relative">
        <img
          src={
            category === 'insurance'
              ? 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80'
              : category === 'finance'
              ? 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
              : category === 'car-diy'
              ? 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
          }
          alt={ad.brand}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium">
          {ad.brand}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-base font-semibold text-[#1E2624] leading-snug">{ad.headline}</h4>
        <p className="text-xs text-[#7D8C86] leading-relaxed">{ad.disclaimer}</p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => window.open('https://adsense.google.com', '_blank')}
          className="w-full py-3 rounded-2xl bg-[#4A7C72] hover:bg-[#3B645C] text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>{ad.cta}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-[10px] text-center text-[#7D8C86] flex items-center justify-center gap-1">
        <Info className="w-3 h-3" />
        AdSense European Publisher Network
      </div>
    </div>
  );
};
