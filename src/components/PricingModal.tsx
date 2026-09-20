import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Crown, 
  X, 
  ArrowRight, 
  Loader2, 
  HelpCircle,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SubscriptionTier } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onTierUpdated: (updatedUser: UserAccount) => void;
  onOpenAuth?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTierUpdated,
  onOpenAuth,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentTier: SubscriptionTier = currentUser?.tier || 'free';

  const handleSelectTier = async (tier: 'pro' | 'executive') => {
    setErrorNotice(null);
    setLoadingTier(tier);

    try {
      // If unauthenticated, prompt auth or proceed with guest checkout
      const token = localStorage.getItem('omniapply_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tier,
          guestEmail: currentUser?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      // If simulated sandbox checkout or if direct redirect:
      if (data.sandbox) {
        // Activate sandbox tier immediately if logged in
        if (currentUser) {
          const activateRes = await fetch('/api/billing/activate-tier', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              tier,
              sessionId: data.sessionId,
            }),
          });
          const activateData = await activateRes.json();
          if (activateData.success && activateData.user) {
            onTierUpdated(activateData.user);
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
            setTimeout(() => {
              onClose();
            }, 1200);
            return;
          }
        }
      }

      // If a checkout URL is returned (e.g. Stripe checkout or sandbox session)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      console.error('[Pricing Checkout Error]:', err);
      setErrorNotice(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      const token = localStorage.getItem('omniapply_auth_token');
      const res = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to open billing portal', e);
    }
  };

  const faqs = [
    {
      q: 'How does OmniApply build dossiers from my actual code?',
      a: 'OmniApply analyzes your real GitHub repositories, commit velocity, architectural patterns, and LeetCode problem solve statistics to extract verified proof points. It then injects these authentic achievements into your ATS-formatted resume and cover pitch without hallucination.',
    },
    {
      q: 'Can I cancel or pause my subscription anytime?',
      a: 'Yes, with one click in your billing settings. There are no long-term contracts. If you cancel, you retain full access until the end of your billing cycle.',
    },
    {
      q: 'Is my candidate profile and resume text kept private?',
      a: 'Absolutely. Your resume data and personal portfolio links are encrypted at rest and never sold or used to train public models. You can export or permanently delete your data at any time under GDPR/CCPA settings.',
    },
    {
      q: 'What if I need help getting hired?',
      a: 'Pro and Executive tier users receive priority email and private channel access with our career advisory engineering team, including customized interview battle-plans and offer negotiation game theory.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Crown className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Supercharge Your Career Search
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Launch Special
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deploy an autonomous career agent engineered to maximize callback and interview conversion rates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error banner if checkout fails */}
        {errorNotice && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorNotice}</span>
            <button onClick={() => setErrorNotice(null)} className="text-rose-400 hover:text-rose-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Pricing Cards Container */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[78vh] overflow-y-auto">
          
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly Plans
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'quarterly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Quarterly Pass</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Starter Tier */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950/60 border border-slate-800 relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white">Starter</h3>
                  {currentTier === 'free' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Active Plan
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Basic candidate intelligence and application tracking tools.
                </p>

                <div className="space-y-2.5 mb-8">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>5 Tailored Job Dossiers / mo</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant ATS Parse & Scorecard</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Kanban Application Tracker</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>10 AI Copilot Queries / mo</span>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-default text-center"
              >
                {currentTier === 'free' ? 'Current Tier' : 'Included'}
              </button>
            </div>

            {/* 2. Pro Tier (Highlight) */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-base font-bold text-white">OmniApply Pro</h3>
                  </div>
                  {currentTier === 'pro' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Active Plan
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold text-white">
                    ${billingCycle === 'monthly' ? '24' : '19'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  Your 24/7 autonomous career agent tailored to your real skills.
                </p>

                <div className="space-y-2.5 mb-8">
                  <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> AI Job Dossiers</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-200">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Full Multi-Profile Ingest (GitHub, LeetCode, X)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-200">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Automated Follow-Up Email Sequences</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-200">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Continuous ATS 95%+ Optimization</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-200">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> AI Copilot Queries</span>
                  </div>
                </div>
              </div>

              {currentTier === 'pro' ? (
                <button
                  onClick={handleOpenCustomerPortal}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/40 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Manage Subscription</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSelectTier('pro')}
                  disabled={loadingTier !== null}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loadingTier === 'pro' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade to Pro</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 3. Executive Pass */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950/60 border border-slate-800 relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Executive Pass</h3>
                  </div>
                  {currentTier === 'executive' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Active Plan
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold text-white">$79</span>
                  <span className="text-xs text-slate-400">/ quarter</span>
                </div>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  For senior candidates negotiating multi-offer compensation.
                </p>

                <div className="space-y-2.5 mb-8">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Everything</strong> in Pro Tier</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Offer Negotiation Game Theory AI</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Priority GPU Compute & Zero Queue</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Exportable PDF & Notion Packages</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>1-on-1 Advisory & Live Support</span>
                  </div>
                </div>
              </div>

              {currentTier === 'executive' ? (
                <button
                  onClick={handleOpenCustomerPortal}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Manage Pass</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSelectTier('executive')}
                  disabled={loadingTier !== null}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loadingTier === 'executive' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Executive Pass</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* Guarantee & Security Callout */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">30-Day Money-Back Guarantee</span>
                <p className="text-slate-400 text-[11px]">
                  If OmniApply doesn't increase your interview callbacks within 30 days, receive a 100% full refund with no questions asked.
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">
              Secured with 256-bit TLS Encryption
            </span>
          </div>

          {/* Interactive FAQ Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span>Frequently Asked Questions</span>
            </h4>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full p-3.5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-500 font-mono text-xs">
                      {activeFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {activeFaq === i && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
