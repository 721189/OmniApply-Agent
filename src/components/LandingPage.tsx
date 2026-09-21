import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Terminal, 
  GitBranch, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  Zap, 
  Crown, 
  Award, 
  Code2, 
  Search, 
  ChevronRight, 
  Play, 
  Star, 
  ExternalLink,
  Lock,
  BarChart3,
  TrendingUp,
  Clock,
  Compass,
  Check,
  Smartphone
} from 'lucide-react';
import { UserAccount, PlatformType } from '../types';
import { 
  DoodleArrow, 
  DoodleCrown, 
  DoodleUnderline, 
  DoodleSparkle, 
  RazorpayBadge 
} from './DoodleAccents';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenAuth: () => void;
  onOpenAtsScan: () => void;
  onOpenPricing: () => void;
  onOpenDoodle: () => void;
  onSelectPresetJob?: (job: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    targetPlatform: PlatformType;
  }) => void;
  currentUser: UserAccount | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onOpenAuth,
  onOpenAtsScan,
  onOpenPricing,
  onOpenDoodle,
  onSelectPresetJob,
  currentUser,
}) => {
  // Interactive Terminal / Pipeline Mockup State
  const [activePipelineTab, setActivePipelineTab] = useState<'ingest' | 'ats' | 'dossier' | 'doodle'>('ingest');
  
  // Interactive Sandbox Role Selector
  const [selectedSandboxRole, setSelectedSandboxRole] = useState<number>(0);
  
  // Pricing toggles
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'quarterly'>('monthly');
  const [pricingCurrency, setPricingCurrency] = useState<'INR' | 'USD'>('INR');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const sandboxRoles = [
    {
      title: 'Senior Distributed Systems Engineer',
      company: 'Stripe',
      platform: 'linkedin' as PlatformType,
      atsScore: 98,
      keySkills: ['Rust / Go', 'Raft Consensus', 'Distributed Tracing', 'P99 Latency Tuning'],
      repoCitation: 'alexchen-dev/distributed-kv (PR #42: Log Compaction & Snapshotting)',
      sampleHook: 'Architected distributed key-value storage engine in Rust with Raft consensus; reduced P99 write replication latency by 42% under 100k QPS simulation.',
      fullDescription: `Stripe's Infrastructure engineering team is seeking a Senior Distributed Systems Engineer to scale core ledger consensus, reduce latency on high-throughput financial transactions, and maintain 99.999% availability under multi-region failover.`,
    },
    {
      title: 'Staff AI / Full-Stack Engineer',
      company: 'Vercel / Next.js',
      platform: 'wellfound' as PlatformType,
      atsScore: 96,
      keySkills: ['TypeScript / Next.js', 'LLM Agents & Tool Use', 'Streaming Edge Runtimes', 'PostgreSQL'],
      repoCitation: 'alexchen-dev/agent-orchestrator (Commit #8a41c: Zero-copy SSE Streaming)',
      sampleHook: 'Spearheaded AI workflow orchestrator integrating multi-modal Gemini models with sub-80ms streaming response times over Vercel Edge functions.',
      fullDescription: `Vercel is looking for an exceptional Staff AI Engineer to drive edge agent primitives, real-time code streaming compilers, and production AI developer infrastructure.`,
    },
    {
      title: 'Senior Site Reliability & Platform Engineer',
      company: 'Razorpay',
      platform: 'linkedin' as PlatformType,
      atsScore: 97,
      keySkills: ['Kubernetes / EKS', 'Zero-Downtime Migration', 'Terraform', 'Kafka & UPI Pipelines'],
      repoCitation: 'alexchen-dev/k8s-mesh-operator (Terraform / Helm Production Pipeline)',
      sampleHook: 'Orchestrated zero-downtime multi-cluster Kubernetes migration processing 14,000 requests/sec with automated canary rollbacks and eBPF network observability.',
      fullDescription: `Razorpay platform engineering powers millions of digital payments daily. Looking for an SRE to build resilient, fault-tolerant infrastructure handling peak festive traffic with 99.999% uptime.`,
    },
  ];

  const handleLaunchRoleInStudio = (index: number) => {
    const role = sandboxRoles[index];
    if (onSelectPresetJob) {
      onSelectPresetJob({
        jobTitle: role.title,
        companyName: role.company,
        jobDescription: role.fullDescription,
        targetPlatform: role.platform,
      });
    }
    onLaunchApp();
  };

  const faqs = [
    {
      q: 'How does OmniApply differ from generic AI resume tools?',
      a: 'Most tools generate generic, hallucinated buzzwords that ATS filters and technical hiring managers immediately reject. OmniApply reverse-engineers your actual GitHub repositories, Git commit diffs, LeetCode algorithm percentiles, and system architecture. Every claim in your dossier cites provable, real-world technical artifacts.',
    },
    {
      q: 'How does the Razorpay checkout integration work?',
      a: 'OmniApply integrates with Razorpay to provide secure, frictionless commercial checkout worldwide. Candidates in India can pay instantly via UPI (Google Pay, PhonePe, Paytm, CRED), NetBanking across 50+ banks, RuPay/Visa/Mastercard debit and credit cards, and EMI. International candidates can transact in USD with zero conversion friction.',
    },
    {
      q: 'What is the Doodle 1:1 Executive Advisory session?',
      a: 'Executive Pass members get direct calendar booking via Doodle with senior engineering leaders and advisory partners. We conduct high-fidelity mock technical screens, deconstruct live multi-offer compensation packages, calculate equity upside, and formulate counter-offer leverage scripts.',
    },
    {
      q: 'Is my private code and repository data kept confidential?',
      a: 'Yes, absolutely. OmniApply processes repository metadata and AST tokens through isolated memory buffers and encrypted sessions. Your code is never sold or used to train public models. You retain 100% intellectual property ownership of your dossiers and resume packages.',
    },
    {
      q: 'Can I export my customized resumes to PDF or ATS text format?',
      a: 'Yes! OmniApply exports pixel-perfect, clean single-page PDF resumes formatted with strict ATS margins, standardized section headers (Greenhouse, Lever, Workday approved), and copy-pasteable Markdown packages.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full" />
        <div className="absolute -top-24 right-1/4 w-[450px] h-[450px] bg-purple-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-64 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" 
      />

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-900/80">
        
        {/* Top Product Announcement Strip */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 border-b border-indigo-500/20 text-[11px] py-1.5 px-4 text-center flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-indigo-200">
            <span className="px-1.5 py-0.2 bg-indigo-500/30 text-indigo-300 font-bold rounded text-[9px] uppercase tracking-wider border border-indigo-500/40">
              v2.0 Release
            </span>
            <span><strong>Engineering Career Engine:</strong> Autonomous job application preparation grounded in your actual code & repositories</span>
          </span>
          <button
            onClick={onOpenAtsScan}
            className="hidden sm:inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline ml-2"
          >
            <span>Run Free ATS Scan</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & Brand Identity */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={onLaunchApp}>
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    OmniApply <span className="text-indigo-400 font-extrabold">AI</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    v2.0
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-400">
                  Autonomous Career Intelligence & Application Engine
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
              <a href="#pipeline" className="hover:text-white transition-colors">
                Agent Architecture
              </a>
              <a href="#sandbox" className="hover:text-white transition-colors">
                Live Interactive Sandbox
              </a>
              <a href="#benchmarks" className="hover:text-white transition-colors">
                ATS Deconstruction
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing (Razorpay)
              </a>
              <button 
                onClick={onOpenDoodle}
                className="hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>Doodle 1:1</span>
              </button>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={onOpenAtsScan}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
              >
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                <span>Free ATS Scan</span>
              </button>

              {currentUser ? (
                <button
                  onClick={onLaunchApp}
                  className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>{currentUser.name?.split(' ')[0] || 'My Workspace'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-2 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              )}

              {/* Primary Launch Button */}
              <button
                onClick={onLaunchApp}
                className="flex items-center gap-2 py-2 px-4 sm:py-2.5 sm:px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer group"
              >
                <span>Launch App</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 shadow-inner shadow-indigo-500/10">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Autonomous Career Assistant</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-slate-400">Grounded in Real Repositories & Experience</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          The Engineering Career Assistant.
          <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Grounded in your actual code and commits.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
          Stop relying on generic AI tools that invent buzzwords. OmniApply analyzes your public GitHub repositories, LeetCode milestones, and technical background to synthesize accurate, ATS-aligned application packages and interview-ready dossiers.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-12">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Enter App Studio & Workspace</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenAtsScan}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award className="h-4 w-4 text-emerald-400" />
            <span>Instant ATS Match Scorecard</span>
          </button>

          <button
            onClick={onOpenDoodle}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>Book 1:1 on Doodle</span>
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Grounded in Real GitHub Repositories</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Standard ATS-Friendly Formatting</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Razorpay Secure Payments (UPI & Cards)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Doodle Calendar Synchronization</span>
          </div>
        </div>

      </section>

      {/* ================= INTERACTIVE PIPELINE PREVIEW / TERMINAL ================= */}
      <section id="pipeline" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Mac OS Window Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 ml-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span>omniapply-agent.engine.v2.worker</span>
              </span>
            </div>

            {/* Pipeline Stage Selectors */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-semibold w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActivePipelineTab('ingest')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  activePipelineTab === 'ingest'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="h-3 w-3" />
                <span>1. Code Ingestion</span>
              </button>

              <button
                onClick={() => setActivePipelineTab('ats')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  activePipelineTab === 'ats'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="h-3 w-3" />
                <span>2. ATS Reverse-Engine</span>
              </button>

              <button
                onClick={() => setActivePipelineTab('dossier')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  activePipelineTab === 'dossier'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>3. Tailored Dossier</span>
              </button>

              <button
                onClick={() => setActivePipelineTab('doodle')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  activePipelineTab === 'doodle'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>4. Doodle Mocks</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen View */}
          <div className="p-6 sm:p-8 bg-slate-950/60 font-mono text-xs">
            {activePipelineTab === 'ingest' && (
              <div className="space-y-4">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>// Step 1: Autonomous AST Parsing & Repository Provenance</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    AST Synced (5 repositories)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-indigo-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="h-4 w-4 text-indigo-400" />
                        <span>alexchen-dev/distributed-kv</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Rust • 42 Commits</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Extracted architectural contribution: Implemented write-ahead logging (WAL) & snapshotting with Raft consensus protocol.
                    </p>
                    <div className="text-[10px] text-emerald-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      ✓ Benchmark verified: Reduced tail P99 write latency by 42%
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Code2 className="h-4 w-4 text-purple-400" />
                        <span>LeetCode Competitive Profile</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Rating 2,140 (Top 1.8%)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Parsed 480+ solved problems: Graphs (Dijkstra, Tarjan SCC), Dynamic Programming, and Concurrency sync primitives.
                    </p>
                    <div className="text-[10px] text-purple-300 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      ✓ Algorithmic pattern detection: Graph traversal, DP, and concurrency patterns identified
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePipelineTab === 'ats' && (
              <div className="space-y-4">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>// Step 2: Algorithmic Parser & Keyword Analysis</span>
                  <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Target ATS Format: Single-Column Standard
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Sample Target Role:</span>
                      <h4 className="text-sm font-bold text-white">Senior Distributed Systems Engineer</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400 font-mono">98.4%</span>
                      <span className="block text-[10px] text-emerald-400/80">Sample Match Score</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full w-[98.4%]" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Hard Keywords</span>
                      <span className="text-emerald-300 font-semibold">14/14 Matched</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Quant Metrics</span>
                      <span className="text-emerald-300 font-semibold">Highlighted</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Parse Safety</span>
                      <span className="text-emerald-300 font-semibold">No Complex Tables</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Format Grade</span>
                      <span className="text-emerald-300 font-semibold">Single-Column Clean</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePipelineTab === 'dossier' && (
              <div className="space-y-4">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>// Step 3: Multi-Platform Autonomous Dossier Assembly</span>
                  <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    4 Formats Ready
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span>Grounded STAR Resume Bullet</span>
                    </span>
                    <span className="text-[10px] text-slate-400">ATS Standard Format</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    "Designed and deployed a fault-tolerant distributed key-value store using Raft consensus (Rust), authoring log compaction protocols that reduced tail write latency by 42% across 12-node clusters under 100k requests/sec."
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Wellfound Pitch Included
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Recruiter Cold Sequence Ready
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Single-Page PDF Ready
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activePipelineTab === 'doodle' && (
              <div className="space-y-4">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>// Step 4: Executive Coaching & Doodle 1:1 Booking</span>
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Doodle Calendar Sync
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 font-sans">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <DoodleCrown className="w-5 h-5 text-amber-400" />
                        <span>1-on-1 Offer Strategy & Technical Mock via Doodle</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Executive Pass candidates can book direct calendar slots with senior engineering leaders. We formulate multi-offer leverage tactics and live system design simulations.
                      </p>
                    </div>
                    <button
                      onClick={onOpenDoodle}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0"
                    >
                      Book Session
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Includes Doodle Group Availability Poll generator for scheduling directly with recruiter panels.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terminal Footer CTA */}
            <div className="pt-4 mt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 font-sans">
              <span className="text-xs">
                Inspect candidate analysis, execute autonomous applications, and manage saved pipelines inside the app.
              </span>
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Launch Full App Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================= PLATFORM CAPABILITIES & TRANSPARENCY ================= */}
      <section className="border-y border-slate-900 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
            Tailored for modern software engineering workflows & hiring pipelines
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-300 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Wellfound (AngelList) Pitch Format
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Standard Single-Column ATS Layout
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              LinkedIn Recruiter Direct Messaging
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Technical Screening Q&A Generator
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 mt-10 border-t border-slate-900 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">5 Profiles</div>
              <p className="text-xs text-slate-400 mt-1">GitHub, LeetCode, LinkedIn, Substack, X</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">100% Real</div>
              <p className="text-xs text-slate-400 mt-1">Grounded in your actual code and repos</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">0 Fake Claims</div>
              <p className="text-xs text-slate-400 mt-1">No invented experience or hallucinated libraries</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">Multi-Format</div>
              <p className="text-xs text-slate-400 mt-1">Cover letters, resumes, pitches & emails</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE ROLE SANDBOX ================= */}
      <section id="sandbox" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-3 border border-indigo-500/20">
            <Play className="h-3 w-3" />
            <span>Interactive Live Teaser</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            See How OmniApply Tailors For Your Target Role
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Select an engineering role archetype below to see real-time AST code extraction, ATS match score, and synthesized recruiter talking points.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-8">
          {sandboxRoles.map((role, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSandboxRole(idx)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                selectedSandboxRole === idx
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  {role.company}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  {role.atsScore}% Match
                </span>
              </div>
              <h3 className="text-xs font-bold text-white line-clamp-1">
                {role.title}
              </h3>
            </button>
          ))}
        </div>

        {/* Active Sandbox Role Detail Card */}
        {(() => {
          const currentRole = sandboxRoles[selectedSandboxRole];
          return (
            <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-400">{currentRole.company}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 uppercase font-semibold">{currentRole.platform} Format</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{currentRole.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <div className="text-2xl font-black text-emerald-400 font-mono leading-none">
                      {currentRole.atsScore}%
                    </div>
                    <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider">ATS Score</span>
                  </div>
                  <button
                    onClick={() => handleLaunchRoleInStudio(selectedSandboxRole)}
                    className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in App Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Extracted AST Repository Evidence</span>
                    </h4>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300">
                      {currentRole.repoCitation}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-purple-400" />
                      <span>Validated Competency Matrix</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentRole.keySkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Synthesized Recruiter Hook</span>
                    </h4>
                    <p className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      "{currentRole.sampleHook}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                    <span>Ready for 1-click submission or PDF export</span>
                    <button
                      onClick={() => handleLaunchRoleInStudio(selectedSandboxRole)}
                      className="font-bold underline hover:text-white"
                    >
                      Customize in Studio →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ================= TECHNICAL VALUE PILLARS (BENTO GRID) ================= */}
      <section id="benchmarks" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Architected for Maximum Technical Conviction
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Eliminate generic hallucinations. OmniApply proves your engineering capabilities through AST static analysis, ATS reverse-engineering, and commercial payment security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Card 1: AST Repo Analysis */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AST Repository Grounding</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                We inspect your actual commit history, pull request descriptions, and architectural benchmarks. Every bullet in your resume links to verifiable code evidence.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-indigo-300 font-mono">
              ✓ Zero hallucinated frameworks or fake statistics
            </div>
          </div>

          {/* Bento Card 2: ATS Deconstruction */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Enterprise ATS Deconstruction</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Tested continuously against parser engines used by Greenhouse, Lever, Workday, and Taleo. We identify semantic keyword mismatches and layout risks before you submit.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono">
              ✓ Formatted for standard ATS readability & keyword density
            </div>
          </div>

          {/* Bento Card 3: Razorpay & Doodle Integrations */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Razorpay & Doodle Scheduling</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Frictionless payment processing with instant UPI (Google Pay, PhonePe, Paytm), NetBanking, and USD cards via Razorpay. Direct Doodle booking for 1:1 strategy and mock interview sessions.
              </p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <span className="text-purple-300 font-mono">Instant UPI & Doodle Sync</span>
              <RazorpayBadge />
            </div>
          </div>

        </div>
      </section>

      {/* ================= TRANSPARENT ARCHITECTURAL WORKFLOW ================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Engineering Philosophy</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How OmniApply Actually Works
          </h2>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            No fabricated metrics or hallucinated skills. A deterministic pipeline that turns your genuine engineering output into high-impact applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Ingest Public Technical Footprint</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your public GitHub repos, LeetCode profile, or LinkedIn summary. The engine identifies your verified programming languages, architectural patterns, and algorithmic breadth directly from source.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-800/80 text-[11px] text-indigo-300 font-mono">
              ✓ Direct Git repository AST analysis
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Analyze Real Job Specifications</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste any job posting from Wellfound, LinkedIn, or company career portals. The scanner parses hard technical requirements, tooling prerequisites, and soft criteria to identify keyword overlap and missing areas.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-800/80 text-[11px] text-emerald-300 font-mono">
              ✓ Keyword density & gap diagnostics
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Synthesize Verified Dossiers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates tailored cover letters, Wellfound startup notes, and concise STAR resume bullets that specifically cite your authentic repositories and real technical achievements—so you can defend every claim in an interview.
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-800/80 text-[11px] text-purple-300 font-mono">
              ✓ Honest citations you can defend live
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING OVERVIEW SECTION ================= */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Commercial Plans</span>
            <RazorpayBadge />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transparent Investment in Your Career
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Self-serve plans with instant activation, secure Razorpay checkout (UPI & Cards), and cancellation anytime.
          </p>

          {/* Pricing Controls: Currency & Cycle */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="inline-flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPricingCurrency('INR')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  pricingCurrency === 'INR'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ₹ INR (UPI / Cards)
              </button>
              <button
                onClick={() => setPricingCurrency('USD')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  pricingCurrency === 'USD'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                $ USD (Global)
              </button>
            </div>

            <div className="inline-flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPricingCycle('monthly')}
                className={`px-3.5 py-1 rounded-lg font-semibold transition-all ${
                  pricingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingCycle('quarterly')}
                className={`px-3.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  pricingCycle === 'quarterly'
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
          </div>
        </div>

        {/* Pricing 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Starter Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-white font-mono">
                  {pricingCurrency === 'INR' ? '₹0' : '$0'}
                </span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Basic candidate dossier synthesis and application tracking.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>5 Tailored Job Dossiers / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Instant ATS Match Scan & Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Kanban Application Tracker</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>10 AI Copilot Queries</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLaunchApp}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Plan (Highlighted with Hand-drawn Doodle Arrow) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 flex flex-col justify-between relative">
            
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
              <div className="flex items-center justify-between mb-2 mt-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-indigo-400" />
                  <span>OmniApply Pro</span>
                </h3>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-white font-mono">
                  {pricingCurrency === 'INR' 
                    ? (pricingCycle === 'monthly' ? '₹1,999' : '₹1,599') 
                    : (pricingCycle === 'monthly' ? '$24' : '$19')}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                Autonomous 24/7 career agent tailored to your code & GitHub.
              </p>
              <DoodleUnderline className="w-32 h-2 text-indigo-400/80 mb-6" />

              <div className="space-y-2.5 mb-8 text-xs text-slate-200">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span><strong>Unlimited</strong> AI Job Dossiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Multi-Profile Ingestion (GitHub, LeetCode, X)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Continuous 95%+ ATS Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Automated Recruiter Cold Sequences</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span><strong>Unlimited</strong> AI Copilot Chat</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenPricing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Upgrade via Razorpay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Executive Pass */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <DoodleCrown className="w-5 h-5 text-amber-400" />
                  <span>Executive Pass</span>
                </h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-white font-mono">
                  {pricingCurrency === 'INR' ? '₹5,999' : '$72'}
                </span>
                <span className="text-xs text-slate-400">/ quarter</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Senior negotiation, game theory & 1-on-1 Doodle mock sessions.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span><strong>Everything</strong> in Pro Tier</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300 font-medium">
                  <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                  <span><strong>1-on-1 Advisory & Mocks via Doodle</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Multi-Offer Game Theory Calculator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Recruiter Doodle Availability Polls</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenPricing}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Executive Pass</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* Razorpay Trust Bar */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>Secured with Razorpay 256-bit encryption. Instant UPI (Google Pay, PhonePe, Paytm), NetBanking & Global Cards.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
            <Smartphone className="h-4 w-4 text-indigo-400" />
            <span>Cancel Anytime • Transparent Pricing</span>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE FAQS ================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Everything you need to know about the platform, code grounding, and commercial billing.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left text-sm font-bold text-slate-200 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-500 font-mono text-sm ml-4">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= BOTTOM CALL TO ACTION ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border border-indigo-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to streamline your engineering career?
            </h2>
            <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
              Launch OmniApply now. Ingest your GitHub repositories, diagnose your ATS keyword coverage, and generate honest, interview-ready dossiers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-white text-slate-950 text-sm font-bold hover:bg-slate-100 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter App Studio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onOpenAtsScan}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Run Free ATS Scan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LANDING FOOTER ================= */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-300">OmniApply AI</span>
              <p className="text-[11px] text-slate-500">Autonomous Engineering Career Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs">
            <button onClick={onLaunchApp} className="hover:text-white transition-colors cursor-pointer">
              Launch App
            </button>
            <button onClick={onOpenAtsScan} className="hover:text-white transition-colors cursor-pointer">
              ATS Scanner
            </button>
            <button onClick={onOpenPricing} className="hover:text-white transition-colors cursor-pointer">
              Razorpay Pricing
            </button>
            <button onClick={onOpenDoodle} className="hover:text-white transition-colors cursor-pointer">
              Doodle 1:1 Booking
            </button>
            <button onClick={onOpenAuth} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All Systems Operational • v2.0 Release</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
