export type PlatformType = 'wellfound' | 'linkedin' | 'internshala' | 'greenhouse' | 'lever' | 'general';

export type JobStatus = 'draft' | 'prepared' | 'applied' | 'interviewing' | 'offer' | 'archived';

export type TabType = 'profile' | 'studio' | 'review' | 'tracker' | 'telemetry';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  verificationCode?: string;
  avatarUrl?: string;
  title?: string;
  location?: string;
  createdAt: string;
}

export interface ProfileUrls {
  linkedin: string;
  github: string;
  leetcode: string;
  substack: string;
  twitter: string;
  portfolio?: string;
  resumeText?: string;
}

export interface CandidateSkillCategory {
  category: string;
  skills: string[];
}

export interface GithubHighlight {
  repoName: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  description: string;
  architecturalHighlights: string;
}

export interface LeetCodeMetrics {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  estimatedRating: number;
  topTopics: string[];
  globalRankingTopPercent: string;
}

export interface CandidateAnalysis {
  id: string;
  userId?: string;
  fullName: string;
  tagline: string;
  executiveSummary: string;
  experienceLevel: string;
  skillsMatrix: CandidateSkillCategory[];
  githubMetrics: {
    username: string;
    totalRepos: number;
    topLanguages: string[];
    featuredRepos: GithubHighlight[];
    commitFrequency: string;
    codeQualityRating: number; // 1-100
  };
  leetcodeMetrics: LeetCodeMetrics;
  linkedinHighlights: {
    headline: string;
    yearsOfExp: number;
    keyAchievements: string[];
    industryDomains: string[];
  };
  substackInsights: {
    handle: string;
    publicationTopics: string[];
    technicalDepthScore: number; // 1-100
    notableArticles: string[];
  };
  twitterSignals: {
    handle: string;
    publicBuildingFocus: string[];
    domainAuthority: string;
  };
  keyStrengths: string[];
  competitiveAdvantages: string[];
  growthAreas: string[];
  overallMarketFitScore: number;
  analyzedAt: string;
  sourcesAnalyzed: {
    linkedin: boolean;
    github: boolean;
    leetcode: boolean;
    substack: boolean;
    twitter: boolean;
  };
}

export interface ScreeningQuestion {
  question: string;
  answer: string;
  rationale: string;
}

export interface ATSReport {
  score: number; // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
  executiveAlignmentSummary: string;
}

export interface PlatformSpecificData {
  wellfound?: {
    founderPitchNote: string;
    whyThisStartup: string;
    equityVsSalaryPreference: string;
    proudestAchievementInStartupEnvironment: string;
    expectedSalaryRange: string;
  };
  linkedin?: {
    recruiterInMailSubject: string;
    recruiterInMailBody: string;
    connectionRequestNote: string;
    easyApplyQnA: Array<{ question: string; answer: string }>;
  };
  internshala?: {
    whyShouldYouBeHired: string;
    availabilityConfirmation: string;
    relevantProjectExperience: string;
    assignmentSubmissionCover: string;
    workPreference: string;
  };
  customAts?: {
    whyCompany: string;
    biggestTechnicalChallenge: string;
    leadershipOrCollaborationExample: string;
  };
}

export interface ApplicationPackage {
  coverLetter: string;
  elevatorPitch: string;
  platformSpecific: PlatformSpecificData;
  screeningQuestions: ScreeningQuestion[];
  atsReport: ATSReport;
  keyProjectsShowcase: Array<{
    projectName: string;
    relevanceToRole: string;
    sourcePlatform: string;
    summary: string;
  }>;
  tailoredBio: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  jobTitle: string;
  companyName: string;
  targetPlatform: PlatformType;
  jobUrl?: string;
  jobDescription: string;
  salaryExpectation?: string;
  noticePeriod?: string;
  status: JobStatus;
  applicationPackage: ApplicationPackage;
  notes?: string;
  appliedDate?: string;
}

export interface AgentTaskLog {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  workerId: string;
  stage: string;
}

export interface AgentTask {
  taskId: string;
  type: 'profile_analysis' | 'application_generation' | 'ats_audit';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStage: string;
  workerId: string;
  createdAt: string;
  completedAt?: string;
  logs: AgentTaskLog[];
  result?: any;
  error?: string;
}
