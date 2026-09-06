import React, { useState } from 'react';
import { 
  FileText, Download, Copy, Check, Printer, Sparkles, 
  Code, Eye, X, Briefcase, GraduationCap, Wrench, Layers, RefreshCw
} from 'lucide-react';
import { LatexResumePackage, ResumeData } from '../types';

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumePackage?: LatexResumePackage;
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  onRegenerate?: () => void;
}

export const ResumeBuilderModal: React.FC<ResumeBuilderModalProps> = ({
  isOpen,
  onClose,
  resumePackage,
  candidateName = 'Shivam Singh',
  jobTitle = 'Software Engineer',
  companyName = 'Target Company',
  onRegenerate,
}) => {
  const [activeView, setActiveView] = useState<'visual' | 'latex'>('visual');
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !resumePackage) return null;

  const data: ResumeData = resumePackage.structuredResume;
  const latexCode = resumePackage.latexSource;

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const element = document.createElement('a');
    const file = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const fileName = `${data.fullName.toLowerCase().replace(/\s+/g, '_')}_resume_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.tex`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  ATS LaTeX & PDF Resume Engine
                </h2>
                <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Harvard / Jake's Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tailored for <strong className="text-slate-200">{jobTitle}</strong> at <strong className="text-slate-200">{companyName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveView('visual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === 'visual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual PDF Preview
              </button>
              <button
                onClick={() => setActiveView('latex')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === 'latex'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                LaTeX Code (.tex)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ATS Targeted Keywords Badge Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-slate-300">Targeted ATS Keywords:</span>
            <div className="flex flex-wrap gap-1.5">
              {resumePackage.atsKeywordsTargeted.map((kw, i) => (
                <span
                  key={i}
                  className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700/60 font-mono"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Re-tailor
              </button>
            )}
            <button
              onClick={handleCopyLatex}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied LaTeX' : 'Copy LaTeX'}
            </button>
            <button
              onClick={handleDownloadTex}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download .tex
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-medium shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          {activeView === 'visual' ? (
            /* Visual ATS Single-Column Harvard Layout (Exact Jake's Resume Render) */
            <div 
              id="printable-ats-resume" 
              className="w-full max-w-[780px] bg-white text-black p-8 sm:p-10 rounded-sm shadow-xl font-serif text-[13px] leading-[1.4] selection:bg-blue-200 selection:text-black"
            >
              {/* Header */}
              <div className="text-center border-b border-neutral-300 pb-3 mb-4">
                <h1 className="text-2xl font-bold tracking-tight font-serif uppercase text-black">
                  {data.fullName}
                </h1>
                <div className="text-[11px] text-neutral-800 flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-1 font-sans">
                  {data.phone && <span>{data.phone}</span>}
                  {data.phone && <span>•</span>}
                  <span>{data.email}</span>
                  {data.links.linkedin && <span>•</span>}
                  {data.links.linkedin && (
                    <a href={`https://${data.links.linkedin}`} className="underline text-black">
                      {data.links.linkedin}
                    </a>
                  )}
                  {data.links.github && <span>•</span>}
                  {data.links.github && (
                    <a href={`https://${data.links.github}`} className="underline text-black">
                      {data.links.github}
                    </a>
                  )}
                </div>
              </div>

              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
                    Education
                  </h2>
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between font-bold text-neutral-900 font-sans">
                        <span>{edu.institution}</span>
                        <span className="font-normal text-neutral-700">{edu.location}</span>
                      </div>
                      <div className="flex justify-between italic text-neutral-800 text-[12px]">
                        <span>{edu.degree}</span>
                        <span className="not-italic text-neutral-700">{edu.duration}</span>
                      </div>
                      {edu.details && (
                        <p className="text-[11.5px] text-neutral-700 mt-0.5">
                          {edu.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Skills */}
              {data.skills && (
                <div className="mb-4">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
                    Technical Skills
                  </h2>
                  <div className="space-y-1 text-[12px] text-neutral-900">
                    <div>
                      <strong className="font-sans">Languages:</strong>{' '}
                      <span className="font-serif">{data.skills.languages.join(', ')}</span>
                    </div>
                    <div>
                      <strong className="font-sans">Frameworks & Runtimes:</strong>{' '}
                      <span className="font-serif">{data.skills.frameworks.join(', ')}</span>
                    </div>
                    <div>
                      <strong className="font-sans">Databases & Cloud:</strong>{' '}
                      <span className="font-serif">{data.skills.librariesOrDatabases.join(', ')}</span>
                    </div>
                    <div>
                      <strong className="font-sans">Developer Tools:</strong>{' '}
                      <span className="font-serif">{data.skills.developerTools.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              {data.experience && data.experience.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
                    Professional Experience
                  </h2>
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-neutral-900 font-sans">
                        <span>{exp.role}</span>
                        <span className="font-normal text-neutral-700">{exp.duration}</span>
                      </div>
                      <div className="flex justify-between italic text-neutral-800 text-[12px] mb-1">
                        <span>{exp.company}</span>
                        <span className="not-italic text-neutral-700">{exp.location}</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-[12px] text-neutral-800">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="leading-snug">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="mb-2">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">
                    Featured Engineering Projects
                  </h2>
                  {data.projects.map((proj, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between text-neutral-900 font-sans">
                        <div>
                          <strong className="font-bold">{proj.title}</strong>{' '}
                          <span className="text-neutral-600 italic text-[11.5px]">| {proj.technologies}</span>
                        </div>
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-[12px] text-neutral-800 mt-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="leading-snug">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Raw LaTeX Editor / Code View */
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3 text-slate-400">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  jakes_resume_template.tex
                </span>
                <span>{latexCode.split('\n').length} lines</span>
              </div>
              <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre select-all">
                {latexCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
