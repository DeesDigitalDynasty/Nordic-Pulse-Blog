import React, { useState, useEffect } from 'react';
import { Category, WebhookLog } from '../types';
import {
  X,
  Zap,
  Copy,
  Check,
  Play,
  ArrowRight,
  Shield,
  TrendingUp,
  Wrench,
  Cpu,
  FileCode,
  Download,
  Terminal,
  Activity,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MakeWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleIngested: () => void;
}

export const MakeWebhookModal: React.FC<MakeWebhookModalProps> = ({
  isOpen,
  onClose,
  onArticleIngested
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'simulate' | 'logs' | 'blueprint'>('setup');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Simulation state
  const [simCategory, setSimCategory] = useState<Category>('insurance');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ title: string; category: string; cpc: number } | null>(null);

  // Live config from server
  const [config, setConfig] = useState<{
    webhookUrl: string;
    apiKey: string;
    samplePayload: any;
    makeScenarioBlueprint: any;
    curlExample: string;
  } | null>(null);

  // Logs state
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      fetchLogs();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/make-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error('Failed to load Make config:', e);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/webhook/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load webhook logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCopy = (text: string, type: 'url' | 'key' | 'json' | 'curl') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'url') setCopiedUrl(true);
      if (type === 'key') setCopiedKey(true);
      if (type === 'json') setCopiedJson(true);
      if (type === 'curl') setCopiedCurl(true);

      setTimeout(() => {
        setCopiedUrl(false);
        setCopiedKey(false);
        setCopiedJson(false);
        setCopiedCurl(false);
      }, 2000);
    }
  };

  const handleSimulateDispatch = async () => {
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: simCategory })
      });
      const data = await res.json();
      if (data.success && data.article) {
        setSimResult({
          title: data.article.title,
          category: data.article.category,
          cpc: data.article.estimatedCpcEur
        });
        fetchLogs();
        onArticleIngested();
      }
    } catch (e) {
      console.error('Failed to simulate:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const downloadBlueprint = () => {
    if (!config?.makeScenarioBlueprint) return;
    const blob = new Blob([JSON.stringify(config.makeScenarioBlueprint, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Make-Scenario-NordicPulse-News-Crawler.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const webhookEndpoint =
    config?.webhookUrl ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/make` : '/api/webhook/make');
  const apiKey = config?.apiKey || 'make_live_key_nordic_2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white border border-[#E5DFD7] rounded-3xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header with spacious 24px margins */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border-b border-[#E5DFD7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A7C72] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2624]">
                Make.com Daily Automated Pipeline
              </h2>
              <p className="text-xs text-[#7D8C86] mt-0.5">
                Crawl daily European news · AI summarization · High-CPC AdSense publication
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

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-b border-[#E5DFD7] bg-[#FAF8F5]/50 flex gap-2 overflow-x-auto scrollbar-none py-2">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'setup'
                ? 'bg-[#1E2624] text-white shadow-xs'
                : 'text-[#52605B] hover:bg-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Webhook Endpoint</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulate')}
            className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'simulate'
                ? 'bg-[#1E2624] text-white shadow-xs'
                : 'text-[#52605B] hover:bg-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-[#4A7C72]" />
            <span>Live Test Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'blueprint'
                ? 'bg-[#1E2624] text-white shadow-xs'
                : 'text-[#52605B] hover:bg-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Make Scenario Blueprint</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-[#1E2624] text-white shadow-xs'
                : 'text-[#52605B] hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Logs ({logs.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: WEBHOOK SETUP */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Endpoint Card */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1E2624] uppercase tracking-wide">
                    POST Webhook URL
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EBF0ED] text-[#4A7C72] font-medium">
                    Ready to Receive
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#E5DFD7] text-xs font-mono text-[#1E2624] truncate select-all">
                    {webhookEndpoint}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(webhookEndpoint, 'url')}
                    className="px-4 py-2.5 rounded-xl bg-[#4A7C72] hover:bg-[#3B645C] text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>

                {/* API Key */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-[#1E2624] block mb-2">
                    Header Authentication (<code className="text-[#4A7C72]">x-api-key</code>)
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#E5DFD7] text-xs font-mono text-[#52605B]">
                      {apiKey}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(apiKey, 'key')}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E5DFD7] text-xs font-medium hover:bg-[#FAF8F5] transition-all cursor-pointer shrink-0"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-[#4A7C72]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payload Schema & Instructions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#1E2624]">
                    JSON Request Body Schema for Make.com HTTP Module
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(JSON.stringify(config?.samplePayload || {}, null, 2), 'json')
                    }
                    className="text-xs text-[#4A7C72] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy JSON Body</span>
                  </button>
                </div>

                <div className="bg-[#1E2624] rounded-2xl p-4 text-xs font-mono text-[#DCE5E0] overflow-x-auto max-h-56">
                  <pre>{JSON.stringify(config?.samplePayload || {}, null, 2)}</pre>
                </div>
              </div>

              {/* cURL Quick Test */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#52605B]">Instant Terminal Test (cURL):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(config?.curlExample || '', 'curl')}
                    className="text-xs text-[#4A7C72] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
                  </button>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E5DFD7] text-[11px] font-mono text-[#52605B] truncate">
                  {config?.curlExample || 'curl -X POST ...'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SIMULATOR */}
          {activeTab === 'simulate' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F3EFEA] border border-[#E5DFD7] space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#1E2624]">
                    Simulate Daily News Crawl & AI Summarizer
                  </h3>
                  <p className="text-xs text-[#52605B]">
                    Choose a European high-CPC vertical to test how Make.com's scheduled news crawler and AI summary pipeline posts an article directly into the blog.
                  </p>
                </div>

                {/* Vertical selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSimCategory('insurance')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      simCategory === 'insurance'
                        ? 'bg-[#1E2624] text-white border-[#1E2624]'
                        : 'bg-white text-[#1E2624] border-[#E5DFD7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Shield className="w-4 h-4 mb-1.5 text-[#8FA89B]" />
                    <div className="text-xs font-semibold">Insurance</div>
                    <div className="text-[10px] opacity-70">~€38.50 CPC</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimCategory('finance')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      simCategory === 'finance'
                        ? 'bg-[#1E2624] text-white border-[#1E2624]'
                        : 'bg-white text-[#1E2624] border-[#E5DFD7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mb-1.5 text-[#8FA89B]" />
                    <div className="text-xs font-semibold">Finance</div>
                    <div className="text-[10px] opacity-70">~€33.10 CPC</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimCategory('car-diy')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      simCategory === 'car-diy'
                        ? 'bg-[#1E2624] text-white border-[#1E2624]'
                        : 'bg-white text-[#1E2624] border-[#E5DFD7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Wrench className="w-4 h-4 mb-1.5 text-[#8FA89B]" />
                    <div className="text-xs font-semibold">Car Repair & DIY</div>
                    <div className="text-[10px] opacity-70">~€21.80 CPC</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimCategory('ai-news')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      simCategory === 'ai-news'
                        ? 'bg-[#1E2624] text-white border-[#1E2624]'
                        : 'bg-white text-[#1E2624] border-[#E5DFD7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Cpu className="w-4 h-4 mb-1.5 text-[#8FA89B]" />
                    <div className="text-xs font-semibold">AI News & EU Act</div>
                    <div className="text-[10px] opacity-70">~€35.80 CPC</div>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateDispatch}
                    disabled={isSimulating}
                    className="w-full py-3.5 rounded-2xl bg-[#4A7C72] hover:bg-[#3B645C] disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Crawling RSS, Generating AI Summary & Posting Webhook...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Trigger Simulated Make.com Ingestion Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Result feedback */}
              <AnimatePresence>
                {simResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-[#EBF0ED] border border-[#8FA89B]/40 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2C534D]">
                      <Check className="w-4 h-4" />
                      <span>Article Successfully Published via Webhook!</span>
                    </div>
                    <p className="text-sm font-serif font-bold text-[#1E2624]">
                      {simResult.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#52605B]">
                      <span>Category: <strong className="capitalize">{simResult.category}</strong></span>
                      <span>·</span>
                      <span>AdSense Estimated CPC: <strong className="text-[#4A7C72]">€{simResult.cpc.toFixed(2)}</strong></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3: MAKE SCENARIO BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[#1E2624]">
                  Automated Make.com Scenario Architecture
                </h3>
                <p className="text-xs text-[#52605B]">
                  Import this scenario into Make.com to set up the daily automated news crawler. It triggers every morning, filters top EU news sources, generates an AdSense-compliant summary, and publishes directly to this blog.
                </p>
              </div>

              {/* Visual 3-step diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-[#8FA89B]/20 text-[#4A7C72] flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h4 className="text-xs font-semibold text-[#1E2624]">Daily Crawler</h4>
                  <p className="text-[11px] text-[#7D8C86]">
                    Monitors Reuters EU, FT, Euronext, ADAC, and AI Office RSS feeds every 24 hours.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-[#8FA89B]/20 text-[#4A7C72] flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h4 className="text-xs font-semibold text-[#1E2624]">AI Summarizer</h4>
                  <p className="text-[11px] text-[#7D8C86]">
                    Generates 400-word E-E-A-T compliant analysis with 4 high-CPC keyword targets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-[#8FA89B]/20 text-[#4A7C72] flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h4 className="text-xs font-semibold text-[#1E2624]">HTTP Ingestion</h4>
                  <p className="text-[11px] text-[#7D8C86]">
                    POSTs JSON payload to NordicPulse endpoint with authenticated <code className="text-[#4A7C72]">x-api-key</code>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={downloadBlueprint}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1E2624] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#2C3834] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Make Blueprint (.json)</span>
                </button>
                <a
                  href="https://www.make.com/en/login"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-[#E5DFD7] text-[#1E2624] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#FAF8F5] transition-all"
                >
                  <span>Open Make.com Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7D8C86]" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: WEBHOOK ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#52605B]">
                  Recent Inbound Webhook Ingestions ({logs.length})
                </span>
                <button
                  type="button"
                  onClick={fetchLogs}
                  className="text-xs text-[#4A7C72] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#7D8C86] bg-[#FAF8F5] rounded-2xl border border-[#E5DFD7]">
                  No webhook dispatches received yet. Try triggering the Live Simulator!
                </div>
              ) : (
                <div className="border border-[#E5DFD7] rounded-2xl overflow-hidden divide-y divide-[#E5DFD7]">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 bg-white hover:bg-[#FAF8F5] transition-colors space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#1E2624] flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.status === 'success' || log.status === 'simulated'
                                ? 'bg-[#4A7C72]'
                                : 'bg-red-500'
                            }`}
                          ></span>
                          {log.sender}
                        </span>
                        <span className="text-[#7D8C86]">
                          {new Date(log.timestamp).toLocaleTimeString('en-GB')} ·{' '}
                          {new Date(log.timestamp).toLocaleDateString('en-GB')}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-[#1E2624]">{log.articleTitle}</p>

                      <div className="flex items-center gap-3 text-[11px] text-[#7D8C86]">
                        <span className="capitalize text-[#4A7C72] font-semibold">{log.category}</span>
                        <span>·</span>
                        <span>Estimated CPC: €{log.cpcEstimate.toFixed(2)}</span>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-[#A1B0AA] truncate max-w-xs">
                          {log.payloadSnippet}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
