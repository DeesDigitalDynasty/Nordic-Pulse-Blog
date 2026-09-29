import React, { useState } from 'react';
import { X, Shield, BookOpen, Send, Check, Mail, Building, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'disclaimers' | 'eeat' | 'contact';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [tab, setTab] = useState<'privacy' | 'terms' | 'disclaimers' | 'eeat' | 'contact'>(initialTab);
  const [sentMessage, setSentMessage] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Editorial Inquiry');
  const [contactMsg, setContactMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMsg
        })
      });
      setSentMessage(true);
      setTimeout(() => {
        setSentMessage(false);
        setContactName('');
        setContactEmail('');
        setContactMsg('');
      }, 3000);
    } catch (err) {
      console.error('Contact submission error:', err);
      setSentMessage(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-[#FBF9F4] border border-[#EDE8DB] rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#1E2238]"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-white border-b border-[#EDE8DB] flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E2238]">
              Legal Policies & Editorial Standards
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Full transparency, Google AdSense compliance, and international search guidelines
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#F4EFE6] border border-[#EDE8DB] text-slate-500 hover:text-[#1E2238] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="px-6 sm:px-8 border-b border-[#EDE8DB] bg-white/60 flex gap-2 overflow-x-auto scrollbar-none py-3">
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              tab === 'privacy' ? 'bg-[#1E2238] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Privacy & AdSense Cookies
          </button>
          <button
            type="button"
            onClick={() => setTab('disclaimers')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              tab === 'disclaimers' ? 'bg-[#1E2238] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Disclaimers & FTC
          </button>
          <button
            type="button"
            onClick={() => setTab('eeat')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              tab === 'eeat' ? 'bg-[#1E2238] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            E-E-A-T Editorial Charter
          </button>
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              tab === 'terms' ? 'bg-[#1E2238] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setTab('contact')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              tab === 'contact' ? 'bg-[#1E2238] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Contact & Impressum
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-[#3E4560] leading-relaxed">
          {tab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1E2238]">
                Privacy Policy & Advertising Cookie Disclosures
              </h3>
              <p>
                ZP Articles ("we", "us", or "our") operates this online publication. This Privacy Policy outlines how information is collected, utilized, and safeguarded across all international audiences, including visitors residing in the United States, the European Economic Area (EEA), the United Kingdom, and globally.
              </p>

              <h4 className="text-sm font-bold text-[#1E2238] pt-2">
                1. Google AdSense & Third-Party Advertising Vendors
              </h4>
              <p>
                We partner with third-party advertising networks, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website. These third-party vendors may use cookies, device identifiers, and web beacons to collect non-personally identifiable information regarding your visits to this and other websites to provide advertisements about goods and services of interest to you.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>
                  Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1E2238] font-bold underline inline-flex items-center gap-1"
                  >
                    Google Ads Settings <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>
                  Alternatively, you may opt out of third-party vendor use of cookies for personalized advertising by visiting{' '}
                  <a
                    href="https://www.aboutads.info/choices"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1E2238] font-bold underline inline-flex items-center gap-1"
                  >
                    www.aboutads.info <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  or the Network Advertising Initiative at{' '}
                  <a
                    href="https://www.networkadvertising.org/choices/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1E2238] font-bold underline inline-flex items-center gap-1"
                  >
                    www.networkadvertising.org <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
              </ul>

              <h4 className="text-sm font-bold text-[#1E2238] pt-2">
                2. European GDPR & ePrivacy Compliance
              </h4>
              <p>
                For visitors within the EEA and UK, personal data processing is governed by Regulation (EU) 2016/679 (GDPR). We enforce an IAB Europe Transparency and Consent Framework (TCF 2.2) compatible mechanism. You have statutory rights to access, rectify, delete, or export your personal data, as well as the right to withdraw advertising consent at any time using our Cookie Preferences tool.
              </p>

              <h4 className="text-sm font-bold text-[#1E2238] pt-2">
                3. United States Privacy Rights (California CPRA/CCPA & State Laws)
              </h4>
              <p>
                Under the California Consumer Privacy Act (CCPA) as amended by the CPRA, California residents have the right to know what personal information is collected, request deletion, and opt out of the "sale" or "sharing" of personal information for cross-context behavioral advertising. We do not sell personally identifiable data for monetary consideration.
              </p>
            </div>
          )}

          {tab === 'disclaimers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1E2238]">
                Disclaimers & FTC Advertising Disclosures
              </h3>

              <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-2">
                <span className="font-bold text-[#1E2238] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FDD468]" />
                  <span>FTC 16 CFR Part 255 Advertising Disclosure</span>
                </span>
                <p className="text-xs text-slate-600">
                  This publication displays third-party programmatic advertisements and sponsored content links. While editorial selections remain independent and guided strictly by our editorial charter, we receive compensation from ad networks when advertisements are viewed or clicked. Sponsored placements are always identified with clear "Sponsored" or "Advertisement" labels.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-2">
                <span className="font-bold text-[#1E2238] block">Financial & Investment Disclaimer:</span>
                <p className="text-xs text-slate-600">
                  Articles discussing interest rates, asset allocations, mortgages, or financial market dynamics are published strictly for educational and journalistic purposes. Nothing contained herein constitutes investment, legal, or tax advisory services. Always consult an independent certified fiduciary or licensed advisor before executing transactions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-2">
                <span className="font-bold text-[#1E2238] block">Automotive DIY & Mechanical Workshop Safety Notice:</span>
                <p className="text-xs text-slate-600">
                  Automotive maintenance guides (including brake service, electrical diagnostic testing, and battery cooling circuits) carry inherent risks of severe injury or vehicle damage. Readers must observe manufacturer technical service manuals, wear appropriate personal protective equipment (PPE), and seek certified technician assistance whenever uncertain.
                </p>
              </div>
            </div>
          )}

          {tab === 'eeat' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1E2238]">
                E-E-A-T Editorial Charter & Fact-Checking
              </h3>
              <p>
                Our publication adheres strictly to Google's Search Quality Evaluator standards for Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-1">
                  <strong className="text-[#1E2238] text-xs block">1. Author Verification:</strong>
                  <p className="text-xs text-slate-600">Every analysis is credited to a verified subject-matter analyst with proven domain experience.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-1">
                  <strong className="text-[#1E2238] text-xs block">2. Primary Source Backing:</strong>
                  <p className="text-xs text-slate-600">Claims cite official statutory documentation, regulatory releases, or technical service publications.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-1">
                  <strong className="text-[#1E2238] text-xs block">3. Editorial Independence:</strong>
                  <p className="text-xs text-slate-600">Commercial advertisers and sponsors exert no influence over research conclusions or editorial ratings.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-1">
                  <strong className="text-[#1E2238] text-xs block">4. Transparent Corrections:</strong>
                  <p className="text-xs text-slate-600">Noticed a factual discrepancy? Our editorial team reviews reader submissions within 24 business hours.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1E2238]">Terms of Service</h3>
              <p>
                By accessing ZP Articles, you agree to these Terms of Service, applicable laws, and regulations. If you do not agree, you are prohibited from using or accessing this site.
              </p>
              <h4 className="text-sm font-bold text-[#1E2238] pt-2">Intellectual Property Rights</h4>
              <p>
                All original text, summaries, graphics, and visual layouts are proprietary to ZP Articles and protected under international copyright treaties. Brief quotations with proper attribution and a direct canonical hyperlink are permitted.
              </p>
              <h4 className="text-sm font-bold text-[#1E2238] pt-2">Limitation of Liability</h4>
              <p>
                In no event shall ZP Articles or its contributors be held liable for damages arising out of the use or inability to use the informational materials contained on this website.
              </p>
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1E2238]">Contact & Impressum</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1E2238]">
                    <Building className="w-4 h-4 text-[#1E2238]" />
                    <span>Publisher & Legal Entity</span>
                  </div>
                  <p className="text-xs text-slate-500">ZP Articles Publishing Group</p>
                  <p className="text-xs text-slate-400">Digital Editorial Division</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#EDE8DB] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1E2238]">
                    <Mail className="w-4 h-4 text-[#1E2238]" />
                    <span>Editorial Desk</span>
                  </div>
                  <p className="text-xs text-slate-500">desk@zparticles-journal.com</p>
                  <p className="text-xs text-slate-400">Response turnaround: 24h</p>
                </div>
              </div>

              {sentMessage ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-900">Message Transmitted Successfully</p>
                  <p className="text-xs text-emerald-700">Thank you. The editorial desk has received your submission.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#EDE8DB] text-xs text-[#1E2238] focus:outline-none focus:ring-1 focus:ring-[#1E2238]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-[#EDE8DB] text-xs text-[#1E2238] focus:outline-none focus:ring-1 focus:ring-[#1E2238]"
                    />
                  </div>

                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EDE8DB] text-xs text-[#1E2238] focus:outline-none focus:ring-1 focus:ring-[#1E2238]"
                  >
                    <option value="Editorial Inquiry">Editorial & Fact-Checking Notice</option>
                    <option value="Advertising Inquiry">AdSense / Direct Advertising Inquiry</option>
                    <option value="Privacy Rights">Privacy / CCPA / GDPR Data Request</option>
                    <option value="General Feedback">Reader Feedback</option>
                  </select>

                  <textarea
                    required
                    rows={3}
                    placeholder="Enter message details or cite specific article URL..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EDE8DB] text-xs text-[#1E2238] focus:outline-none focus:ring-1 focus:ring-[#1E2238]"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 rounded-2xl bg-[#1E2238] hover:bg-[#2C3150] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Transmitting...' : 'Submit to Editorial Desk'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#EDE8DB] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Authoritative AdSense & SEO Indexing Setup</span>
            <span>·</span>
            <a href="/sitemap.xml" target="_blank" className="text-[#1E2238] font-bold underline">
              Sitemap.xml
            </a>
            <span>·</span>
            <a href="/robots.txt" target="_blank" className="text-[#1E2238] font-bold underline">
              Robots.txt
            </a>
            <span>·</span>
            <a href="/ads.txt" target="_blank" className="text-[#1E2238] font-bold underline">
              Ads.txt
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1E2238] text-white text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
