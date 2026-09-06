import React, { useState } from 'react';
import { 
  Clock, Calendar, Mail, Copy, Check, Sparkles, Send, 
  ChevronRight, X, Download, ShieldCheck, ArrowRight, Bell
} from 'lucide-react';
import { FollowUpSequence, FollowUpEmail } from '../types';

interface FollowUpSequencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence?: FollowUpSequence;
  jobTitle?: string;
  companyName?: string;
  jobId?: string;
}

export const FollowUpSequencerModal: React.FC<FollowUpSequencerModalProps> = ({
  isOpen,
  onClose,
  sequence,
  jobTitle = 'Software Engineer',
  companyName = 'Target Company',
  jobId,
}) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [tone, setTone] = useState<'polite' | 'direct' | 'technical'>('polite');

  if (!isOpen || !sequence || !sequence.emails || sequence.emails.length === 0) return null;

  const currentEmail: FollowUpEmail = sequence.emails[selectedStageIdx] || sequence.emails[0];

  const handleCopy = (text: string, type: 'subject' | 'body') => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const handleDownloadIcs = () => {
    if (jobId) {
      window.open(`/api/jobs/${jobId}/ics`, '_blank');
      return;
    }
    // Client-side fallback ICS generator
    const calData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OmniApply AI//Recruiter Followup Sequencer//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Follow up with ${companyName} (${currentEmail.label})
DESCRIPTION:${currentEmail.subject}\\n\\n${currentEmail.callToAction}
DTSTART:${new Date(Date.now() + currentEmail.dayOffset * 86400000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + currentEmail.dayOffset * 86400000 + 1800000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cadence.ics`;
    link.click();
  };

  const getStageColor = (idx: number) => {
    if (idx === 0) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (idx === 1) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (idx === 2) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  Recruiter Follow-Up Drip Sequencer
                </h2>
                <span className="text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  4-Stage Cadence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategic timeline & touchpoints for <strong className="text-slate-200">{jobTitle}</strong> at <strong className="text-slate-200">{companyName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadIcs}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Download .ICS Reminders
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cadence Timeline Stepper */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sequence.emails.map((email, idx) => {
            const isSelected = selectedStageIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedStageIdx(idx)}
                className={`p-3 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStageColor(idx)}`}>
                    Day {email.dayOffset}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate mt-1">
                  {email.label.split(':')[1] || email.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {idx === 0 ? 'Immediately' : `+${email.dayOffset} days`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Email Stage Detail */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900/50 space-y-5">
          
          {/* Objective Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Strategic Objective & Timing
              </div>
              <div className="text-sm font-medium text-slate-200">
                {currentEmail.callToAction}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {currentEmail.recommendedWait}
              </div>
            </div>

            <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center gap-2 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hook: <strong className="text-slate-300">{currentEmail.valueAddHook}</strong></span>
            </div>
          </div>

          {/* Subject Line Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Subject Line
              </span>
              <button
                onClick={() => handleCopy(currentEmail.subject, 'subject')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedSubject ? 'Copied' : 'Copy Subject'}
              </button>
            </div>
            <div className="font-mono text-xs text-purple-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
              {currentEmail.subject}
            </div>
          </div>

          {/* Body Content Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Message Body
              </span>
              <button
                onClick={() => handleCopy(currentEmail.body, 'body')}
                className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition"
              >
                {copiedBody ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBody ? 'Copied Full Message' : 'Copy Message Body'}
              </button>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800/80 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-purple-500/30">
              {currentEmail.body}
            </div>
          </div>

          {/* Next Stage Teaser */}
          {selectedStageIdx < sequence.emails.length - 1 && (
            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>Next up in cadence: <strong>{sequence.emails[selectedStageIdx + 1].label}</strong></span>
              <button
                onClick={() => setSelectedStageIdx(selectedStageIdx + 1)}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium"
              >
                View Stage {selectedStageIdx + 2}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
