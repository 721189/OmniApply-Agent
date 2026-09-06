import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Building2, 
  DollarSign, 
  Calendar, 
  Globe, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  HelpCircle
} from 'lucide-react';
import { PlatformType, CandidateAnalysis, AgentTask } from '../types';
import { SAMPLE_JOB_PRESETS, SampleJobPreset } from '../data/mockProfiles';

interface JobStudioProps {
  analysis: CandidateAnalysis | null;
  onGeneratePackage: (params: {
    jobTitle: string;
    companyName: string;
    targetPlatform: PlatformType;
    jobDescription: string;
    salaryExpectation?: string;
    noticePeriod?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  activeTask: AgentTask | null;
  onBackToProfile: () => void;
}

export const JobStudio: React.FC<JobStudioProps> = ({
  analysis,
  onGeneratePackage,
  isGenerating,
  activeTask,
  onBackToProfile,
}) => {
  const [jobTitle, setJobTitle] = useState('Senior Full-Stack Engineer');
  const [companyName, setCompanyName] = useState('NexusFlow AI');
  const [targetPlatform, setTargetPlatform] = useState<PlatformType>('wellfound');
  const [jobUrl, setJobUrl] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('$140,000 – $180,000 + Equity');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 2 Weeks');
  const [jobDescription, setJobDescription] = useState(
    SAMPLE_JOB_PRESETS[0].description
  );

  const handleApplyJobPreset = (preset: SampleJobPreset) => {
    setJobTitle(preset.title);
    setCompanyName(preset.company);
    setTargetPlatform(preset.platform as PlatformType);
    setSalaryExpectation(preset.salary);
    setJobDescription(preset.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePackage({
      jobTitle,
      companyName,
      targetPlatform,
      jobDescription,
      salaryExpectation,
      noticePeriod,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
              <span>Step 2: Job Targeting & Tailoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Application Generator Studio
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Select your target platform (Wellfound, LinkedIn, Internshala, or Greenhouse/ATS) and provide the job requirements. The agent crafts high-conversion cover letters, founder notes, recruiter InMails, screening Q&A answers, and an ATS alignment report.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Quick Job Preset Templates:</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_JOB_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyJobPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium text-left transition-all ${
                    companyName === preset.company
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-semibold">{preset.company}</span> - {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Profile Status Header */}
      {!analysis && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>
              Tip: You have not analyzed your profiles yet. We will generate tailored responses using an automated candidate profile baseline.
            </span>
          </div>
          <button
            type="button"
            onClick={onBackToProfile}
            className="text-xs font-bold text-amber-200 underline hover:text-white shrink-0"
          >
            Analyze Profiles First
          </button>
        </div>
      )}

      {/* Main Studio Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* 1. Target Platform Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            1. Select Target Job Platform
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Wellfound */}
            <div
              onClick={() => setTargetPlatform('wellfound')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                targetPlatform === 'wellfound'
                  ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Wellfound</span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold">
                  AngelList
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Founder pitch notes, startup culture fit, equity preferences & 0-to-1 impact stories.
              </p>
            </div>

            {/* LinkedIn */}
            <div
              onClick={() => setTargetPlatform('linkedin')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                targetPlatform === 'linkedin'
                  ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">LinkedIn</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#0077b5]/20 text-[#0077b5] rounded font-bold">
                  Jobs & InMail
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recruiter InMail outreach, connection notes, and Easy Apply screening Q&A answers.
              </p>
            </div>

            {/* Internshala */}
            <div
              onClick={() => setTargetPlatform('internshala')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                targetPlatform === 'internshala'
                  ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Internshala</span>
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-bold">
                  Internships / SDE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                "Why should you be hired?", 6-month full-time commitment, and assignment submissions.
              </p>
            </div>

            {/* Greenhouse / General ATS */}
            <div
              onClick={() => setTargetPlatform('greenhouse')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                targetPlatform === 'greenhouse'
                  ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Enterprise ATS</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                  Greenhouse / Lever
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Detailed technical questionnaires, behavioral STAR responses & ATS keyword optimization.
              </p>
            </div>

          </div>
        </div>

        {/* 2. Role Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Title / Position
            </label>
            <div className="relative">
              <Briefcase className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. Stripe / NexusFlow AI / Razorpay"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Salary Target / Stipend Expectation
            </label>
            <div className="relative">
              <DollarSign className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. $140,000 - $180,000 or ₹50,000/mo"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* 3. Job Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Paste Job Description & Requirements</span>
            </label>
            <span className="text-[10px] text-slate-400">
              Paste the full text from {targetPlatform.toUpperCase()}
            </span>
          </div>
          <textarea
            rows={7}
            required
            placeholder="Paste the full job posting, responsibilities, tech stack, and qualifications here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Action Button & Celery Progress Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Platform Engine: <strong className="text-indigo-400 capitalize">{targetPlatform}</strong> Customizer
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Synthesizing Application Package...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Synthesize Tailored Application Package</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Task Progress Bar */}
        {isGenerating && activeTask && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
              <span className="flex items-center gap-2 text-indigo-400 font-mono">
                <Cpu className="h-3.5 w-3.5" />
                [{activeTask.workerId}] {activeTask.currentStage}
              </span>
              <span>{activeTask.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeTask.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              {activeTask.logs[activeTask.logs.length - 1]?.message || 'Generating tailored recruiter fields...'}
            </p>
          </div>
        )}

      </form>

    </div>
  );
};
