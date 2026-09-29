import React, { useState, useEffect } from 'react';
import { ConsentPreferences } from '../types';
import { Cookie, Shield, Check, X, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GDPRConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConsent: (prefs: ConsentPreferences) => void;
  currentPrefs: ConsentPreferences | null;
}

export const GDPRConsentModal: React.FC<GDPRConsentModalProps> = ({
  isOpen,
  onClose,
  onSaveConsent,
  currentPrefs
}) => {
  const [showCustomise, setShowCustomise] = useState(false);
  const [advertising, setAdvertising] = useState(currentPrefs ? currentPrefs.advertising : true);
  const [analytics, setAnalytics] = useState(currentPrefs ? currentPrefs.analytics : true);
  const [functional, setFunctional] = useState(currentPrefs ? currentPrefs.functional : true);

  useEffect(() => {
    if (currentPrefs) {
      setAdvertising(currentPrefs.advertising);
      setAnalytics(currentPrefs.analytics);
      setFunctional(currentPrefs.functional);
    }
  }, [currentPrefs]);

  if (!isOpen) return null;

  const handleAcceptAll = () => {
    onSaveConsent({
      essential: true,
      functional: true,
      advertising: true,
      analytics: true,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleRejectNonEssential = () => {
    onSaveConsent({
      essential: true,
      functional: false,
      advertising: false,
      analytics: false,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleSaveCustom = () => {
    onSaveConsent({
      essential: true,
      functional,
      advertising,
      analytics,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#FBF9F4] border border-[#EDE8DB] rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-[#1E2238]"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-white border-b border-[#EDE8DB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E2238] text-white flex items-center justify-center shadow-xs">
              <Cookie className="w-5 h-5 text-[#FDD468]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E2238]">
                Privacy & Advertising Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliant with international privacy frameworks (GDPR & CCPA/CPRA)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#F4EFE6] border border-[#EDE8DB] text-slate-500 hover:text-[#1E2238] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-[#3E4560] leading-relaxed">
          <p>
            We and our authorized third-party partners (including Google and certified advertising networks) use cookies and device identifiers to process information such as IP addresses and browsing activity to deliver personalized advertising, measure content engagement, and maintain site security.
          </p>

          <AnimatePresence>
            {showCustomise && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2"
              >
                {/* 1. Essential */}
                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1E2238]">Strictly Necessary (Required)</div>
                    <div className="text-[11px] text-slate-500">
                      Core routing, security verification, and layout preference storage.
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1E2238] px-2.5 py-1 rounded-full bg-[#FCEFD5] border border-[#E8DFC8]">
                    Always Active
                  </span>
                </div>

                {/* 2. Advertising Cookies */}
                <label className="p-4 rounded-2xl bg-white border border-[#EDE8DB] flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#1E2238]">
                      Personalized Display Advertising & Partners
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Enables relevant commercial offers and frequency-capping on ad placements.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={advertising}
                    onChange={(e) => setAdvertising(e.target.checked)}
                    className="rounded text-[#1E2238] focus:ring-[#1E2238] h-4 w-4 ml-4"
                  />
                </label>

                {/* 3. Analytics */}
                <label className="p-4 rounded-2xl bg-white border border-[#EDE8DB] flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#1E2238]">Measurement & Analytics</div>
                    <div className="text-[11px] text-slate-500">
                      Aggregated readership metrics, search performance, and article engagement.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="rounded text-[#1E2238] focus:ring-[#1E2238] h-4 w-4 ml-4"
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setShowCustomise(!showCustomise)}
              className="text-[#1E2238] font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showCustomise ? 'Hide Category Controls' : 'Customize Detailed Choices'}</span>
            </button>
            <span>You can modify preferences anytime in the footer</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 sm:p-8 bg-white border-t border-[#EDE8DB] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#F4EFE6] border border-[#EDE8DB] text-xs font-bold text-slate-700 hover:text-[#1E2238] transition-all cursor-pointer"
          >
            Reject Non-Essential
          </button>

          {showCustomise ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1E2238] hover:bg-[#2C3150] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Save My Preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1E2238] hover:bg-[#2C3150] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Accept All & Continue
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
