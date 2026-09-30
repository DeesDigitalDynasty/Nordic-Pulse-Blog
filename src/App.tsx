import React, { useState, useEffect, useRef } from 'react';
import { Article, Category, ConsentPreferences } from './types';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { HeroBanner } from './components/HeroBanner';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { RightWidgets } from './components/RightWidgets';
import { SponsorBanner } from './components/SponsorBanner';
import { Footer } from './components/Footer';
import { PolicyModal } from './components/PolicyModal';
import { GDPRConsentModal } from './components/GDPRConsentModal';
import {
  Filter,
  ChevronDown,
  Check,
  BookOpen,
  Sliders,
  X,
  TrendingUp,
  Wrench,
  Shield,
  Cpu,
  Layers,
  Cookie
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | 'all'>('all');
  const [priorityCategory, setPriorityCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Policy & Consent modals state
  const [policyModal, setPolicyModal] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms' | 'disclaimers' | 'eeat' | 'contact';
  }>({
    isOpen: false,
    tab: 'privacy'
  });

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showFloatingConsentBanner, setShowFloatingConsentBanner] = useState(false);
  const [consentPrefs, setConsentPrefs] = useState<ConsentPreferences | null>(null);

  // Settings state (neutral reader preferences)
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArticles();

    // Check localStorage for consent preferences
    const stored = localStorage.getItem('np_consent_preferences');
    if (stored) {
      try {
        setConsentPrefs(JSON.parse(stored));
      } catch (e) {
        setShowFloatingConsentBanner(true);
      }
    } else {
      setShowFloatingConsentBanner(true);
    }
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (e) {
      console.error('Failed to load articles:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConsent = (prefs: ConsentPreferences) => {
    setConsentPrefs(prefs);
    localStorage.setItem('np_consent_preferences', JSON.stringify(prefs));
    setShowFloatingConsentBanner(false);
  };

  // Filter and prioritize articles
  let filteredArticles = articles.filter((a) => {
    const matchesCat = currentCategory === 'all' || a.category === currentCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    return (
      matchesCat &&
      (a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // If a priority classification is selected in 'all' view, sort that classification first
  if (priorityCategory !== 'all' && currentCategory === 'all') {
    filteredArticles = [...filteredArticles].sort((a, b) => {
      const aMatch = a.category === priorityCategory ? 1 : 0;
      const bMatch = b.category === priorityCategory ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  const categoryTitles: Record<Category | 'all', string> = {
    all: 'Top articles',
    insurance: 'Insurance Articles',
    finance: 'Finance Articles',
    'car-diy': 'Automobiles & DIY Articles',
    'ai-news': 'AI News & Insights'
  };

  const filterOptions: { id: Category | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Default Order', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'finance', label: 'Finance First', icon: <TrendingUp className="w-3.5 h-3.5 text-[#1E5D5B]" /> },
    { id: 'car-diy', label: 'Automobiles & DIY First', icon: <Wrench className="w-3.5 h-3.5 text-[#914620]" /> },
    { id: 'insurance', label: 'Insurance First', icon: <Shield className="w-3.5 h-3.5 text-[#334D7B]" /> },
    { id: 'ai-news', label: 'AI News First', icon: <Cpu className="w-3.5 h-3.5 text-[#55387A]" /> }
  ];

  const activeFilterLabel =
    filterOptions.find((o) => o.id === priorityCategory)?.label || 'Filter Classification';

  return (
    <div className="min-h-screen bg-[#FCEFD5] text-[#1E2238] flex items-center justify-center p-2 sm:p-4 md:p-8 font-sans antialiased">
      {/* Outer App Frame matching reference screenshot (Dark navy slate rounded card) */}
      <div className="w-full max-w-[1520px] bg-[#1E2238] rounded-[30px] sm:rounded-[36px] md:rounded-[42px] p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-2xl flex flex-col">
        {/* Top Bar with functional search and settings */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 border-b border-white/10 mb-4 animate-fade-in">
            <Sidebar
              currentCategory={currentCategory}
              onSelectCategory={(cat) => {
                setCurrentCategory(cat);
                setSelectedArticle(null);
                setMobileMenuOpen(false);
              }}
              onOpenSettings={() => {
                setShowSettingsModal(true);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        )}

        {/* Main Content Layout: Sidebar + Center White Glass Card + Right Widget Stack */}
        <div className="flex flex-col lg:flex-row gap-6 items-start flex-1 min-w-0">
          {/* Left Desktop Sidebar matching reference image */}
          <div className="hidden lg:block">
            <Sidebar
              currentCategory={currentCategory}
              onSelectCategory={(cat) => {
                setCurrentCategory(cat);
                setSelectedArticle(null);
              }}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          </div>

          {/* Center Main White/Liquid Glass Card matching reference screenshot */}
          <main className="flex-1 bg-[#FBF9F4]/98 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-md border border-white/70 min-w-0 w-full overflow-hidden flex flex-col justify-between">
            {selectedArticle ? (
              /* Full Article Reader View */
              <ArticleView
                article={selectedArticle}
                relatedArticles={articles.filter(
                  (a) => a.category === selectedArticle.category && a.id !== selectedArticle.id
                )}
                onBack={() => setSelectedArticle(null)}
                onSelectArticle={(a) => setSelectedArticle(a)}
              />
            ) : (
              /* Articles Dashboard View */
              <div className="space-y-6">
                {/* Hero Greeting Banner (Warm Yellow with Vector Illustration) */}
                <HeroBanner
                  onExplore={() => {
                    const el = document.getElementById('articles-list');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* Section Header with News Classification Filter Dropdown */}
                <div id="articles-list" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2238] tracking-tight">
                        {categoryTitles[currentCategory]}
                      </h2>
                      {priorityCategory !== 'all' && currentCategory === 'all' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEFD5] text-[#1E2238] border border-[#E8DFC8]">
                          {activeFilterLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Showing {filteredArticles.length} curated stories
                    </p>
                  </div>

                  {/* Interactive Classification Filter with Filter Icon */}
                  <div className="relative" ref={filterRef}>
                    <button
                      type="button"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer ${
                        showFilterDropdown || priorityCategory !== 'all'
                          ? 'bg-[#1E2238] text-white border-[#1E2238]'
                          : 'bg-white border-[#EDE8DB] text-[#1E2238] hover:bg-[#FAF6ED]'
                      }`}
                      title="Filter news to view first according to classification"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{priorityCategory === 'all' ? 'Filter News' : activeFilterLabel}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Filter Dropdown Menu */}
                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-60 bg-white/98 backdrop-blur-xl border border-[#EDE8DB] rounded-2xl shadow-xl p-2 z-30 space-y-1 animate-fade-in">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          View First by Classification
                        </div>

                        {filterOptions.map((opt) => {
                          const isSelected = priorityCategory === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setPriorityCategory(opt.id);
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-[#FCEFD5] text-[#1E2238] font-bold'
                                  : 'text-slate-600 hover:bg-[#FAF6ED] hover:text-[#1E2238]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {opt.icon}
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#1E2238]" />}
                            </button>
                          );
                        })}

                        {priorityCategory !== 'all' && (
                          <div className="pt-1 border-t border-[#F0EBE0]">
                            <button
                              type="button"
                              onClick={() => {
                                setPriorityCategory('all');
                                setShowFilterDropdown(false);
                              }}
                              className="w-full text-center py-1.5 text-[11px] text-slate-400 hover:text-[#1E2238] cursor-pointer"
                            >
                              Reset order
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Articles List matching reference image layout */}
                {filteredArticles.length === 0 ? (
                  <div className="py-20 text-center bg-white/60 rounded-[24px] border border-[#EDE8DB] p-6 space-y-3">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
                    <h3 className="font-bold text-base text-[#1E2238]">No articles found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing your search or exploring another vertical.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentCategory('all');
                        setPriorityCategory('all');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1E2238] text-white text-xs font-semibold cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredArticles.map((article, index) => {
                      // Insert a clean inline ad banner on mobile/tablet after the 2nd article
                      const showInlineAd = index === 2;
                      return (
                        <React.Fragment key={article.id}>
                          <ArticleCard
                            article={article}
                            index={index}
                            onSelect={(a) => setSelectedArticle(a)}
                          />
                          {showInlineAd && (
                            <div className="lg:hidden my-4">
                              <SponsorBanner variant="inline" category={article.category} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Widgets Column matching reference image (Only Top Articles & Daily Digest) */}
          <div className="w-full lg:w-auto">
            <RightWidgets
              articles={articles}
              onSelectArticle={(a) => setSelectedArticle(a)}
              category={currentCategory === 'all' ? 'finance' : currentCategory}
            />
          </div>
        </div>

        {/* AdSense & Search Compliant Footer */}
        <Footer
          onSelectCategory={(c) => {
            setCurrentCategory(c);
            setSelectedArticle(null);
          }}
          onOpenPolicyModal={(tab) => setPolicyModal({ isOpen: true, tab })}
          onOpenConsentModal={() => setShowConsentModal(true)}
        />
      </div>

      {/* Floating GDPR & CCPA Consent Banner for First-Time Readers */}
      <AnimatePresence>
        {showFloatingConsentBanner && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-40 max-w-3xl mx-auto"
          >
            <div className="bg-[#1E2238] text-white border border-white/20 rounded-[28px] p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#FDD468] text-[#1E2238] flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold">Privacy & Advertising Notice</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    We use cookies and authorized ad partners to deliver relevant content and measure traffic under GDPR & CCPA.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(true)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  Configure
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveConsent({
                      essential: true,
                      functional: true,
                      advertising: true,
                      analytics: true,
                      updatedAt: new Date().toISOString()
                    });
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#FDD468] hover:bg-[#ebd255] text-[#1E2238] text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#EDE8DB] rounded-[28px] p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1E2238]" />
                <h3 className="font-bold text-base text-[#1E2238]">Reader Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#1E2238] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-[#1E2238] block">Reading Text Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontSize('normal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                      fontSize === 'normal'
                        ? 'bg-[#1E2238] text-white border-[#1E2238]'
                        : 'bg-white text-slate-600 border-[#EDE8DB]'
                    }`}
                  >
                    Standard (15px)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('large')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                      fontSize === 'large'
                        ? 'bg-[#1E2238] text-white border-[#1E2238]'
                        : 'bg-white text-slate-600 border-[#EDE8DB]'
                    }`}
                  >
                    Large Comfort (17px)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1E2238] block">Daily Digest Alerts</span>
                  <span className="text-[11px] text-slate-400">Notify when new reports are added</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="rounded text-[#1E2238] focus:ring-[#1E2238] h-4 w-4"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1E2238] block">Compact Card Spacing</span>
                  <span className="text-[11px] text-slate-400">Tighter list row padding</span>
                </div>
                <input
                  type="checkbox"
                  checked={compactView}
                  onChange={(e) => setCompactView(e.target.checked)}
                  className="rounded text-[#1E2238] focus:ring-[#1E2238] h-4 w-4"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EBE0]">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#1E2238] text-white text-xs font-bold hover:bg-[#2C3150] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global AdSense & Legal Policies Modal */}
      <PolicyModal
        isOpen={policyModal.isOpen}
        onClose={() => setPolicyModal({ ...policyModal, isOpen: false })}
        initialTab={policyModal.tab}
      />

      {/* Global Cookie & Advertising Consent Preferences Modal */}
      <GDPRConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSaveConsent={handleSaveConsent}
        currentPrefs={consentPrefs}
      />
    </div>
  );
}
