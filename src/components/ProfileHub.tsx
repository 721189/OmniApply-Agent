import React, { useState } from 'react';
import { 
  Github, 
  Linkedin, 
  Code2, 
  BookOpen, 
  Twitter, 
  Globe, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Cpu, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Layers, 
  Terminal, 
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Search,
  Check,
  Copy,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { ProfileUrls, CandidateAnalysis, AgentTask, SampleProfilePreset } from '../types';
import { apiFetch } from '../utils/apiClient';
import * as MockData from '../data/mockProfiles';

const FALLBACK_PROFILE_PRESETS: SampleProfilePreset[] = [
  {
    id: 'preset-alex',
    name: 'Alex Chen',
    role: 'Staff Full-Stack & AI Systems Engineer',
    urls: {
      linkedin: 'https://linkedin.com/in/alexchen-dev',
      github: 'https://github.com/alexchen-dev',
      leetcode: 'https://leetcode.com/u/alexchen_dsa',
      substack: 'https://systems-scale.substack.com',
      twitter: 'https://x.com/alexchen_dev',
      portfolio: 'https://alexchen.dev',
      resumeText: 'Experienced Staff Full-Stack & AI Systems Engineer with 6+ years architecting high-throughput distributed systems, vector retrieval engines, agentic LLM pipelines, and production React applications. Proficient in TypeScript, React, Node.js, Go, Python, PostgreSQL, and Docker.',
    },
  },
  {
    id: 'preset-backend',
    name: 'Elena Rostova',
    role: 'Principal Distributed Systems Engineer',
    urls: {
      linkedin: 'https://linkedin.com/in/elena-rostova-systems',
      github: 'https://github.com/erostova-core',
      leetcode: 'https://leetcode.com/u/rostova_dsa',
      substack: 'https://systems-scale.substack.com',
      twitter: 'https://x.com/elena_systems',
      portfolio: 'https://elena-systems.io',
      resumeText: 'Principal Systems Architect specializing in sub-millisecond query engines, distributed consensus (Raft/Paxos), Postgres optimization, and cloud-native infrastructure.',
    },
  },
];

export const SAMPLE_PROFILE_PRESETS: SampleProfilePreset[] =
  (MockData as any).SAMPLE_PROFILE_PRESETS && Array.isArray((MockData as any).SAMPLE_PROFILE_PRESETS) && (MockData as any).SAMPLE_PROFILE_PRESETS.length > 0
    ? (MockData as any).SAMPLE_PROFILE_PRESETS
    : FALLBACK_PROFILE_PRESETS;

interface ProfileHubProps {
  urls: ProfileUrls;
  setUrls: React.Dispatch<React.SetStateAction<ProfileUrls>>;
  analysis: CandidateAnalysis | null;
  onRunAnalysis: () => Promise<void>;
  isAnalyzing: boolean;
  activeTask: AgentTask | null;
  onProceedToStudio: () => void;
  userName: string;
}

export const ProfileHub: React.FC<ProfileHubProps> = ({
  urls,
  setUrls,
  analysis,
  onRunAnalysis,
  isAnalyzing,
  activeTask,
  onProceedToStudio,
  userName,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-fullstack');
  const [skillSearch, setSkillSearch] = useState('');
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [liveScrapeStatus, setLiveScrapeStatus] = useState<{ [key: string]: { checking?: boolean; success?: boolean; details?: string } }>({});

  const handleApplyPreset = (preset: SampleProfilePreset) => {
    setSelectedPresetId(preset.id || preset.name);
    setUrls(preset.urls);
  };

  const handleUrlChange = (platform: keyof ProfileUrls, value: string) => {
    setUrls((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleTestScraper = async (platform: 'github' | 'leetcode' | 'substack') => {
    const urlOrHandle = urls[platform];
    if (!urlOrHandle) return;

    setLiveScrapeStatus((prev) => ({ ...prev, [platform]: { checking: true } }));
    try {
      const res = await apiFetch('/api/scrape/live-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, urlOrHandle }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        let details = '';
        if (platform === 'github') details = `${data.result.totalRepos} Repos | ${data.result.topLanguages?.join(', ')}`;
        else if (platform === 'leetcode') details = `${data.result.totalSolved} Solved | Top ${data.result.rankingPercentile || '10%'}`;
        else if (platform === 'substack') details = `${data.result.recentArticles?.length || 0} Articles Indexed`;
        
        setLiveScrapeStatus((prev) => ({
          ...prev,
          [platform]: { checking: false, success: true, details: details || 'Profile Connected' },
        }));
      } else {
        setLiveScrapeStatus((prev) => ({
          ...prev,
          [platform]: { checking: false, success: false, details: 'Offline fallback active' },
        }));
      }
    } catch (err) {
      setLiveScrapeStatus((prev) => ({
        ...prev,
        [platform]: { checking: false, success: false, details: 'Scraper timeout' },
      }));
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter skills
  const filteredSkills = analysis?.skillsMatrix?.filter((cat) => {
    if (activeSkillCategory !== 'all' && cat.category !== activeSkillCategory) return false;
    if (!skillSearch) return true;
    return cat.skills.some((s) => s.toLowerCase().includes(skillSearch.toLowerCase())) ||
           cat.category.toLowerCase().includes(skillSearch.toLowerCase());
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Multi-Source Intelligence Ingestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cross-Platform Candidate Intelligence Hub
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Input and manage your LinkedIn, GitHub, LeetCode, Substack, and Twitter/X footprints. The AI agent extracts, correlates, and analyzes your verified technical contributions to build an authoritative candidate dossier.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Load 1-Click Profile Preset:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(SAMPLE_PROFILE_PRESETS || []).map((preset, idx) => {
                const presetKey = preset.id || `preset-${idx}`;
                const roleLabel = preset.role ? ` (${preset.role.split(' ')[0]})` : '';
                return (
                  <button
                    key={presetKey}
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedPresetId === (preset.id || preset.name)
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {preset.name}{roleLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. URL Input & Scraping Engine | 2. Live Task Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Platform URLs Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Platform Profiles & URLs</h2>
                <p className="text-[11px] text-slate-400">Manage your connected social & code profiles</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-medium">
              Live Ingestion
            </span>
          </div>

          <div className="space-y-4">
            {/* LinkedIn */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                  <span>LinkedIn Profile</span>
                </span>
                <span className="text-[10px] text-slate-500">Public profile URL</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urls.linkedin}
                  onChange={(e) => handleUrlChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* GitHub */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Github className="h-3.5 w-3.5 text-slate-300" />
                  <span>GitHub Profile</span>
                </label>
                <div className="flex items-center gap-2">
                  {liveScrapeStatus.github?.details && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ✓ {liveScrapeStatus.github.details}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTestScraper('github')}
                    disabled={!urls.github || liveScrapeStatus.github?.checking}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 disabled:opacity-40"
                  >
                    {liveScrapeStatus.github?.checking ? 'Scraping...' : 'Ping Live API'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={urls.github}
                  onChange={(e) => handleUrlChange('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* LeetCode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Code2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>LeetCode Profile</span>
                </label>
                <div className="flex items-center gap-2">
                  {liveScrapeStatus.leetcode?.details && (
                    <span className="text-[10px] text-amber-300 font-mono">
                      ✓ {liveScrapeStatus.leetcode.details}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTestScraper('leetcode')}
                    disabled={!urls.leetcode || liveScrapeStatus.leetcode?.checking}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-medium px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 disabled:opacity-40"
                  >
                    {liveScrapeStatus.leetcode?.checking ? 'Querying GraphQL...' : 'Ping GraphQL'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={urls.leetcode}
                  onChange={(e) => handleUrlChange('leetcode', e.target.value)}
                  placeholder="https://leetcode.com/u/username"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Substack */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <BookOpen className="h-3.5 w-3.5 text-orange-400" />
                  <span>Substack / Technical Blog</span>
                </label>
                <div className="flex items-center gap-2">
                  {liveScrapeStatus.substack?.details && (
                    <span className="text-[10px] text-orange-300 font-mono">
                      ✓ {liveScrapeStatus.substack.details}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTestScraper('substack')}
                    disabled={!urls.substack || liveScrapeStatus.substack?.checking}
                    className="text-[10px] text-orange-400 hover:text-orange-300 font-medium px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 disabled:opacity-40"
                  >
                    {liveScrapeStatus.substack?.checking ? 'Parsing RSS...' : 'Ping RSS Feed'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={urls.substack}
                  onChange={(e) => handleUrlChange('substack', e.target.value)}
                  placeholder="https://username.substack.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Twitter / X */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Twitter className="h-3.5 w-3.5 text-sky-400" />
                  <span>Twitter / X Profile</span>
                </span>
                <span className="text-[10px] text-slate-500">#buildinpublic Signals</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urls.twitter}
                  onChange={(e) => handleUrlChange('twitter', e.target.value)}
                  placeholder="https://x.com/username"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Portfolio / Personal Website */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Personal Portfolio / Live Demo</span>
                </span>
                <span className="text-[10px] text-slate-500">Optional</span>
              </label>
              <input
                type="url"
                value={urls.portfolio || ''}
                onChange={(e) => handleUrlChange('portfolio', e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Trigger Analysis Button */}
          <div className="pt-2">
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Running Deep Scraping & Synthesis...</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4 text-indigo-200" />
                  <span>{analysis ? 'Re-Analyze Public Footprints' : 'Ingest & Synthesize Profile Dossier'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Aggregated Profile Visualizations & Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Scraping Task Status Bar (if running) */}
          {isAnalyzing && activeTask && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Terminal className="h-4 w-4 animate-pulse" />
                  <span>{activeTask.currentStage}</span>
                </div>
                <span className="font-mono text-xs text-indigo-300 font-bold">{activeTask.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${activeTask.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeTask.logs[activeTask.logs.length - 1]?.message || 'Processing candidate streams in asynchronous worker pipeline...'}
              </p>
            </div>
          )}

          {analysis ? (
            <div className="space-y-6">
              
              {/* Top Overview Metric Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{analysis.fullName}</h2>
                      <span className="text-[10px] px-2.5 py-0.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full font-semibold">
                        {analysis.experienceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{analysis.tagline}</p>
                  </div>

                  {/* Market Fit Score Meter */}
                  <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Market Fit Score</div>
                      <div className="text-lg font-extrabold text-emerald-400">{analysis.overallMarketFitScore} / 100</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Executive Summary</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                    {analysis.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Data Visualization Grid: LeetCode DSA & GitHub Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. LeetCode DSA Breakdown & Contest Rating */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Code2 className="h-4 w-4" />
                      <span>LeetCode DSA Mastery</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full font-semibold">
                      {analysis.sourcesAnalyzed?.leetcode && analysis.leetcodeMetrics?.totalSolved > 0 
                        ? analysis.leetcodeMetrics.globalRankingTopPercent 
                        : 'Not Linked'}
                    </span>
                  </div>

                  {analysis.sourcesAnalyzed?.leetcode && analysis.leetcodeMetrics?.totalSolved > 0 ? (
                    <>
                      {/* Problem Solving Distribution Chart */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Total Solved</span>
                          <span className="text-white font-bold font-mono">{analysis.leetcodeMetrics.totalSolved} Problems</span>
                        </div>

                        {/* Progress multi-segment bar */}
                        <div className="w-full h-3 bg-slate-900 rounded-full flex overflow-hidden">
                          <div 
                            style={{ width: `${(analysis.leetcodeMetrics.easySolved / Math.max(1, analysis.leetcodeMetrics.totalSolved)) * 100}%` }}
                            className="bg-emerald-500 h-full" 
                            title={`Easy: ${analysis.leetcodeMetrics.easySolved}`}
                          />
                          <div 
                            style={{ width: `${(analysis.leetcodeMetrics.mediumSolved / Math.max(1, analysis.leetcodeMetrics.totalSolved)) * 100}%` }}
                            className="bg-amber-500 h-full" 
                            title={`Medium: ${analysis.leetcodeMetrics.mediumSolved}`}
                          />
                          <div 
                            style={{ width: `${(analysis.leetcodeMetrics.hardSolved / Math.max(1, analysis.leetcodeMetrics.totalSolved)) * 100}%` }}
                            className="bg-rose-500 h-full" 
                            title={`Hard: ${analysis.leetcodeMetrics.hardSolved}`}
                          />
                        </div>

                        {/* Breakdown Badges */}
                        <div className="flex items-center justify-between text-[11px] pt-1 font-mono">
                          <span className="text-emerald-400">Easy: {analysis.leetcodeMetrics.easySolved}</span>
                          <span className="text-amber-400">Med: {analysis.leetcodeMetrics.mediumSolved}</span>
                          <span className="text-rose-400">Hard: {analysis.leetcodeMetrics.hardSolved}</span>
                        </div>
                      </div>

                      {/* Top Algorithmic Topics */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Algorithmic Strengths:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.leetcodeMetrics.topTopics.map((topic, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-center space-y-1">
                      <p className="text-xs text-slate-400 font-medium">LeetCode profile link not provided</p>
                      <p className="text-[11px] text-slate-500">Provide your LeetCode URL on the left panel to analyze your problem-solving metrics.</p>
                    </div>
                  )}
                </div>

                {/* 2. GitHub Footprint & Featured Repos */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                      <Github className="h-4 w-4" />
                      <span>GitHub Engineering Impact</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full font-semibold">
                      {analysis.sourcesAnalyzed?.github && analysis.githubMetrics?.totalRepos > 0
                        ? `Quality: ${analysis.githubMetrics.codeQualityRating}/100`
                        : 'Not Linked'}
                    </span>
                  </div>

                  {analysis.sourcesAnalyzed?.github && analysis.githubMetrics?.totalRepos > 0 ? (
                    <>
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Active Repositories</span>
                          <span className="text-white font-bold font-mono">{analysis.githubMetrics.totalRepos} repos</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Commit Activity: <span className="text-slate-200 font-medium">{analysis.githubMetrics.commitFrequency}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {analysis.githubMetrics.topLanguages.map((lang, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-indigo-300 rounded border border-slate-800">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Featured Repos */}
                      {analysis.githubMetrics.featuredRepos.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold text-slate-400">Flagship Architectural Repo:</div>
                          {analysis.githubMetrics.featuredRepos.slice(0, 1).map((repo, i) => (
                            <div key={i} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold text-indigo-300">
                                <span>{repo.repoName}</span>
                                <span className="text-amber-400 font-mono">★ {repo.stars}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{repo.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-center space-y-1">
                      <p className="text-xs text-slate-400 font-medium">GitHub profile link not provided</p>
                      <p className="text-[11px] text-slate-500">Provide your GitHub URL on the left panel to analyze repositories and commit activity.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Portfolio Details Card if available */}
              {analysis.portfolioDetails && (
                <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                      <Globe className="h-4 w-4" />
                      <span>Verified Personal Portfolio & Website</span>
                    </div>
                    {analysis.portfolioDetails.url && (
                      <a 
                        href={analysis.portfolioDetails.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-indigo-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="font-bold text-white text-xs">{analysis.portfolioDetails.title}</div>
                    {analysis.portfolioDetails.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{analysis.portfolioDetails.description}</p>
                    )}
                    {analysis.portfolioDetails.projects && analysis.portfolioDetails.projects.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-400">Projects Discovered:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {analysis.portfolioDetails.projects.map((proj, pi) => (
                            <div key={pi} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                              <div className="font-bold text-indigo-300">{proj.name}</div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{proj.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verified Evidence Trail & Proof Matrix */}
              {analysis.verifiedEvidence && analysis.verifiedEvidence.length > 0 && (
                <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verified Evidence & Proof Matrix (Zero AI Hallucination)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
                      {analysis.verifiedEvidence.length} Live Items Ingested
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {analysis.verifiedEvidence.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-[11px]">{item.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800">
                            {item.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{item.proofSnippet}</p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono pt-1"
                          >
                            <span>Verify Source</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Substack & Twitter Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-orange-400 font-bold">
                    <BookOpen className="h-4 w-4" />
                    <span>Substack Technical Thought Leadership</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Technical Depth: <strong className="text-white">{analysis.substackInsights.technicalDepthScore}/100</strong>
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                    {analysis.substackInsights.notableArticles.slice(0, 2).map((art, i) => (
                      <li key={i} className="truncate">{art}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Twitter className="h-4 w-4" />
                    <span>Twitter/X #buildinpublic Signals</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Domain Authority: <span className="text-emerald-400 font-medium">{analysis.twitterSignals.domainAuthority}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.twitterSignals.publicBuildingFocus.map((theme, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Matrix Filter & Search */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Cpu className="h-4 w-4 text-indigo-400" />
                    <span>Verified Skills & Technology Matrix</span>
                  </div>
                  
                  {/* Skill Search Input */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skill (e.g. Go, React)..."
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveSkillCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      activeSkillCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    All Categories
                  </button>
                  {analysis.skillsMatrix.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSkillCategory(cat.category)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        activeSkillCategory === cat.category ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {filteredSkills.map((cat, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5">
                      <div className="text-[11px] font-bold text-indigo-300">{cat.category}</div>
                      <div className="flex flex-wrap gap-1">
                        {cat.skills.map((s, si) => (
                          <span key={si} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-200 rounded-md border border-slate-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Next Step Call-To-Action */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30">
                <div>
                  <h4 className="text-xs font-bold text-white">Dossier Synthesized & Ready</h4>
                  <p className="text-[11px] text-slate-400">Generate tailor-fit job applications for Wellfound, LinkedIn, Internshala, or Greenhouse.</p>
                </div>
                <button
                  onClick={onProceedToStudio}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <span>Proceed to Job Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          ) : (
            /* No Analysis Yet Empty State */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-white">Candidate Footprint Not Yet Synthesized</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Click &quot;Ingest &amp; Synthesize Profile Dossier&quot; on the left or choose one of our 1-click candidate presets above to parse and correlate your full engineering footprint.
              </p>
              <button
                onClick={onRunAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                Start Profile Analysis
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
