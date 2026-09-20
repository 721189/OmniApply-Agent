import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  RotateCcw,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { AtsScanResult } from '../types';

interface AtsScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDossier: (
    resumeText: string, 
    jobTitle: string, 
    companyName: string, 
    jobDescription: string
  ) => void;
  initialResumeText?: string;
}

const SAMPLE_RESUME = `Alex Chen | Full Stack Engineer | San Francisco, CA
alex.chen.dev@gmail.com | github.com/alexchen-dev

SUMMARY:
Results-driven software engineer with 4+ years of experience building resilient web applications, distributed APIs, and real-time backend microservices in TypeScript, React, and Node.js.

EXPERIENCE:
Software Engineer | CloudScale Systems (2023 - Present)
- Designed and maintained high-throughput ingestion pipelines handling 50k+ daily events using Node.js and PostgreSQL.
- Decreased p95 API response times by 32% via Redis caching layer and SQL query optimization.
- Collaborated closely with cross-functional product and security teams to ship RBAC multi-tenant workspaces.

Full Stack Developer | NexaFlow Technologies (2021 - 2023)
- Built responsive client dashboards using React, TypeScript, and Tailwind CSS, increasing daily active user engagement by 24%.
- Migrated legacy REST endpoints to modular GraphQL services with automated integration testing.

EDUCATION & SKILLS:
B.S. in Computer Science, UC Davis (2021)
Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
Frameworks & Tools: React, Next.js, Node.js, Express, Docker, PostgreSQL, Redis, Jest, Git`;

const SAMPLE_JOB = `Senior Software Engineer (Full Stack) - Payments Infrastructure
Stripe | San Francisco, CA (Hybrid)

About the Role:
We are looking for an experienced Full Stack Engineer to architect and expand our global payments processing engine and developer-facing APIs. You will work across the stack to build resilient, distributed systems that process billions in global commerce.

Requirements:
- 4+ years of professional full-stack development experience with modern TypeScript/JavaScript and backend services (Node.js, Go, or Java).
- Strong experience with relational databases (PostgreSQL/MySQL), transaction isolation, and high-volume data modeling.
- Solid understanding of distributed systems, idempotency, event-driven architectures (Kafka/RabbitMQ), and API security.
- Track record of designing intuitive frontend developer tools in React and TypeScript.
- Strong product intuition and ability to lead end-to-end technical execution.`;

export const AtsScanModal: React.FC<AtsScanModalProps> = ({
  isOpen,
  onClose,
  onApplyDossier,
  initialResumeText,
}) => {
  const [candidateName, setCandidateName] = useState('Alex Chen');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [companyName, setCompanyName] = useState('Stripe');
  const [resumeText, setResumeText] = useState(initialResumeText || SAMPLE_RESUME);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [scanResult, setScanResult] = useState<AtsScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setCandidateName('Alex Chen');
    setTargetRole('Senior Full Stack Engineer');
    setCompanyName('Stripe');
    setResumeText(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JOB);
    setScanResult(null);
    setErrorMessage(null);
  };

  const handleRunScan = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 20) {
      setErrorMessage('Please provide your resume text (at least 20 characters).');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setErrorMessage('Please provide a job description (at least 20 characters).');
      return;
    }

    setErrorMessage(null);
    setIsScanning(true);
    setScanStage('Parsing resume tokens & ATS structure...');

    const stageTimer1 = setTimeout(() => {
      setScanStage('Cross-referencing 200+ recruiter keywords & skills...');
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      setScanStage('Benchmarking against top candidate pool & scoring...');
    }, 2400);

    try {
      const token = localStorage.getItem('omniapply_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ats/instant-scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resumeText,
          jobDescription,
          candidateName,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete ATS scan');
      }

      setScanResult(data.result);
    } catch (err: any) {
      console.error('[ATS Scan Error]:', err);
      setErrorMessage(err.message || 'Error processing scan. Please retry.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsScanning(false);
      setScanStage('');
    }
  };

  const handleConvertAndOpenStudio = () => {
    if (!scanResult) return;
    onApplyDossier(
      resumeText,
      targetRole || 'Software Engineer',
      companyName || 'Target Company',
      jobDescription
    );
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Instant ATS Resume Audit & Scorecard
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Free Tool
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audited against modern ATS parsers (Greenhouse, Lever, Workday) with AI keyword analysis.
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

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Results View */}
          {scanResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Scorecard Hero Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Radial Score */}
                  <div className={`h-24 w-24 rounded-2xl border-2 flex flex-col items-center justify-center font-mono ${getScoreColor(scanResult.score)} shadow-xl`}>
                    <span className="text-3xl font-extrabold tracking-tight">{scanResult.score}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Grade {scanResult.grade}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">
                        ATS Audit for {targetRole || 'Target Role'}
                      </h3>
                      <span className="text-xs text-slate-400">@ {companyName || 'Target Company'}</span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-md">
                      Estimated recruiter callback rate: <strong className="text-emerald-400">{scanResult.estimatedCallbackProbability}</strong>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        Candidate: {candidateName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={handleConvertAndOpenStudio}
                    className="py-2.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Auto-Optimize with OmniApply</span>
                  </button>
                  <button
                    onClick={() => setScanResult(null)}
                    className="py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Audit Another Resume</span>
                  </button>
                </div>
              </div>

              {/* Keywords Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Keywords */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Matched ATS Keywords ({scanResult.matchedKeywords.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.matchedKeywords.map((kw, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords (The critical conversion trigger) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Missing Critical Keywords ({scanResult.missingKeywords.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.missingKeywords.map((kw, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25"
                      >
                        ! {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Critical Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Key Strengths & Role Alignments</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scanResult.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Critical Gaps & Parser Vulnerabilities</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scanResult.criticalGaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Generated Elevator Pitch */}
              {scanResult.tailoredSummaryPitch && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>Recommended Executive Pitch for this Application</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{scanResult.tailoredSummaryPitch}"
                  </p>
                </div>
              )}

              {/* Bottom Conversion Action */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Want OmniApply to bridge these missing keywords?</h4>
                  <p className="text-[11px] text-slate-300">
                    Deploy your autonomous agent to rewrite bullet points, extract GitHub proof, and score 95%+ in Job Studio.
                  </p>
                </div>
                <button
                  onClick={handleConvertAndOpenStudio}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Open in Job Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          ) : (
            /* Input Form View */
            <div className="space-y-6">
              
              {/* Target Role & Candidate Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, OpenAI, Google"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Two Column Input Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resume Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Paste Your Resume Text</span>
                    </label>
                    <button
                      onClick={handleLoadSample}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Pre-fill Sample
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste full text of your resume (experience, skills, education)..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Job Description Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Target Job Description</span>
                    </label>
                  </div>
                  <textarea
                    rows={10}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job posting requirements and role description..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Instant semantic keyword match against Greenhouse & Lever criteria</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{scanStage || 'Auditing Resume...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Calculate ATS Match Score</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
