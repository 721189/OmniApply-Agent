import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  User, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Lock,
  RefreshCw
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onAuthSuccess: (user: UserAccount, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  if (!isOpen) return null;

  const handleLoginOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name || email.split('@')[0], 
          email: email.trim(), 
          password: password || 'demo-pass' 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user) {
        onAuthSuccess(data.user, data.token);
        if (!data.user.isVerified) {
          setMode('verify');
          setResendCountdown(30);
          setSuccessMsg(`Verification code sent to ${email}. Enter the 6-digit code below to complete verification.`);
        } else {
          setSuccessMsg('Logged in successfully!');
          setTimeout(onClose, 800);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!code || code.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setSuccessMsg('Email verified successfully! Autonomous agent pipelines active.');
      if (data.user) {
        onAuthSuccess(data.user, 'verified-token');
      }
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      setResendCountdown(30);
      setSuccessMsg(`New verification code sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Could not resend code');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetName: string, presetEmail: string) => {
    setName(presetName);
    setEmail(presetEmail);
    const demoUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: presetName,
      email: presetEmail,
      isVerified: true,
      title: 'Staff Full-Stack & Systems Engineer',
      location: 'San Francisco, CA / Remote',
      createdAt: new Date().toISOString(),
    };
    onAuthSuccess(demoUser, 'demo-token');
    setSuccessMsg(`Switched to active account: ${presetName}`);
    setTimeout(onClose, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-indigo-500/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3 shadow-inner">
            {mode === 'verify' ? <ShieldCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'verify' 
              ? 'Verify Your Email' 
              : mode === 'register' 
              ? 'Create OmniApply AI Account' 
              : 'Sign In to OmniApply AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'verify'
              ? 'Enter the 6-digit confirmation code sent to verify your identity.'
              : 'Autonomous candidate intelligence, job matching & application generator.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mode 1: Verification Form */}
        {mode === 'verify' ? (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  6-Digit Verification Code
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{email}</span>
              </div>
              <input
                type="text"
                placeholder="e.g. 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
              />
              <div className="flex items-center justify-between mt-2.5">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || loading}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-indigo-400 disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCode('123456')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Auto-Fill Demo (123456)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Security Code...</span>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify Email & Activate Account</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: Login / Register Form */
          <form onSubmit={handleLoginOrRegister} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. user@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-slate-400">Demo: password123</span>
                )}
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Processing Authentication...</span>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Register Account & Send Code' : 'Sign In with Password'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'register' ? 'login' : 'register');
                  setError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {mode === 'register' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Fast Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>1-Click Verified Demo Accounts:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('Alex Chen', 'alex.chen@example.org')}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 text-left text-xs transition-colors"
            >
              <div className="font-semibold text-slate-200 truncate">Alex Chen</div>
              <div className="text-[10px] text-slate-400 truncate">alex.chen@example.org</div>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('Alex Rivera', 'alex.rivera@devmail.io')}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 text-left text-xs transition-colors"
            >
              <div className="font-semibold text-slate-200 truncate">Alex Rivera</div>
              <div className="text-[10px] text-slate-400 truncate">alex.rivera@devmail.io</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
