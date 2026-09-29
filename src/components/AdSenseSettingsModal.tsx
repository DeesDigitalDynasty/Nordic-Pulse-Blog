import React, { useState } from 'react';
import { AdSenseConfig } from '../types';
import {
  X,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Layers,
  Globe,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdSenseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdSenseConfig;
  onUpdateConfig: (config: AdSenseConfig) => void;
}

export const AdSenseSettingsModal: React.FC<AdSenseSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig
}) => {
  const [publisherId, setPublisherId] = useState(config.publisherId);
  const [adsEnabled, setAdsEnabled] = useState(config.adsEnabled);
  const [previewMode, setPreviewMode] = useState(config.previewMode);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateConfig({
      publisherId,
      adsEnabled,
      previewMode,
      autoAds: config.autoAds
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const cpcBreakdown = [
    {
      vertical: 'European Insurance',
      cpcRange: '€28.00 – €52.00',
      rpmEst: '€45 – €85',
      highIntentKeywords: 'Cyber liability, NIS2 underwriting, Telematics motor tariffs, PKV/GKV health switch'
    },
    {
      vertical: 'European Wealth & Finance',
      cpcRange: '€24.00 – €44.00',
      rpmEst: '€38 – €72',
      highIntentKeywords: 'ECB fixed deposits, cross-border mortgage LTV, MiCA digital custody, dividend aristocrats'
    },
    {
      vertical: 'Auto Repair & DIY Workshop',
      cpcRange: '€16.00 – €30.00',
      rpmEst: '€24 – €48',
      highIntentKeywords: 'OBD2 CAN bus tools, electronic parking brake reset, diesel fuel pump bypass, EV thermal loop'
    },
    {
      vertical: 'Enterprise AI & EU Tech Act',
      cpcRange: '€26.00 – €48.00',
      rpmEst: '€40 – €78',
      highIntentKeywords: 'EU AI Act compliance audit, sovereign cloud inference, supply chain agents, enterprise LLM'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-white border border-[#E5DFD7] rounded-3xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header with 24px margins */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border-b border-[#E5DFD7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A7C72] text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2624]">
                Google AdSense & European High-CPC Optimization
              </h2>
              <p className="text-xs text-[#7D8C86] mt-0.5">
                Maximize revenue with IAB standards, GDPR consent, and high-intent vertical clustering
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white border border-[#E5DFD7] text-[#7D8C86] hover:text-[#1E2624] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* AdSense Configuration Controls */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-4">
            <h3 className="text-sm font-semibold text-[#1E2624] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#4A7C72]" />
              <span>Publisher Setup & Placement Controls</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#52605B] block">
                Google AdSense Publisher ID (Client ID)
              </label>
              <input
                type="text"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5DFD7] text-xs font-mono text-[#1E2624] focus:outline-none focus:border-[#4A7C72]"
              />
              <span className="text-[11px] text-[#7D8C86] block">
                Leave empty or use your AdSense ID once approved by Google.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E5DFD7] cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#1E2624] block">Show Ad Placements</span>
                  <span className="text-[10px] text-[#7D8C86]">Leaderboard, native & sidebar slots</span>
                </div>
                <input
                  type="checkbox"
                  checked={adsEnabled}
                  onChange={(e) => setAdsEnabled(e.target.checked)}
                  className="rounded text-[#4A7C72] focus:ring-[#4A7C72] h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E5DFD7] cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#1E2624] block">Realistic Preview Mode</span>
                  <span className="text-[10px] text-[#7D8C86]">Display realistic EU high-CPC creatives</span>
                </div>
                <input
                  type="checkbox"
                  checked={previewMode}
                  onChange={(e) => setPreviewMode(e.target.checked)}
                  className="rounded text-[#4A7C72] focus:ring-[#4A7C72] h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* European CPC Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1E2624] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8FA89B]" />
                <span>Why European Traffic Yields 3x-5x Higher CPC in These 4 Verticals</span>
              </h3>
              <span className="text-[11px] text-[#4A7C72] font-semibold">Tier-1 EU Benchmark</span>
            </div>

            <div className="border border-[#E5DFD7] rounded-2xl overflow-hidden divide-y divide-[#E5DFD7]">
              {cpcBreakdown.map((item, idx) => (
                <div key={idx} className="p-4 bg-white hover:bg-[#FAF8F5] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E2624]">{item.vertical}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5DFD7] text-[#4A7C72] font-semibold">
                        CPC: {item.cpcRange}
                      </span>
                      <span className="text-[11px] text-[#7D8C86]">Est. RPM: {item.rpmEst}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#52605B]">
                    <strong className="text-[#1E2624]">Semantic Keyword Intent:</strong> {item.highIntentKeywords}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AdSense Compliance & E-E-A-T Checklist */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E2624] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4A7C72]" />
              <span>AdSense European Policy Compliance Architecture Built-In</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#52605B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C72] shrink-0" />
                <span>IAB TCF 2.2 / GDPR Cookie Consent banner</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C72] shrink-0" />
                <span>Prominent E-E-A-T Author Bylines & Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C72] shrink-0" />
                <span>Google-compliant distinct "ADVERTISEMENT" labels</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C72] shrink-0" />
                <span>Strict Editorial Policy & Impressum disclosures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C72] shrink-0" />
                <span>Schema.org NewsArticle & BreadcrumbList markup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C72] shrink-0" />
                <span>High-value original editorial & technical guides</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border-t border-[#E5DFD7] flex items-center justify-between">
          <a
            href="https://adsense.google.com/start/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#4A7C72] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Google AdSense Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DFD7] text-xs font-medium text-[#52605B] hover:text-[#1E2624] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-[#4A7C72] hover:bg-[#3B645C] text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
            >
              {saved ? 'Saved!' : 'Apply Preferences'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
