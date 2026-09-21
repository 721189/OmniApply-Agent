import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  UserCheck, 
  Share2
} from 'lucide-react';
import { UserAccount } from '../types';

interface DoodleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  doodleUrl?: string;
  defaultTopic?: string;
}

export const DoodleBookingModal: React.FC<DoodleBookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  doodleUrl = 'https://doodle.com/bp/omniapply/career-advisory',
  defaultTopic,
}) => {
  const [selectedSessionType, setSelectedSessionType] = useState<'strategy' | 'mock' | 'poll'>('strategy');
  const [copiedLink, setCopiedLink] = useState(false);
  const [recruiterPollTitle, setRecruiterPollTitle] = useState(defaultTopic || 'Technical Interview Round 1');

  if (!isOpen) return null;

  const candidateName = currentUser?.name || 'Candidate';
  const personalizedBookingUrl = `${doodleUrl}?name=${encodeURIComponent(candidateName)}&session=${selectedSessionType}`;
  const doodlePollCreateUrl = `https://doodle.com/create?title=${encodeURIComponent(`Interview Availability: ${candidateName} - ${recruiterPollTitle}`)}`;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Hand-drawn Doodle Crown Accent */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Calendar className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Doodle Scheduling & 1-on-1 Sessions
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Doodle 1:1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Book executive career coaching, schedule mock interviews, or generate recruiter polls.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedSessionType('strategy')}
              className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedSessionType === 'strategy'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Offer Strategy</span>
            </button>
            <button
              onClick={() => setSelectedSessionType('mock')}
              className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedSessionType === 'mock'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Mock Interview</span>
            </button>
            <button
              onClick={() => setSelectedSessionType('poll')}
              className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedSessionType === 'poll'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Recruiter Poll</span>
            </button>
          </div>

          {/* Session Type Description */}
          {selectedSessionType === 'strategy' && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>1-on-1 Executive Offer Strategy (45 min)</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Live consultation with senior career advisory partners. We review counter-offers, equity packages, vesting schedules, and multi-offer leverage tactics.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-500/20 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Zoom / Google Meet</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Game Theory Playbook</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Verified Confidential</span>
              </div>
            </div>
          )}

          {selectedSessionType === 'mock' && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>System Design & Behavioral Mock Interview (60 min)</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Realistic tech interview simulation tailored directly to your target company (Meta, Stripe, Google, Razorpay, or High-Growth Startups).
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
                  <Video className="h-4 w-4" />
                </div>
              </div>

              <div className="pt-2 border-t border-purple-500/20 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Live Coding / Architecture</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">STAR Behavioral Rubric</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Written Feedback Dossier</span>
              </div>
            </div>
          )}

          {selectedSessionType === 'poll' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Doodle Group Availability Poll for Recruiters
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Avoid back-and-forth email tag. Generate a Doodle scheduling poll and share 3-5 open time slots with recruiters or panel interviewers.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Interview Round Topic
                </label>
                <input
                  type="text"
                  value={recruiterPollTitle}
                  onChange={(e) => setRecruiterPollTitle(e.target.value)}
                  placeholder="e.g. Technical Screen with Lead Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Action Box with Copy Link and Direct Doodle Launch */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Your Doodle Link</span>
              <span className="text-[10px] text-slate-500">Instant Calendar Sync</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={selectedSessionType === 'poll' ? doodlePollCreateUrl : personalizedBookingUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono select-all truncate"
              />
              <button
                onClick={() => handleCopyLink(selectedSessionType === 'poll' ? doodlePollCreateUrl : personalizedBookingUrl)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={selectedSessionType === 'poll' ? doodlePollCreateUrl : personalizedBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <span>Launch on Doodle.com</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>

          {/* Hand-drawn Doodle Style Note */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-[11px] text-slate-400">
            <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Executive Pass members get unlimited priority booking credits through the verified Doodle calendar integration.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
