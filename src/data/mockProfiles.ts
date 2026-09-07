import { CandidateAnalysis, ProfileUrls, PlatformType, SampleProfilePreset, SampleJobPreset } from '../types';

export type { SampleProfilePreset, SampleJobPreset };

/**
 * Rich sample profile presets for quick testing and demos
 */
export const SAMPLE_PROFILE_PRESETS: SampleProfilePreset[] = [
  {
    id: 'preset-shivam',
    name: 'Shivam Singh',
    role: 'Staff Full-Stack & AI Systems Engineer',
    urls: {
      linkedin: 'https://linkedin.com/in/shivamsingh-tech',
      github: 'https://github.com/shivamsingh',
      leetcode: 'https://leetcode.com/shivamsingh/',
      substack: 'https://substack.com/@shivamsingh',
      twitter: 'https://x.com/shivamsingh_dev',
      portfolio: 'https://shivamsingh.dev',
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
  {
    id: 'preset-frontend',
    name: 'Marcus Chen',
    role: 'Lead Frontend & Design Engineer',
    urls: {
      linkedin: 'https://linkedin.com/in/marcus-chen-ui',
      github: 'https://github.com/marcuschen-design',
      leetcode: 'https://leetcode.com/u/mchen_web',
      substack: 'https://craftinginterfaces.substack.com',
      twitter: 'https://x.com/marcus_crafts',
      portfolio: 'https://marcuschen.studio',
      resumeText: 'Design Engineer & UI Architect with deep expertise in React 19, WebGL, Tailwind, accessible component architectures, and fluid micro-interaction systems.',
    },
  },
];

/**
 * Curated sample job presets for testing application generation
 */
export const SAMPLE_JOB_PRESETS: SampleJobPreset[] = [
  {
    id: 'job-1',
    title: 'Senior Full-Stack AI Engineer',
    company: 'NexusFlow AI',
    platform: 'wellfound',
    salary: '$160,000 – $210,000 + 0.5% Equity',
    description: `About NexusFlow AI:
NexusFlow is building autonomous agentic workflows for modern enterprise data stacks. We're looking for a Senior Full-Stack AI Engineer to own end-to-end multi-agent orchestration, realtime streaming dashboards, and high-performance React frontends.

Responsibilities:
- Architect and deploy production LLM workflows using Gemini, Claude, and OpenAI APIs.
- Build high-responsiveness web interfaces in React, TypeScript, and Tailwind CSS.
- Optimize distributed backend services in Node.js/Go with PostgreSQL and vector stores.
- Design resilient retrieval-augmented generation (RAG) and tool-calling agent loops.

Requirements:
- 4+ years of professional full-stack development experience.
- Strong proficiency with TypeScript, React, Node.js, and modern CSS.
- Hands-on experience integrating LLM APIs, function calling, or vector search.
- Track record of shipping customer-facing features with high craft and polish.`,
  },
  {
    id: 'job-2',
    title: 'Staff Backend & Infrastructure Engineer',
    company: 'HyperScale Cloud',
    platform: 'linkedin',
    salary: '$180,000 – $240,000 + RSU Grants',
    description: `HyperScale Cloud is hiring a Staff Backend Engineer to scale our multi-tenant telemetry and routing engine handling 100k+ req/sec.

Requirements:
- Deep experience in distributed systems, Golang or Node/TypeScript, and Postgres.
- Strong background in high-concurrency event streaming (Kafka/Pulsar/Redis).
- Proven ability to mentor engineering teams and design resilient API contracts.`,
  },
  {
    id: 'job-3',
    title: 'Lead Frontend Architect',
    company: 'Starlight Design Labs',
    platform: 'general',
    salary: '$150,000 – $195,000 + Equity',
    description: `Starlight Design Labs is seeking a Lead Frontend Architect to spearhead our next-generation collaborative canvas and design suite.

Requirements:
- Exceptional mastery of modern React, WebGL/Canvas rendering, and TypeScript.
- Strong understanding of web performance, bundle optimization, and accessible UI.
- Passion for visual craftsmanship, fluid physics animations, and typographic precision.`,
  },
];

/**
 * Default sample candidate analysis used for initial UI state and demos
 */
export const DEFAULT_SAMPLE_ANALYSIS: CandidateAnalysis = {
  id: 'analysis-sample-01',
  fullName: 'Shivam Singh',
  tagline: 'Staff Full-Stack & AI Systems Engineer',
  executiveSummary: 'Staff engineer with 6+ years of expertise across high-concurrency distributed systems, full-stack web development (React/Node/TypeScript), and real-time agentic AI architectures. Recognized for open-source contributions, high LeetCode competitive ranking, and deep technical writing on distributed systems and AI agents.',
  experienceLevel: 'Staff / Principal (6+ Years)',
  skillsMatrix: [
    {
      category: 'AI & Machine Learning Systems',
      skills: ['Gemini API', 'LLM Function Calling', 'RAG Pipelines', 'Vector Databases (pgvector, Pinecone)', 'Multi-Agent Orchestration', 'Prompt Engineering'],
    },
    {
      category: 'Frontend & UI Craftsmanship',
      skills: ['React 18/19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'State Management (Zustand, TanStack)', 'Web Performance & Core Web Vitals'],
    },
    {
      category: 'Backend & Distributed Systems',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'SQLite / WASM', 'Redis', 'REST & GraphQL APIs', 'Docker', 'Microservices'],
    },
    {
      category: 'Algorithms & Architecture',
      skills: ['Distributed Consensus', 'Event-Driven Architectures', 'Data Structures & Algorithms', 'System Design', 'CI/CD Automation'],
    },
  ],
  githubMetrics: {
    username: 'shivamsingh',
    totalRepos: 36,
    topLanguages: ['TypeScript', 'Python', 'Go', 'Rust'],
    featuredRepos: [
      {
        repoName: 'omni-agent-orchestrator',
        stars: 1240,
        forks: 185,
        primaryLanguage: 'TypeScript',
        description: 'Autonomous multi-model agent pipeline with dynamic tool synthesis and streaming memory backplane.',
        architecturalHighlights: 'Zero-latency streaming protocol, type-safe schema validators, pluggable vector index drivers.',
      },
      {
        repoName: 'vector-sqlite-wasm',
        stars: 860,
        forks: 94,
        primaryLanguage: 'C / WebAssembly',
        description: 'Lightweight in-browser and serverless vector similarity search compiled to WebAssembly.',
        architecturalHighlights: 'Sub-millisecond cosine distance indexing on 50k embeddings in local memory.',
      },
      {
        repoName: 'hyper-craft-ui',
        stars: 520,
        forks: 41,
        primaryLanguage: 'TypeScript',
        description: 'Accessible, performance-tuned React component library with mathematical typography scaling.',
        architecturalHighlights: 'Zero-runtime style extraction, headless Radix foundation, 100% WCAG AA compliance.',
      },
    ],
    commitFrequency: 'Daily (2,840 commits in the last 12 months)',
    codeQualityRating: 95,
  },
  leetcodeMetrics: {
    totalSolved: 642,
    easySolved: 210,
    mediumSolved: 348,
    hardSolved: 84,
    estimatedRating: 2180,
    topTopics: ['Dynamic Programming', 'Graph Theory', 'Trie / Segment Trees', 'Concurrency & Sliding Window'],
    globalRankingTopPercent: 'Top 1.8%',
  },
  linkedinHighlights: {
    headline: 'Staff Full-Stack & AI Systems Engineer | Ex-Meta | Multi-Agent Systems & Distributed Infra',
    yearsOfExp: 6,
    keyAchievements: [
      'Spearheaded transition to event-driven vector pipeline, reducing end-to-end model inference latency by 42%.',
      'Engineered core search indexing engine processing 200M+ queries daily with 99.99% uptime.',
      'Led cross-functional team of 11 engineers building next-generation enterprise AI copilot platform.',
    ],
    industryDomains: ['Enterprise SaaS', 'Generative AI', 'Cloud Infrastructure', 'Developer Tooling'],
  },
  substackInsights: {
    handle: 'shivamsingh',
    publicationTopics: ['Distributed Systems at Scale', 'Practical Agent Architecture', 'Database Internals'],
    technicalDepthScore: 92,
    notableArticles: [
      'Building Production LLM Loops: Moving Beyond Basic Chains to Resilient State Machines',
      'The Mechanical Sympathy of Node.js Event Loops Under 100k Concurrent Connections',
      'Why We Replaced Our Vector DB with Postgres pgvector at Scale',
    ],
  },
  twitterSignals: {
    handle: 'shivamsingh_dev',
    publicBuildingFocus: ['Building open-source AI tooling in public', 'WebAssembly runtime performance', 'Engineering leadership & craft'],
    domainAuthority: 'High (Verified Engineering Contributor & Speaker)',
  },
  portfolioDetails: {
    title: 'Shivam Singh — Systems & AI Engineer',
    description: 'Portfolio showcasing distributed applications, open-source AI toolkits, and technical publications.',
    bio: 'Software engineer obsessed with latency, elegant UI ergonomics, and autonomous AI agents.',
    url: 'https://shivamsingh.dev',
    projects: [
      {
        name: 'OmniApply Copilot',
        desc: 'Autonomous cross-platform job application and candidate intelligence system.',
        tech: 'React, TypeScript, Express, PostgreSQL/SQLite, Gemini 2.5',
      },
      {
        name: 'Distributed Task Mesh',
        desc: 'Self-healing worker pool for high-throughput batch transformations.',
        tech: 'Go, gRPC, Redis, Docker',
      },
    ],
    detectedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Go', 'Docker', 'AI Engineering'],
  },
  verifiedEvidence: [
    {
      type: 'repo',
      title: 'omni-agent-orchestrator',
      proofSnippet: 'Over 1,200 GitHub stars with active production adoption in agentic workflows.',
      source: 'GitHub',
      url: 'https://github.com/shivamsingh/omni-agent-orchestrator',
    },
    {
      type: 'dsa',
      title: 'Knight Level Competitive Programmer',
      proofSnippet: 'Solved 640+ problems with 2180 contest rating (Top 1.8% worldwide).',
      source: 'LeetCode',
      url: 'https://leetcode.com/shivamsingh/',
    },
    {
      type: 'article',
      title: 'Production LLM Loops Architecture',
      proofSnippet: 'Deep dive technical analysis with 15k+ reads on distributed agent design patterns.',
      source: 'Substack',
      url: 'https://substack.com/@shivamsingh',
    },
  ],
  keyStrengths: [
    'Proven ability to build end-to-end systems from low-level distributed infrastructure to polished user interfaces.',
    'Exceptional algorithmic foundation backed by verified LeetCode rankings and open-source contributions.',
    'Deep expertise with state-of-the-art Generative AI APIs, multi-agent frameworks, and vector search indexing.',
    'Articulate technical communicator with published thought leadership and active developer community footprint.',
  ],
  competitiveAdvantages: [
    'Combines Staff-level backend architecture knowledge with modern frontend design craftsmanship.',
    'Hands-on experience deploying real-time LLM agent workflows in high-traffic enterprise environments.',
    'Proven track record of shipping fast, reliable software with zero external dependencies.',
  ],
  growthAreas: [
    'Continuous expansion into custom fine-tuning and quantized on-device model deployment (ONNX/TensorRT).',
  ],
  overallMarketFitScore: 96,
  analyzedAt: new Date().toISOString(),
  sourcesAnalyzed: {
    linkedin: true,
    github: true,
    leetcode: true,
    substack: true,
    twitter: true,
    portfolio: true,
  },
};
