import { ProfileUrls } from '../types';

export interface SampleProfilePreset {
  id: string;
  name: string;
  role: string;
  urls: ProfileUrls;
  headline: string;
}

export const SAMPLE_PROFILE_PRESETS: SampleProfilePreset[] = [
  {
    id: 'preset-fullstack',
    name: 'Alex Rivera',
    role: 'Senior Full-Stack & Distributed Systems Engineer',
    headline: 'Building high-throughput APIs, distributed systems, & high-performance React UI',
    urls: {
      github: 'https://github.com/alexrivera-dev',
      linkedin: 'https://linkedin.com/in/alexrivera-tech',
      leetcode: 'https://leetcode.com/u/alex_algorithms',
      substack: 'https://systemsengineering.substack.com',
      twitter: 'https://x.com/alexrivera_codes',
      portfolio: 'https://alexrivera.engineer',
      resumeText: '6+ years in TypeScript, Node.js, Go, React, PostgreSQL, Docker, Redis. Led backend migration processing 25M daily events.'
    }
  },
  {
    id: 'preset-aiml',
    name: 'Priya Sharma',
    role: 'AI / LLM Systems & Full-Stack Engineer',
    headline: 'Fine-tuning LLMs, building agentic workflows, & multi-modal AI applications',
    urls: {
      github: 'https://github.com/priyasharma-ai',
      linkedin: 'https://linkedin.com/in/priya-sharma-ml',
      leetcode: 'https://leetcode.com/u/priya_dsa_pro',
      substack: 'https://thelatentvector.substack.com',
      twitter: 'https://x.com/priya_agents',
      portfolio: 'https://priyasharma.ai',
      resumeText: '4+ years in Python, PyTorch, LangChain, FastAPI, Next.js, Vector DBs (Pinecone, Qdrant), Gemini API, Kubernetes.'
    }
  },
  {
    id: 'preset-intern',
    name: 'Rohan Gupta',
    role: 'Aspiring Software Engineer & Competitive Programmer',
    headline: 'Knight on LeetCode | 600+ Problems | Full-Stack Builder | 2026 Batch',
    urls: {
      github: 'https://github.com/rohangupta-code',
      linkedin: 'https://linkedin.com/in/rohan-gupta-cs',
      leetcode: 'https://leetcode.com/u/rohan_codes_fast',
      substack: 'https://rohanlearnscs.substack.com',
      twitter: 'https://x.com/rohan_builds',
      portfolio: 'https://rohangupta.dev',
      resumeText: 'Computer Science undergraduate with 600+ LeetCode problems solved. Built full-stack e-commerce & real-time chat apps with React, Express, MongoDB, Socket.io.'
    }
  }
];

export interface SampleJobPreset {
  id: string;
  title: string;
  company: string;
  platform: 'wellfound' | 'linkedin' | 'internshala' | 'greenhouse';
  location: string;
  salary: string;
  description: string;
}

export const SAMPLE_JOB_PRESETS: SampleJobPreset[] = [
  {
    id: 'job-wellfound-1',
    title: 'Senior Full-Stack Engineer (Founding Team)',
    company: 'NexusFlow AI',
    platform: 'wellfound',
    location: 'Remote / San Francisco, CA',
    salary: '$140k – $185k • 0.5% – 1.5% Equity',
    description: `About the Role:
We are looking for a Founding Full-Stack Engineer to lead the architecture of our real-time AI automation platform. You will be working directly with the founders to build end-to-end features across our React frontend, Node/Go backend services, and multi-tenant Redis/Postgres infrastructure.

Requirements:
- 4+ years of experience with TypeScript, React, Node.js, and modern SQL/NoSQL databases.
- Experience with asynchronous task queues (Celery/Redis/RabbitMQ) and event-driven architecture.
- Comfortable working in a high-velocity startup environment with high autonomy.
- Proven track record of shipping production features with clean code and tests.
- Experience with AI SDKs or LLM orchestration is a massive plus.`
  },
  {
    id: 'job-linkedin-1',
    title: 'Lead Frontend / Full-Stack Platform Engineer',
    company: 'Stripe',
    platform: 'linkedin',
    location: 'Seattle, WA / Remote',
    salary: '$175k – $220k Base + Equity',
    description: `Role Overview:
Stripe is seeking an experienced Full-Stack / Platform Engineer to build mission-critical merchant interfaces and developer platforms. You will design scalable web systems, optimize client-side bundle performance, and collaborate with globally distributed product teams.

Qualifications:
- Solid algorithmic foundations with strong data structures and clean design patterns.
- Deep expertise in React, TypeScript, state management, and modern browser APIs.
- Experience writing maintainable backend APIs (Node, Java, or Go) and relational database schemas.
- Strong written and verbal communication skills; history of writing engineering specs.`
  },
  {
    id: 'job-internshala-1',
    title: 'Software Development Engineering (SDE) Intern',
    company: 'CRED / Razorpay Fintech',
    platform: 'internshala',
    location: 'Bengaluru / Remote',
    salary: '₹40,000 – ₹60,000 / month',
    description: `Selected intern's day-to-day responsibilities include:
1. Work closely with Senior SDEs to design, develop, and test high-throughput payment microservices.
2. Build responsive user interfaces using React/Next.js and Tailwind CSS.
3. Solve complex algorithmic challenges and optimize database queries for low latency.
4. Participate in code reviews, tech discussions, and daily standups.

Skill(s) required:
- Data Structures and Algorithms (DSA) proficiency.
- Hands-on experience with JavaScript/TypeScript, React, Node.js, and RESTful APIs.
- Strong problem-solving mindset and eagerness to learn fast.`
  }
];

export const DEFAULT_SAMPLE_ANALYSIS: import('../types').CandidateAnalysis = {
  id: 'analysis-default-demo',
  fullName: 'Shivam Singh (Alex Rivera Preset)',
  tagline: 'Senior Full-Stack Engineer • Distributed Systems & AI Systems Architect',
  executiveSummary: 'Demonstrated exceptional technical breadth across modern full-stack web applications, distributed asynchronous systems, and algorithmic problem solving. Strong GitHub commit history with architected microservices, top 5% LeetCode algorithmic contest rating, and written technical thought leadership on Substack.',
  experienceLevel: 'Senior (6+ Years)',
  sourcesAnalyzed: {
    linkedin: true,
    github: true,
    leetcode: true,
    substack: true,
    twitter: true,
  },
  skillsMatrix: [
    { category: 'Languages', skills: ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL'] },
    { category: 'Frontend', skills: ['React 18', 'Next.js', 'Tailwind CSS', 'Redux / Zustand', 'WebSockets'] },
    { category: 'Backend & Systems', skills: ['Node.js / Express', 'FastAPI', 'REST & GraphQL', 'Microservices', 'gRPC'] },
    { category: 'Databases & Caching', skills: ['PostgreSQL', 'Redis Pub/Sub', 'MongoDB', 'Prisma', 'Drizzle'] },
    { category: 'DevOps & Queues', skills: ['Docker', 'Celery / BullMQ', 'Kubernetes', 'CI/CD Pipelines', 'AWS / GCP'] },
    { category: 'DSA & Algorithms', skills: ['Dynamic Programming', 'Graph Theory', 'Binary Trees', 'System Design'] },
  ],
  leetcodeMetrics: {
    totalSolved: 540,
    easySolved: 180,
    mediumSolved: 290,
    hardSolved: 70,
    estimatedRating: 1945,
    topTopics: ['Dynamic Programming', 'Graph Algorithms', 'Monotonic Stacks', 'Binary Search', 'Trie Trees'],
    globalRankingTopPercent: 'Top 4.2% Globally (Knight)',
  },
  githubMetrics: {
    username: 'alexrivera-dev',
    totalRepos: 38,
    topLanguages: ['TypeScript', 'Go', 'Python', 'Rust', 'Shell'],
    commitFrequency: 'Very Active (>1,400 contributions in past 12 months)',
    featuredRepos: [
      {
        repoName: 'distributed-event-mesh',
        stars: 340,
        forks: 48,
        primaryLanguage: 'Go',
        description: 'Ultra low-latency event-driven pub/sub queue engine built in Go & Redis.',
        architecturalHighlights: 'Zero-copy memory pipelines, backpressure buffer regulation, 99.99% reliability under 50k req/s.',
      },
      {
        repoName: 'react-agent-canvas',
        stars: 520,
        forks: 72,
        primaryLanguage: 'TypeScript',
        description: 'Interactive visual workflow orchestrator for multi-agent LLM systems with React & WebSockets.',
        architecturalHighlights: 'Optimistic UI rendering, tree-shaken DAG state machine, responsive canvas.',
      },
    ],
    codeQualityRating: 95,
  },
  linkedinHighlights: {
    headline: 'Senior Full-Stack Engineer | Distributed Systems & High-Velocity Web Apps',
    yearsOfExp: 6,
    keyAchievements: [
      'Led migration of monolithic microservices reducing p99 latency by 45%',
      'Built multi-platform distributed event workers processing 25M daily requests',
    ],
    industryDomains: ['Fintech & Payment Platforms', 'Developer Tooling & Infrastructure', 'AI Agent Orchestration'],
  },
  substackInsights: {
    handle: 'systemsengineering',
    publicationTopics: ['Distributed Systems', 'Redis Architecture', 'LLM Agent Pipelines'],
    notableArticles: [
      'Deconstructing High-Throughput Redis Message Queues at Scale',
      'Building Resilient Multi-Agent AI Pipelines with Structured JSON Outputs',
    ],
    technicalDepthScore: 92,
  },
  twitterSignals: {
    handle: 'alexrivera_codes',
    publicBuildingFocus: ['Distributed Systems', 'TypeScript Architecture', 'AI Agents', 'Open Source'],
    domainAuthority: 'High - Active #buildinpublic builder in modern web & systems engineering',
  },
  keyStrengths: [
    'Proven ability to build end-to-end full-stack architectures from scratch with high performance.',
    'Demonstrated mastery of complex Data Structures and Algorithms with top percentile contest rankings.',
    'Clear communicator with published engineering write-ups articulating trade-offs and scaling strategies.',
  ],
  competitiveAdvantages: [
    'Bridges 0-to-1 startup speed with production enterprise resilience.',
    'Proactive builder with public open-source contributions and deep debugging intuition.',
  ],
  growthAreas: [
    'Deeper exposure to Rust low-level kernel bypass networking',
  ],
  overallMarketFitScore: 96,
  analyzedAt: new Date().toISOString(),
};

