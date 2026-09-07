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
  portfolioDetails?: {
    title?: string;
    description?: string;
    bio?: string;
    url?: string;
    projects?: Array<{
      name: string;
      desc: string;
      tech?: string;
    }>;
    detectedSkills?: string[];
  };
  verifiedEvidence?: Array<{
    type: 'project' | 'repo' | 'article' | 'dsa' | 'resume';
    title: string;
    proofSnippet: string;
    source: string;
    url?: string;
  }>;
  customFocus?: {
    primaryTargetRole?: string;
    toneStyle?: string;
    pinnedHighlights?: string[];
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
    portfolio?: boolean;
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
  latexResume?: LatexResumePackage;
  followUpSequence?: FollowUpSequence;
}

export interface ResumeProject {
  title: string;
  technologies: string;
  bullets: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  location: string;
  duration: string;
  bullets: string[];
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    leetcode?: string;
  };
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    location: string;
    duration: string;
    details?: string;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    developerTools: string[];
    librariesOrDatabases: string[];
  };
  experience: ResumeExperience[];
  projects: ResumeProject[];
  awardsOrAchievements?: string[];
}

export interface LatexResumePackage {
  latexSource: string;
  structuredResume: ResumeData;
  atsKeywordsTargeted: string[];
  tailoredForRole: string;
  tailoredForCompany: string;
}

export interface FollowUpEmail {
  stage: 'day0_intro' | 'day4_polite_touchpoint' | 'day8_value_add' | 'day14_soft_breakup';
  dayOffset: number;
  label: string;
  recommendedWait: string;
  subject: string;
  body: string;
  callToAction: string;
  valueAddHook: string;
}

export interface FollowUpSequence {
  jobTitle: string;
  companyName: string;
  recruiterName?: string;
  emails: FollowUpEmail[];
  calendarReminderSummary: string;
}

export interface LiveScrapeResult {
  source: 'github' | 'leetcode' | 'substack' | 'twitter';
  success: boolean;
  timestamp: string;
  data?: any;
  error?: string;
}

export type LocationTier = 'us_tier1_sf_ny' | 'us_tier2' | 'us_remote' | 'europe_uk' | 'india_apac' | 'global_remote';
export type SeniorityLevel = 'entry_l3' | 'mid_l4' | 'senior_l5' | 'staff_l6' | 'principal_l7';

export interface CompetingOffer {
  company: string;
  role: string;
  baseSalary: number;
  equityPerYear: number;
  signOnBonus: number;
  totalCompensation: number;
  currency: string;
}

export interface JobOfferDetails {
  baseSalary: number;
  currency: string;
  equityGrant: number; // Total 4-year equity grant
  equityVestingYears: number; // default 4
  equityCliffMonths: number; // default 12
  equityType: 'RSU' | 'Stock Options' | 'Profit Share';
  annualBonusPercentage: number; // e.g. 10%
  signOnBonus: number;
  relocationAssistance?: number;
  locationTier: LocationTier;
  seniorityLevel: SeniorityLevel;
  stockGrowthMultiplier?: number; // 1x, 1.5x, 2x, 3x
  competingOffers?: CompetingOffer[];
  customAskBase?: number;
  customAskEquity?: number;
  customAskSignOn?: number;
  negotiationStrategy?: 'competing_offer' | 'top_market_percentile' | 'cash_heavy_pivot' | 'equity_upside_pivot' | 'sign_on_tradeoff';
}

export interface MarketBenchmark {
  level: SeniorityLevel;
  levelLabel: string;
  region: LocationTier;
  regionLabel: string;
  currency: string;
  baseP25: number;
  baseMedian: number;
  baseP75: number;
  baseP90: number;
  totalP25: number;
  totalMedian: number;
  totalP75: number;
  totalP90: number;
  equityMedian: number;
  bonusMedianPercent: number;
}

export interface CounterOfferScript {
  strategy: string;
  strategyTitle: string;
  targetAskTotal: number;
  targetAskBase: number;
  targetAskEquity: number;
  targetAskSignOn: number;
  emailSubject: string;
  emailBody: string;
  verbalTalkingPoints: string[];
  keyLeveragePoints: string[];
  fallbackWalkawayBoundary: string;
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
  offerDetails?: JobOfferDetails;
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

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  topic?: 'interview' | 'resume' | 'salary' | 'general' | 'application';
  referencedJobId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  category: 'profile' | 'application' | 'security' | 'negotiation' | 'chat';
  details: string;
  timestamp: string;
  ipAddress?: string;
  meta?: Record<string, any>;
}
