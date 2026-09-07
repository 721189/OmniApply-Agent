import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  Eye, 
  Save, 
  Send, 
  Layers, 
  ShieldCheck, 
  Target, 
  MessageSquare, 
  Briefcase, 
  Sliders, 
  Wand2, 
  Code, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  Printer,
  Calendar,
  Clock,
  Mail,
  Scale,
  DollarSign
} from 'lucide-react';
import { JobApplication, ApplicationPackage, PlatformType, ScreeningQuestion, LatexResumePackage, FollowUpSequence, JobOfferDetails } from '../types';
import { apiFetch } from '../utils/apiClient';
import { ResumeBuilderModal } from './ResumeBuilderModal';
import { FollowUpSequencerModal } from './FollowUpSequencerModal';
import { OfferCalculatorModal } from './OfferCalculatorModal';

interface ApplicationReviewerProps {
  currentJob: JobApplication | null;
  onUpdateJob: (updatedJob: JobApplication) => Promise<void>;
  onMarkAsApplied: (jobId: string) => Promise<void>;
  onNavigateToTracker: () => void;
}

export const ApplicationReviewer: React.FC<ApplicationReviewerProps> = ({
  currentJob,
  onUpdateJob,
  onMarkAsApplied,
  onNavigateToTracker,
}) => {
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'pitch' | 'platform' | 'screening' | 'projects' | 'ats_audit' | 'latex_resume' | 'followup'>('cover_letter');
  const [isEditing, setIsEditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Draft state
  const [coverLetterDraft, setCoverLetterDraft] = useState(currentJob?.applicationPackage.coverLetter || '');
  const [elevatorPitchDraft, setElevatorPitchDraft] = useState(currentJob?.applicationPackage.elevatorPitch || '');
  const [tailoredBioDraft, setTailoredBioDraft] = useState(currentJob?.applicationPackage.tailoredBio || '');
  const [screeningDrafts, setScreeningDrafts] = useState<ScreeningQuestion[]>(currentJob?.applicationPackage.screeningQuestions || []);
  const [platformDrafts, setPlatformDrafts] = useState(currentJob?.applicationPackage.platformSpecific || {});

  // Sync draft when currentJob changes
  React.useEffect(() => {
    if (currentJob) {
      setCoverLetterDraft(currentJob.applicationPackage.coverLetter || '');
      setElevatorPitchDraft(currentJob.applicationPackage.elevatorPitch || '');
      setTailoredBioDraft(currentJob.applicationPackage.tailoredBio || '');
      setScreeningDrafts(currentJob.applicationPackage.screeningQuestions || []);
      setPlatformDrafts(currentJob.applicationPackage.platformSpecific || {});
    }
  }, [currentJob?.id]);

  if (!currentJob) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Application Selected for Review</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Select an application from your Job Studio or Application Tracker to preview, customize, and edit the AI-generated application package.
        </p>
        <button
          onClick={onNavigateToTracker}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          View Job Applications Tracker
        </button>
      </div>
    );
  }

  const pkg = currentJob.applicationPackage;

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveDrafts = async () => {
    setSaveStatus('saving');
    try {
      const updatedPackage: ApplicationPackage = {
        ...pkg,
        coverLetter: coverLetterDraft,
        elevatorPitch: elevatorPitchDraft,
        tailoredBio: tailoredBioDraft,
        screeningQuestions: screeningDrafts,
        platformSpecific: platformDrafts,
      };

      const updatedJob: JobApplication = {
        ...currentJob,
        applicationPackage: updatedPackage,
        updatedAt: new Date().toISOString(),
      };

      await onUpdateJob(updatedJob);
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  const handleAIRefine = async (targetField: 'cover_letter' | 'pitch' | 'platform', instruction: string) => {
    setIsRefining(true);
    try {
      let currentText = '';
      if (targetField === 'cover_letter') currentText = coverLetterDraft;
      else if (targetField === 'pitch') currentText = elevatorPitchDraft;
      else if (targetField === 'platform') currentText = platformDrafts.wellfound?.directNoteToFounders || '';

      const res = await apiFetch('/api/refine-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          instruction,
          fieldType: targetField,
        }),
      });
      const data = await res.json();
      if (data.success && data.refinedText) {
        if (targetField === 'cover_letter') setCoverLetterDraft(data.refinedText);
        else if (targetField === 'pitch') setElevatorPitchDraft(data.refinedText);
        else if (targetField === 'platform') {
          setPlatformDrafts((prev) => ({
            ...prev,
            wellfound: prev.wellfound ? { ...prev.wellfound, directNoteToFounders: data.refinedText } : undefined,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to refine text with AI:', err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleExportPackage = () => {
    const textContent = `=====================================================
OMNIAPPLY AI - APPLICATION DOSSIER
=====================================================
Target Role: ${currentJob.jobTitle}
Company: ${currentJob.companyName}
Target Board: ${currentJob.targetPlatform.toUpperCase()}
Generated: ${new Date(currentJob.createdAt).toLocaleDateString()}
ATS Match Score: ${pkg.atsReport?.atsMatchScore || 90}%

-----------------------------------------------------
1. ELEVATOR PITCH & TAILORED BIO
-----------------------------------------------------
${elevatorPitchDraft}

Bio:
${tailoredBioDraft}

-----------------------------------------------------
2. TAILORED COVER LETTER
-----------------------------------------------------
${coverLetterDraft}

-----------------------------------------------------
3. PLATFORM SPECIFIC NOTES & RESPONSES
-----------------------------------------------------
${JSON.stringify(platformDrafts, null, 2)}

-----------------------------------------------------
4. SCREENING QUESTION RESPONSES
-----------------------------------------------------
${screeningDrafts.map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}\n`).join('\n')}

-----------------------------------------------------
5. ATS COMPLIANCE AUDIT
-----------------------------------------------------
Keywords Matched: ${(pkg.atsReport?.matchedKeywords || []).join(', ')}
Key Recommendations: ${(pkg.atsReport?.recommendations || []).join('\n- ')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Application-${currentJob.companyName.replace(/\s+/g, '_')}-${currentJob.jobTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = coverLetterDraft.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Application Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {currentJob.targetPlatform}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                currentJob.status === 'applied' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                Status: {currentJob.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentJob.jobTitle} <span className="text-slate-400 font-normal">at</span> {currentJob.companyName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dossier compiled on {new Date(currentJob.createdAt).toLocaleDateString()} • Ready for recruiter review & submission
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isEditing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Exit Live Edit' : 'Edit Package'}</span>
            </button>

            {isEditing && (
              <button
                onClick={handleSaveDrafts}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}</span>
              </button>
            )}

            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>LaTeX / PDF Resume</span>
            </button>

            <button
              onClick={() => setIsFollowUpModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Drip Sequencer</span>
            </button>

            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Offer Calculator</span>
            </button>

            <button
              onClick={handleExportPackage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              <span>Export Dossier</span>
            </button>

            {currentJob.status !== 'applied' && (
              <button
                onClick={() => onMarkAsApplied(currentJob.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Mark as Applied</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveTab('cover_letter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cover_letter' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Tailored Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pitch' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Elevator Pitch & Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('platform')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'platform' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Platform-Specific Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('screening')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'screening' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Recruiter Screening Q&A ({screeningDrafts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Flagship Projects ({pkg.keyProjectsShowcase?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('latex_resume')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'latex_resume' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>ATS LaTeX / PDF Resume</span>
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'followup' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Recruiter Drip Sequencer</span>
          </button>

          <button
            onClick={() => setActiveTab('ats_audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ats_audit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ATS Compliance Report ({pkg.atsReport?.atsMatchScore || 90}%)</span>
          </button>
        </div>
      </div>

      {/* Main Reviewer Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content Pane (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Cover Letter Tab */}
          {activeTab === 'cover_letter' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span>Targeted Application Cover Letter</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{wordCount} words</span>
                  <span>~{readingTime} min read</span>
                  <button
                    onClick={() => handleCopy(coverLetterDraft, 'cover_letter')}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-sans"
                  >
                    {copiedSection === 'cover_letter' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === 'cover_letter' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={coverLetterDraft}
                  onChange={(e) => setCoverLetterDraft(e.target.value)}
                  rows={14}
                  className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {coverLetterDraft}
                </div>
              )}
            </div>
          )}

          {/* 2. Pitch & Bio Tab */}
          {activeTab === 'pitch' && (
            <div className="space-y-5">
              {/* Elevator Pitch */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Zap className="h-4 w-4" />
                    <span>30-Second Elevator Pitch (For Recruiters & Founders)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(elevatorPitchDraft, 'pitch')}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedSection === 'pitch' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === 'pitch' ? 'Copied' : 'Copy Pitch'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={elevatorPitchDraft}
                    onChange={(e) => setElevatorPitchDraft(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {elevatorPitchDraft}
                  </p>
                )}
              </div>

              {/* Tailored Professional Bio */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <FileText className="h-4 w-4" />
                    <span>Tailored Professional Bio (Role-Aligned)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(tailoredBioDraft, 'bio')}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedSection === 'bio' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === 'bio' ? 'Copied' : 'Copy Bio'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={tailoredBioDraft}
                    onChange={(e) => setTailoredBioDraft(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {tailoredBioDraft}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 3. Platform Specific Tab */}
          {activeTab === 'platform' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>Platform-Specific Tailored Application Artifacts</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full font-bold uppercase">
                  {currentJob.targetPlatform}
                </span>
              </div>

              {/* Wellfound Sections */}
              {platformDrafts.wellfound && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-400">Direct Note to Founders / Hiring Team</h4>
                      <button
                        onClick={() => handleCopy(platformDrafts.wellfound?.directNoteToFounders || '', 'wf_note')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'wf_note' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy Note</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {platformDrafts.wellfound.directNoteToFounders}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Proudest Startup Achievement</div>
                      <div className="text-xs text-slate-200 mt-1">{platformDrafts.wellfound.proudestAchievementInStartupEnvironment}</div>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Equity vs Salary Preference</div>
                      <div className="text-xs text-slate-200 mt-1">{platformDrafts.wellfound.equityVsSalaryPreference}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Sections */}
              {platformDrafts.linkedin && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-blue-400">LinkedIn InMail Recruiter Outreach Message</h4>
                      <button
                        onClick={() => handleCopy(`${platformDrafts.linkedin?.recruiterInMailSubject}\n\n${platformDrafts.linkedin?.recruiterInMailBody}`, 'li_inmail')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'li_inmail' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy InMail</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 font-semibold">Subject: {platformDrafts.linkedin.recruiterInMailSubject}</div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {platformDrafts.linkedin.recruiterInMailBody}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-sky-400">300-Char Connection Request Note</h4>
                      <button
                        onClick={() => handleCopy(platformDrafts.linkedin?.connectionRequestNote || '', 'li_conn')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'li_conn' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy ({(platformDrafts.linkedin?.connectionRequestNote || '').length}/300)</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      {platformDrafts.linkedin.connectionRequestNote}
                    </p>
                  </div>
                </div>
              )}

              {/* Internshala Sections */}
              {platformDrafts.internshala && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-400">Why Should You Be Hired For This Role?</h4>
                      <button
                        onClick={() => handleCopy(platformDrafts.internshala?.whyShouldYouBeHired || '', 'is_why')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'is_why' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy Answer</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {platformDrafts.internshala.whyShouldYouBeHired}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">Assignment / Relevant Experience Summary</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {platformDrafts.internshala.relevantProjectExperience}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Screening Questions Tab */}
          {activeTab === 'screening' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  <span>Recruiter Screening Questions & Answers</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {screeningDrafts.length} Questions Answered
                </span>
              </div>

              <div className="space-y-4">
                {screeningDrafts.map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300">Q{idx + 1}: {q.question}</span>
                      <button
                        onClick={() => handleCopy(q.answer, `q_${idx}`)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === `q_${idx}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy Answer</span>
                      </button>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={q.answer}
                        onChange={(e) => {
                          const updated = [...screeningDrafts];
                          updated[idx] = { ...updated[idx], answer: e.target.value };
                          setScreeningDrafts(updated);
                        }}
                        rows={3}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {q.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Flagship Projects Tab */}
          {activeTab === 'projects' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Code className="h-4 w-4 text-indigo-400" />
                  <span>Role-Aligned Key Projects Showcase</span>
                </div>
                <span className="text-[11px] text-slate-400">Indexed from GitHub & Publications</span>
              </div>

              <div className="space-y-4">
                {(pkg.keyProjectsShowcase || []).map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-300">{proj.projectName}</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md font-mono">
                        Source: {proj.sourcePlatform}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      Role Alignment: {proj.relevanceToRole}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {proj.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ATS Compliance Audit Tab */}
          {activeTab === 'ats_audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Applicant Tracking System (ATS) Diagnostic Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">ATS Match Score:</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    {pkg.atsReport?.atsMatchScore || 92} / 100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Matched ATS Keywords ({pkg.atsReport?.matchedKeywords?.length || 0})</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(pkg.atsReport?.matchedKeywords || []).map((kw, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400">Suggested Missing Keywords</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(pkg.atsReport?.missingKeywords || []).map((kw, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">ATS Optimization Recommendations</div>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {(pkg.atsReport?.recommendations || []).map((rec, i) => (
                    <li key={i} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 6. ATS LaTeX / PDF Resume Tab */}
          {activeTab === 'latex_resume' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span>Single-Column ATS Tailored Resume (Harvard / Jake's Template)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Engineered for 100% parse rates through Workday, Taleo, Greenhouse, and Lever ATS systems.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsResumeModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open Full Editor & PDF</span>
                  </button>
                </div>
              </div>

              {/* Resume Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Target Keywords</div>
                  <div className="text-xs font-semibold text-blue-300 mt-1">
                    {pkg.latexResume?.atsKeywordsTargeted?.length || 5} Keywords Embedded
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Format Compliance</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-1">
                    Standard LaTeX (Single-Column)
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Target Company</div>
                  <div className="text-xs font-semibold text-white mt-1">
                    {currentJob.companyName}
                  </div>
                </div>
              </div>

              {/* In-tab Visual Preview Snippet */}
              {pkg.latexResume?.structuredResume ? (
                <div className="bg-white text-black p-6 rounded-xl font-serif text-[12px] leading-relaxed shadow-lg max-h-[500px] overflow-y-auto">
                  <div className="text-center border-b border-neutral-300 pb-2 mb-3">
                    <h2 className="text-lg font-bold uppercase tracking-tight text-black">
                      {pkg.latexResume.structuredResume.fullName}
                    </h2>
                    <p className="text-[10.5px] text-neutral-700 font-sans mt-0.5">
                      {pkg.latexResume.structuredResume.email} • {pkg.latexResume.structuredResume.phone} • {pkg.latexResume.structuredResume.links.linkedin}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1 font-sans">
                        Technical Skills
                      </h3>
                      <p className="text-[11px]">
                        <strong>Languages & Tools:</strong> {pkg.latexResume.structuredResume.skills.languages.join(', ')}, {pkg.latexResume.structuredResume.skills.frameworks.join(', ')}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1 font-sans">
                        Experience
                      </h3>
                      {pkg.latexResume.structuredResume.experience.map((exp, i) => (
                        <div key={i} className="mb-2">
                          <div className="flex justify-between font-bold text-neutral-900 font-sans text-[11.5px]">
                            <span>{exp.role} - {exp.company}</span>
                            <span className="text-neutral-600 font-normal">{exp.duration}</span>
                          </div>
                          <ul className="list-disc pl-4 text-[11px] text-neutral-800 mt-0.5 space-y-0.5">
                            {exp.bullets.slice(0, 2).map((b, bi) => (
                              <li key={bi}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Click below to generate the structured LaTeX resume for this role.</p>
                  <button
                    onClick={() => setIsResumeModalOpen(true)}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                  >
                    Generate ATS LaTeX Resume
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7. Recruiter Drip Sequencer Tab */}
          {activeTab === 'followup' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span>Recruiter Follow-up Cadence (Day 0, 4, 8, 14)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automated multi-stage drip sequence to maximize recruiter response rates without being intrusive.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/jobs/${currentJob.id}/ics`}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
                  >
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                    <span>Download .ICS Calendar</span>
                  </a>
                  <button
                    onClick={() => setIsFollowUpModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open Interactive Cadence</span>
                  </button>
                </div>
              </div>

              {/* 4-Stage Summary Cards */}
              <div className="space-y-3">
                {(pkg.followUpSequence?.emails || []).map((email, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Day {email.dayOffset}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{email.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{email.recommendedWait}</span>
                    </div>

                    <div className="text-xs font-mono text-purple-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 mb-2">
                      Subject: {email.subject}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 italic leading-relaxed">
                      "{email.body}"
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[11px]">
                      <span className="text-slate-500">Goal: {email.callToAction}</span>
                      <button
                        onClick={() => handleCopy(email.body, `drip_${idx}`)}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        {copiedSection === `drip_${idx}` ? 'Copied!' : 'Copy Body'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar: AI Refinement Assistant & 1-Click Polish (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 pb-2 border-b border-slate-800">
              <Wand2 className="h-4 w-4" />
              <span>AI Refine & Polish Assistant</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use quick 1-click prompts to tune tone, brevity, and metrics for your current draft:
            </p>

            {/* Quick 1-Click Action Prompts */}
            <div className="space-y-2">
              <button
                onClick={() => handleAIRefine('cover_letter', 'Make this cover letter 25% shorter, punchier, and hyper-focused on high-impact results.')}
                disabled={isRefining}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all flex items-center justify-between"
              >
                <span>Make 25% More Concise</span>
                <Sparkles className="h-3 w-3 text-indigo-400" />
              </button>

              <button
                onClick={() => handleAIRefine('cover_letter', 'Emphasize concrete metrics, latency reductions, and quantified scale.')}
                disabled={isRefining}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all flex items-center justify-between"
              >
                <span>Add Quantified Scale & Metrics</span>
                <Sparkles className="h-3 w-3 text-amber-400" />
              </button>

              <button
                onClick={() => handleAIRefine('cover_letter', 'Highlight technical leadership, architecture design, and cross-team execution.')}
                disabled={isRefining}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all flex items-center justify-between"
              >
                <span>Emphasize Technical Leadership</span>
                <Sparkles className="h-3 w-3 text-emerald-400" />
              </button>
            </div>

            {/* Custom Refine Prompt Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Custom Polish Instruction:
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="e.g. Highlight GraphQL and Kubernetes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (refinePrompt) {
                      handleAIRefine('cover_letter', refinePrompt);
                      setRefinePrompt('');
                    }
                  }}
                  disabled={isRefining || !refinePrompt}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isRefining ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                  <span>{isRefining ? 'Refining...' : 'Apply Custom Polish'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Copy Form Fill Helper */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2 border-b border-slate-800">
              <Copy className="h-4 w-4 text-emerald-400" />
              <span>Fast Form-Fill Helper</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Applying in a browser tab? Click below to copy pre-formatted answers to your clipboard:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleCopy(coverLetterDraft, 'quick_cl')}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center justify-between"
              >
                <span>Full Cover Letter</span>
                <span className="text-[10px] text-indigo-400">{copiedSection === 'quick_cl' ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleCopy(elevatorPitchDraft, 'quick_pitch')}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center justify-between"
              >
                <span>Short Elevator Pitch</span>
                <span className="text-[10px] text-indigo-400">{copiedSection === 'quick_pitch' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Modals */}
      {pkg.latexResume && (
        <ResumeBuilderModal
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
          resumePackage={pkg.latexResume}
          jobTitle={currentJob.jobTitle}
          companyName={currentJob.companyName}
        />
      )}

      {pkg.followUpSequence && (
        <FollowUpSequencerModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          sequence={pkg.followUpSequence}
          jobTitle={currentJob.jobTitle}
          companyName={currentJob.companyName}
          jobId={currentJob.id}
        />
      )}

      {/* Offer Negotiation & Evaluation Modal */}
      <OfferCalculatorModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        job={currentJob}
      />

    </div>
  );
};
