import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../server/app';
import { db } from '../server/sqlite_db';
import { generateTailoredResumePackage } from '../server/services/resumeGenerator';
import { generateFollowUpSequence } from '../server/services/followupGenerator';

describe('End-to-End Pipeline & Integration Test Suite', () => {
  let app: any;
  const testEmail = `e2e-user-${Date.now()}@example.org`;
  const testPassword = 'StrongPassword!2026';
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createApp();
  });

  it('1. User Lifecycle: Registration, Verification & Authentication', async () => {
    // Register
    const { user, token, code } = await db.createUser('E2E Test Candidate', testEmail, testPassword);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(code).toHaveLength(6);
    userId = user.id;

    // Verify OTP
    const verifyResult = await db.verifyEmail(testEmail, code);
    expect(verifyResult.success).toBe(true);

    // Login
    const loginResult = await db.verifyUserCredentials(testEmail, testPassword);
    expect(loginResult.success).toBe(true);
    expect(loginResult.token).toBeDefined();
    authToken = loginResult.token!;

    // Sanitize check: Ensure no password hashes or salts leaked
    expect((loginResult.user as any)?.passwordHash).toBeUndefined();
    expect((loginResult.user as any)?.passwordSalt).toBeUndefined();
  });

  it('2. Grounded Candidate Analysis & Anti-Fabrication Resume Generation', async () => {
    const analysisData: any = {
      id: `analysis-${Date.now()}`,
      userId,
      fullName: 'E2E Test Candidate',
      tagline: 'Senior Distributed Systems Engineer',
      executiveSummary: 'Experienced software engineer specializing in high-throughput message queues.',
      experienceLevel: 'Senior',
      skillsMatrix: [
        { category: 'Languages', skills: ['TypeScript', 'Node.js', 'Go'] },
        { category: 'Databases', skills: ['PostgreSQL', 'Redis'] },
      ],
      githubMetrics: {
        username: 'e2ecandidate',
        totalRepos: 18,
        topLanguages: ['TypeScript', 'Go'],
        featuredRepos: [
          {
            repoName: 'distributed-queue',
            stars: 120,
            forks: 15,
            primaryLanguage: 'TypeScript',
            description: 'Event-driven distributed task runner',
            architecturalHighlights: 'Built with TypeScript and Redis',
          },
        ],
        commitFrequency: 'Daily',
        codeQualityRating: 95,
      },
      leetcodeMetrics: {
        totalSolved: 320,
        easySolved: 100,
        mediumSolved: 180,
        hardSolved: 40,
        estimatedRating: 2050,
        topTopics: ['Graphs', 'Dynamic Programming', 'Trees'],
        globalRankingTopPercent: 'Top 5%',
      },
      linkedinHighlights: {
        headline: 'Senior Systems Engineer',
        yearsOfExp: 7,
        keyAchievements: [
          'Architected high-throughput message queues using TypeScript and Redis.',
          'Maintained 99.99% service uptime across critical production microservices.',
        ],
        industryDomains: ['Cloud Infrastructure', 'Fintech'],
      },
      substackInsights: {
        handle: 'e2ecandidate',
        publicationTopics: ['Distributed Systems'],
        technicalDepthScore: 90,
        notableArticles: [],
      },
      twitterSignals: {
        handle: 'e2ecandidate',
        publicBuildingFocus: ['Open Source'],
        domainAuthority: 'High',
      },
      keyStrengths: ['Event-driven architecture', 'SQL tuning', 'High-throughput message queues'],
      competitiveAdvantages: ['Proven production scale experience'],
      growthAreas: ['Machine learning ops'],
      overallMarketFitScore: 94,
      analyzedAt: new Date().toISOString(),
      sourcesAnalyzed: {
        linkedin: true,
        github: true,
        leetcode: true,
        substack: false,
        twitter: false,
      },
    };

    await db.saveAnalysis(analysisData);
    const saved = await db.getAnalysis(userId);
    expect(saved?.fullName).toBe('E2E Test Candidate');

    // Generate Tailored Resume
    const resumePackage = generateTailoredResumePackage(
      analysisData,
      'Staff Backend Engineer',
      'Stripe',
      'Optimize API processing and database query performance with TypeScript and PostgreSQL'
    );

    expect(resumePackage.structuredResume.fullName).toBe('E2E Test Candidate');
    expect(resumePackage.structuredResume.skills.languages.length).toBeGreaterThan(0);
    expect(resumePackage.latexSource).toContain('E2E Test Candidate');
    expect(resumePackage.tailoredForCompany).toBe('Stripe');
    expect(resumePackage.tailoredForRole).toBe('Staff Backend Engineer');
    expect(resumePackage.atsKeywordsTargeted).toContain('TypeScript');
  });

  it('3. Job Application Lifecycle & Cadence Generation', async () => {
    const jobId = `job-${Date.now()}`;
    const jobApp: any = {
      id: jobId,
      userId,
      jobTitle: 'Senior Infrastructure Engineer',
      companyName: 'CloudScale Inc',
      targetPlatform: 'greenhouse',
      jobDescription: 'Looking for a Senior Engineer with deep PostgreSQL and TypeScript expertise.',
      status: 'applied',
      salaryRange: '$180,000 - $210,000',
      applicationPackage: {
        coverLetter: 'Dear Hiring Team, I am excited to apply for Senior Infrastructure Engineer at CloudScale Inc.',
        atsScore: 92,
        matchingKeywords: ['PostgreSQL', 'TypeScript', 'Distributed Systems'],
        missingKeywords: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveJob(jobApp);
    const fetched = await db.getJob(jobId);
    expect(fetched?.id).toBe(jobId);
    expect(fetched?.companyName).toBe('CloudScale Inc');

    // Generate follow-up sequence
    const candidate = (await db.getAnalysis(userId))!;
    const sequence = generateFollowUpSequence(candidate, jobApp.jobTitle, jobApp.companyName, 'greenhouse');
    expect(sequence.emails.length).toBeGreaterThanOrEqual(3);
    expect(sequence.emails[0].stage).toBeDefined();

    // Update offer details
    const updatedJob = await db.updateJob(jobId, {
      status: 'offer',
      offerDetails: {
        baseSalary: 195000,
        currency: 'USD',
        equityGrant: 40000,
        equityVestingYears: 4,
        equityCliffMonths: 12,
        equityType: 'RSU',
        annualBonusPercentage: 10,
        signOnBonus: 20000,
        locationTier: 'us_tier1_sf_ny',
        seniorityLevel: 'senior_l5',
      },
    });

    expect(updatedJob?.status).toBe('offer');
    expect(updatedJob?.offerDetails?.baseSalary).toBe(195000);
  });

  it('4. Backup Export & Restore Roundtrip (P2 Recovery)', async () => {
    const exportedData = await db.exportUserData(userId);
    expect(exportedData.compliance).toContain('GDPR');
    expect(exportedData.user?.email).toBe(testEmail);
    expect(exportedData.aggregatedCandidateProfile).toBeDefined();
    expect(exportedData.jobApplicationRecords.length).toBeGreaterThanOrEqual(1);

    // Create secondary user and restore into it
    const restoreEmail = `restore-target-${Date.now()}@example.org`;
    const { user: restoreUser } = await db.createUser('Restore Target', restoreEmail, 'TargetPass123!');

    const importSuccess = await db.importUserData(restoreUser.id, exportedData);
    expect(importSuccess).toBe(true);

    const restoredJobs = await db.getAllJobs(restoreUser.id);
    expect(restoredJobs.length).toBeGreaterThanOrEqual(1);
    expect(restoredJobs[0].companyName).toBe('CloudScale Inc');
  });

  it('5. Database Migration History & Health Probe Integrity', async () => {
    const migrations = await db.getAppliedMigrations();
    expect(migrations.length).toBeGreaterThanOrEqual(2);
    expect(migrations.some((m) => m.name.includes('initial_core_schema'))).toBe(true);

    const probe = await db.probeHealth();
    expect(probe.status).toBe('healthy');
    expect(probe.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
