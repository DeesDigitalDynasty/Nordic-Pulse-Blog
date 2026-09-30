import React from 'react';
import { Category } from '../types';
import { Shield, BookOpen, Cookie, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (c: Category | 'all') => void;
  onOpenPolicyModal: (tab: 'privacy' | 'terms' | 'disclaimers' | 'eeat' | 'contact') => void;
  onOpenConsentModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenPolicyModal,
  onOpenConsentModal
}) => {
  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-white/10 text-white/80 select-none">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
        {/* Brand Col */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDD468] text-[#1E2238] flex items-center justify-center font-bold text-sm">
              ZP
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">ZP Articles</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Independent, research-driven journalism and practical analysis across Finance, Automobiles, Insurance, and Artificial Intelligence.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] text-slate-300 font-medium">
            <CheckCircle2 className="w-3 h-3 text-[#FDD468]" />
            <span>AdSense & International SEO Compliant</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Classifications
          </span>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('finance')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Finance & Wealth
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('car-diy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Automobiles & Workshop DIY
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('insurance')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Commercial & Personal Coverage
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory('ai-news')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Artificial Intelligence Insights
              </button>
            </li>
          </ul>
        </div>

        {/* AdSense Compliance & Legal Policies */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Legal & Standards
          </span>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onOpenPolicyModal('privacy')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Privacy Policy & Cookies
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenPolicyModal('disclaimers')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Disclaimers & FTC Disclosure
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenPolicyModal('eeat')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                E-E-A-T Editorial Charter
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenPolicyModal('terms')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenConsentModal}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 font-semibold"
              >
                <Cookie className="w-3.5 h-3.5 text-[#FDD468]" />
                <span>Cookie Consent Preferences</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Search Engine Indexing & Direct Links */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Index & Support
          </span>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onOpenPolicyModal('contact')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Contact & Impressum
              </button>
            </li>
            <li>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>XML Sitemap (Search Index)</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Robots.txt Directive</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Authorized Sellers (Ads.txt)</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <p>© {new Date().getFullYear()} ZP Articles. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>GDPR / CCPA Protected</span>
          <span>·</span>
          <span>Google Search Console & Bing Indexed</span>
        </p>
      </div>
    </footer>
  );
};
