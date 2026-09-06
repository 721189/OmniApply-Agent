import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Mail, 
  MapPin, 
  Briefcase,
  Database,
  FileJson
} from 'lucide-react';
import { UserAccount } from '../types';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUpdateProfile: (updated: Partial<UserAccount>) => Promise<void>;
  onLogout: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');
  
  // Profile state
  const [name, setName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState(currentUser?.title || 'Full-Stack Software Engineer');
  const [location, setLocation] = useState(currentUser?.location || 'Bangalore, India');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  
  // Security state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await onUpdateProfile({ name, title, location, avatarUrl });
      setFeedback({ type: 'success', message: 'Profile details updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setFeedback({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/export-data');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to export data');

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data.data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `omni-apply-user-data-${currentUser.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setFeedback({ type: 'success', message: 'GDPR / CCPA data archive downloaded successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account and wipe all stored candidate data and job applications? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      alert('Account and all associated records have been permanently purged.');
      onLogout();
      onClose();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              {currentUser.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30 font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => { setActiveTab('profile'); setFeedback(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => { setActiveTab('security'); setFeedback(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Security & Auth</span>
          </button>

          <button
            onClick={() => { setActiveTab('privacy'); setFeedback(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data Privacy & GDPR</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mb-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Candidate Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Title / Specialization
                </label>
                <div className="relative">
                  <Briefcase className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Senior Full-Stack Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Location
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Auth */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Account Email</span>
                <span className="text-slate-400 font-mono">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Verification Status</span>
                <span className={currentUser.isVerified ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {currentUser.isVerified ? 'Verified & Secure' : 'Pending Verification'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Key className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Re-type password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading || !newPassword}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Data Privacy & GDPR */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <FileJson className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Download Complete Data Archive (GDPR Compliance)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Export your complete candidate dossier, aggregated social & coding metrics, AI-generated application packages, and job tracking records in clean JSON format.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Download className="h-4 w-4 text-indigo-400" />
                <span>Export My Data (.JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 mt-0.5">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Permanent Account & Data Purge</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Erase all credentials, indexed repositories, LeetCode stats, written application drafts, and saved jobs from the database store.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold border border-rose-500/30 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Permanently Delete My Account & Wipe Data</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
