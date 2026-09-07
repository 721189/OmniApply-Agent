import { ProfileUrls, CandidateAnalysis } from '../types';

/**
 * Rich sample profile presets for quick testing and demos
 */
export const SAMPLE_PROFILE_PRESETS = [
  {
    name: 'Shivam Singh (Full Stack)',
    urls: {
      github: 'https://github.com/shivamsingh',
      leetcode: 'https://leetcode.com/shivamsingh/',
      substack: 'https://substack.com/@shivamsingh',
    } as ProfileUrls,
  },
  {
    name: 'Demo Candidate (Minimal)',
    urls: {
      github: '',
      leetcode: '',
      substack: '',
    } as ProfileUrls,
  },
];

/**
 * Default sample analysis used for initial UI demo state
 */
export const DEFAULT_SAMPLE_ANALYSIS: CandidateAnalysis = {
  fullName: 'Shivam Singh',
  email: 'singhshivam20009@gmail.com',
  headline: 'Full Stack Engineer | AI/ML Enthusiast | Open Source Contributor',
  summary: 'Experienced full-stack engineer with expertise in TypeScript, React, Node.js, and AI/ML integration. Strong problem-solving skills with competitive programming background.',
  
  skillsMatrix: {
    languages: ['TypeScript', 'Python', 'JavaScript', 'SQL', 'Go'],
    frameworks: ['React', 'Express', 'Node.js', 'Vite', 'Tailwind CSS'],
    tools: ['Git', 'Docker', 'PostgreSQL', 'Redis', 'Google Cloud'],
    domains: ['Full-Stack Web Dev', 'AI/ML Integration', 'System Design', 'DevOps'],
  },

  starredRepos: [
    {
      name: 'OmniApply-Agent',
      url: 'https://github.com/shivamsingh/OmniApply-Agent',
      stars: 42,
      description: 'Autonomous career intelligence & multi-platform application engine',
      language: 'TypeScript',
    },
    {
      name: 'ai-resume-builder',
      url: 'https://github.com/shivamsingh/ai-resume-builder',
      stars: 28,
      description: 'AI-powered ATS-optimized resume generator',
      language: 'TypeScript',
    },
  ],

  leetcodeStats: {
    totalSolved: 487,
    contestRating: 1847,
    globalRanking: 'Top 5%',
    badges: ['50 Easy Questions', '50 Medium Questions', '25 Hard Questions'],
  },

  substackArticles: [
    {
      title: 'Building Production-Ready AI Applications',
      publicationDate: '2024-08-15',
      views: 2840,
      url: 'https://substack.com/@shivamsingh/...',
    },
    {
      title: 'The Future of Career Intelligence Engines',
      publicationDate: '2024-07-22',
      views: 1520,
      url: 'https://substack.com/@shivamsingh/...',
    },
  ],

  voiceDna: {
    communicationStyle: 'Technical, articulate, collaborative',
    keyThemes: ['Innovation', 'Problem-solving', 'Continuous learning', 'Open source'],
    toneScore: 'Professional yet approachable',
  },

  kpis: {
    githubContributions: '245 commits in the last 30 days',
    openSourceImpact: '12 repositories, 340 total stars',
    technicalWriting: '8 published articles, 8.2k total views',
    competitiveRanking: 'LeetCode Top 5%',
  },

  generatedAt: new Date().toISOString(),
  platforms: ['GitHub', 'LeetCode', 'Substack'],
};
