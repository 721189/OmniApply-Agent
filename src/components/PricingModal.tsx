import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  X, 
  ArrowRight, 
  Loader2, 
  HelpCircle,
  CreditCard,
  Calendar,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SubscriptionTier } from '../types';
import { DoodleBookingModal } from './DoodleBookingModal';
import { 
  DoodleArrow, 
  DoodleCrown, 
  DoodleUnderline, 
  DoodleSparkle, 
  DoodleCircleBadge,
  RazorpayBadge 
} from './DoodleAccents';

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
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false);

  // Load Razorpay Standard Checkout SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).Razorpay) {
      setRazorpayScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayScriptLoaded(true);
    script.onerror = () => {
      console.warn('[Razorpay Notice]: Standard SDK script blocked or offline. Falling back to sandbox payment simulator.');
    };
    document.body.appendChild(script);

    return () => {
      // Keep script cached
    };
  }, []);

  if (!isOpen) return null;

  const currentTier: SubscriptionTier = currentUser?.tier || 'free';

  const handleSelectTier = async (tier: 'pro' | 'executive') => {
    setErrorNotice(null);
    setLoadingTier(tier);

    try {
      const token = localStorage.getItem('omniapply_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Step 1: Create Order via Razorpay Order Service
      const res = await fetch('/api/billing/razorpay/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tier,
          cycle: billingCycle,
          currency,
          email: currentUser?.email,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay checkout');
      }

      // If Razorpay SDK is loaded and we have an order ID, open official Razorpay Checkout modal
      if ((window as any).Razorpay && !orderData.sandbox) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'OmniApply AI',
          description: tier === 'executive' ? 'Executive Pass + Doodle 1:1 Advisory' : 'Pro Autonomous Career Agent',
          image: '/icon.png',
          order_id: orderData.orderId,
          prefill: {
            name: currentUser?.name || 'Tech Candidate',
            email: currentUser?.email || 'candidate@omniapply.ai',
          },
          notes: {
            tier,
            cycle: billingCycle,
          },
          theme: {
            color: '#4f46e5', // Brand Indigo
          },
          modal: {
            ondismiss: function () {
              setLoadingTier(null);
            },
          },
          handler: async function (response: any) {
            // Step 2: Cryptographic Signature Verification
            await verifyAndCompletePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier,
              headers,
            });
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on('payment.failed', function (resp: any) {
          setErrorNotice(resp.error?.description || 'Razorpay payment was not completed.');
          setLoadingTier(null);
        });
        razorpayInstance.open();
        return;
      }

      // Sandbox / Test Mode Simulator Flow (Seamless for Preview & Local Testing)
      const testPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await verifyAndCompletePayment({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'sig_sandbox_verified',
        tier,
        headers,
      });

    } catch (err: any) {
      console.error('[Razorpay Checkout Error]:', err);
      setErrorNotice(err.message || 'Payment initiation failed. Please try again.');
      setLoadingTier(null);
    }
  };

  const verifyAndCompletePayment = async (params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    tier: 'pro' | 'executive';
    headers: Record<string, string>;
  }) => {
    try {
      const verifyRes = await fetch('/api/billing/razorpay/verify-payment', {
        method: 'POST',
        headers: params.headers,
        body: JSON.stringify({
          razorpay_order_id: params.razorpay_order_id,
          razorpay_payment_id: params.razorpay_payment_id,
          razorpay_signature: params.razorpay_signature,
          tier: params.tier,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success && verifyData.user) {
        onTierUpdated(verifyData.user);
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });

        // If upgraded to Executive, show prompt to book Doodle session
        if (params.tier === 'executive') {
          setTimeout(() => {
            setIsDoodleModalOpen(true);
          }, 600);
        } else {
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        throw new Error(verifyData.error || 'Verification failed');
      }
    } catch (e: any) {
      setErrorNotice(e.message || 'Signature verification failed.');
    } finally {
      setLoadingTier(null);
    }
  };

  const faqs = [
    {
      q: 'How does Razorpay payment work?',
      a: 'Razorpay powers fast, secure transactions worldwide. In India, you can pay instantly using UPI (Google Pay, PhonePe, Paytm, CRED), NetBanking across 50+ banks, RuPay/Visa/Mastercard debit and credit cards, and EMI. International credit cards are also accepted seamlessly.',
    },
    {
      q: 'What is the Doodle 1-on-1 Executive Advisory session?',
      a: 'Executive Pass members get direct booking access through Doodle to schedule 1:1 strategy consultations with senior hiring managers and engineers. We review your live offers, calculate equity values, formulate counter-offers, and run realistic mock technical or behavioral interview sessions.',
    },
    {
      q: 'Can I generate Doodle availability polls for recruiters?',
      a: 'Yes! OmniApply integrates with Doodle so you can quickly generate a meeting poll with your open interview slots, saving back-and-forth scheduling headaches with recruiters.',
    },
    {
      q: 'Can I cancel or pause my subscription anytime?',
      a: 'Yes, with one click in your settings. There are no contracts. If you cancel, you retain full access until the end of your billing cycle with zero questions asked.',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <div 
          className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header with Hand-drawn Doodle Accents */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>OmniApply Plans & Upgrades</span>
                  </h2>
                  <RazorpayBadge />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Doodle 1:1</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Autonomous career agent powered by real code verification, secure Razorpay checkout & Doodle coaching.
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

          {/* Error Banner */}
          {errorNotice && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span>{errorNotice}</span>
              <button onClick={() => setErrorNotice(null)} className="text-rose-400 hover:text-rose-200">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Pricing Content */}
          <div className="p-6 sm:p-8 space-y-8 max-h-[78vh] overflow-y-auto">
            
            {/* Top Controls: Currency & Billing Cycle with Doodle Accents */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              
              {/* Currency Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Currency:</span>
                <div className="inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      currency === 'INR'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ₹ INR (UPI / Cards)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      currency === 'USD'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    $ USD (Global)
                  </button>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="relative inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
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

              {/* Doodle Booking Quick Launcher */}
              <button
                onClick={() => setIsDoodleModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-500/20"
              >
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>Open Doodle Scheduler</span>
              </button>
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
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-extrabold text-white">
                      {currency === 'INR' ? '₹0' : '$0'}
                    </span>
                    <span className="text-xs text-slate-400">/ forever</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Basic candidate dossier synthesis and application tracking.
                  </p>

                  <div className="space-y-2.5 mb-8">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>5 Tailored Job Dossiers / mo</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Instant ATS Match Scan & Score</span>
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

              {/* 2. Pro Tier (Highlight with Hand-drawn Doodle Arrow) */}
              <div className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-indigo-950/50 via-slate-900 to-slate-950 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 relative">
                
                {/* Hand-drawn doodle pointer */}
                <div className="absolute -top-10 -right-2 hidden lg:flex items-center gap-1 pointer-events-none">
                  <span className="text-[11px] font-bold text-amber-300 rotate-6 font-mono">
                    High Conversion!
                  </span>
                  <DoodleArrow className="w-8 h-8 text-amber-400 rotate-45" />
                </div>

                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                  <DoodleSparkle className="w-3 h-3 text-amber-300" />
                  <span>Most Popular</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 mt-1">
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

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-extrabold text-white">
                      {currency === 'INR' 
                        ? (billingCycle === 'monthly' ? '₹1,999' : '₹1,599') 
                        : (billingCycle === 'monthly' ? '$24' : '$19')}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your 24/7 autonomous career agent tailored to your code.
                    </p>
                    <DoodleUnderline className="w-32 h-2 text-indigo-400/80 mt-1" />
                  </div>

                  <div className="space-y-2.5 mb-8">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Unlimited</strong> AI Job Dossiers</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Multi-Profile Ingestion (GitHub, LeetCode, X)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Automated Follow-Up Email Sequences</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Continuous 95%+ ATS Score Optimization</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Unlimited</strong> AI Copilot Queries</span>
                    </div>
                  </div>
                </div>

                {currentTier === 'pro' ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-900/60 text-indigo-200 border border-indigo-500/40 flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Active Pro Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectTier('pro')}
                    disabled={loadingTier !== null}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loadingTier === 'pro' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connecting Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay via Razorpay</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 3. Executive Pass (Features Doodle 1:1 Integration + Hand-drawn Doodle Crown) */}
              <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950/60 border border-slate-800 relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <DoodleCrown className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-white">Executive Pass</h3>
                    </div>
                    {currentTier === 'executive' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Active Plan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-extrabold text-white">
                      {currency === 'INR' ? '₹5,999' : '$72'}
                    </span>
                    <span className="text-xs text-slate-400">/ quarter</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    For senior candidates negotiating multi-offer compensation.
                  </p>

                  <div className="space-y-2.5 mb-6">
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
                    <div className="flex items-start gap-2.5 text-xs text-amber-300 font-medium">
                      <Calendar className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>1-on-1 Advisory & Mocks via Doodle</strong></span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Doodle Recruiter Availability Polls</span>
                    </div>
                  </div>

                  {/* Direct Doodle Booking Button for Executive */}
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-amber-300 text-[11px] font-semibold">1:1 Mock & Coaching</span>
                    <button
                      onClick={() => setIsDoodleModalOpen(true)}
                      className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold transition-colors"
                    >
                      Book on Doodle
                    </button>
                  </div>
                </div>

                {currentTier === 'executive' ? (
                  <button
                    onClick={() => setIsDoodleModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book 1-on-1 Doodle Session</span>
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
                        <span>Connecting Razorpay...</span>
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

            {/* Razorpay Trust & Payment Methods Bar */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Secured by Razorpay</span>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                      UPI • Cards • NetBanking • EMI
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Transparent self-serve billing with instant activation and cancellation anytime. Instant UPI and international card processing.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Google Pay • PhonePe • Paytm</span>
              </div>
            </div>

            {/* Interactive FAQs */}
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

      {/* Doodle Booking Modal */}
      <DoodleBookingModal
        isOpen={isDoodleModalOpen}
        onClose={() => setIsDoodleModalOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
};
