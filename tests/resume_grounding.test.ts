import { describe, it, expect } from 'vitest';
import { generateTailoredResumePackage, buildLatexResumeDocument, escapeLatex } from '../server/resumeGenerator';
import { generateFollowUpSequence } from '../server/followupGenerator';
import { CandidateAnalysis, ResumeData } from '../src/types';

describe('Resume Generator Factual Grounding & Anti-Fabrication Tests', () => {
  it('should NEVER invent Berkeley education, fake phone numbers, or fake employers when candidate data is missing', () => {
    const minimalCandidate: CandidateAnalysis = {
      id: 'analysis-minimal',
      fullName: 'Jordan Taylor',
      tagline: 'Frontend Engineer',
      executiveSummary: 'Frontend engineer with React experience.',
      experienceLevel: 'Mid-Level',
      skillsMatrix: [
        { category: 'Languages', skills: ['TypeScript', 'JavaScript'] },
        { category: 'Frontend', skills: ['React', 'CSS3'] },
      ],
      sourcesAnalyzed: {
        linkedin: false,
        github: false,
        leetcode: false,
        substack: false,
        twitter: false,
      },
      githubMetrics: {
        username: '',
        totalRepos: 0,
        topLanguages: [],
        featuredRepos: [],
        commitFrequency: 'Not Provided',
        codeQualityRating: 0,
      },
      leetcodeMetrics: {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        estimatedRating: 0,
        topTopics: [],
        globalRankingTopPercent: 'Not Provided',
      },
      linkedinHighlights: {
        headline: 'Frontend Engineer',
        yearsOfExp: 3,
        keyAchievements: [],
        industryDomains: ['Web Development'],
      },
      substackInsights: {
        handle: '',
        publicationTopics: [],
        technicalDepthScore: 0,
        notableArticles: [],
      },
      twitterSignals: {
        handle: '',
        publicBuildingFocus: [],
        domainAuthority: 'Not Provided',
      },
      keyStrengths: ['Modern React', 'TypeScript', 'Component Design'],
      competitiveAdvantages: ['Clean UI engineering'],
      growthAreas: [],
      overallMarketFitScore: 88,
      analyzedAt: new Date().toISOString(),
    };

    const pkg = generateTailoredResumePackage(
      minimalCandidate,
      'React Engineer',
      'Acme Corp',
      'We need a React and TypeScript engineer.'
    );

    // 1. Check structured resume properties
    expect(pkg.structuredResume.fullName).toBe('Jordan Taylor');
    expect(pkg.structuredResume.phone).toBeUndefined();
    expect(pkg.structuredResume.location).toBeUndefined();
    expect(pkg.structuredResume.email).toBe('');
    expect(pkg.structuredResume.education).toEqual([]); // Zero fake education

    // 2. Check LaTeX output
    const latex = pkg.latexSource;
    expect(latex).toContain('Jordan Taylor');
    expect(latex).not.toContain('Berkeley');
    expect(latex).not.toContain('University of California');
    expect(latex).not.toContain('555');
    expect(latex).not.toContain('San Francisco, CA');
    expect(latex).not.toContain('Software Systems Engineering');
    expect(latex).not.toContain('OmniApply Career Intelligence Platform');
    expect(latex).not.toContain('alex.chen@example.org');
    expect(latex).not.toContain('alexchen-dev');
  });

  it('should render verified education and experience when present', () => {
    const resumeData: ResumeData = {
      fullName: 'Morgan Lee',
      email: 'morgan@example.com',
      phone: '+1 (415) 555-0100',
      location: 'Austin, TX',
      links: {
        github: 'github.com/morganlee',
        linkedin: 'linkedin.com/in/morganlee',
      },
      summary: 'Verified backend engineer.',
      education: [
        {
          institution: 'University of Texas at Austin',
          degree: 'B.S. in Computer Engineering',
          location: 'Austin, TX',
          duration: '2018 -- 2022',
          details: 'Dean\'s Honor List',
        },
      ],
      skills: {
        languages: ['Go', 'TypeScript'],
        frameworks: ['Gin', 'Node.js'],
        developerTools: ['Docker', 'Git'],
        librariesOrDatabases: ['PostgreSQL', 'Redis'],
      },
      experience: [
        {
          role: 'Backend Engineer',
          company: 'FinTech Cloud Inc',
          location: 'Austin, TX',
          duration: '2022 -- Present',
          bullets: ['Engineered payment webhook processing pipeline handling 10k req/sec.'],
        },
      ],
      projects: [
        {
          title: 'high-throughput-router',
          technologies: 'Go, Redis',
          bullets: ['Implemented zero-allocation HTTP request router.'],
        },
      ],
    };

    const latex = buildLatexResumeDocument(resumeData);
    expect(latex).toContain('Morgan Lee');
    expect(latex).toContain('University of Texas at Austin');
    expect(latex).toContain('FinTech Cloud Inc');
    expect(latex).toContain('high-throughput-router');
    expect(latex).toContain('morgan@example.com');
    expect(latex).toContain('+1 (415) 555-0100');
    expect(latex).toContain('Austin, TX');
  });

  it('should safely escape LaTeX characters in candidate text', () => {
    expect(escapeLatex('100% test & scale $50 #1_item {code}~^\\')).toBe(
      '100\\% test \\& scale \\$50 \\#1\\_item \\{code\\}\\textasciitilde{}\\textasciicircum{}\\textbackslash{}'
    );
  });

  it('should generate factual follow-up sequences without fake handles', () => {
    const candidate: CandidateAnalysis = {
      id: 'candidate-1',
      fullName: 'Samantha Jones',
      tagline: 'Full-Stack Developer',
      executiveSummary: 'Full-stack software developer.',
      experienceLevel: 'Mid-Level',
      skillsMatrix: [{ category: 'Core', skills: ['TypeScript', 'React'] }],
      sourcesAnalyzed: {
        linkedin: false,
        github: false,
        leetcode: false,
        substack: false,
        twitter: false,
      },
      githubMetrics: {
        username: '',
        totalRepos: 0,
        topLanguages: ['TypeScript', 'React'],
        featuredRepos: [],
        commitFrequency: 'Not Provided',
        codeQualityRating: 0,
      },
      leetcodeMetrics: {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        estimatedRating: 0,
        topTopics: [],
        globalRankingTopPercent: 'Not Provided',
      },
      linkedinHighlights: {
        headline: 'Full-Stack Developer',
        yearsOfExp: 3,
        keyAchievements: [],
        industryDomains: ['Software'],
      },
      substackInsights: {
        handle: '',
        publicationTopics: [],
        technicalDepthScore: 0,
        notableArticles: [],
      },
      twitterSignals: {
        handle: '',
        publicBuildingFocus: [],
        domainAuthority: 'Not Provided',
      },
      keyStrengths: ['Full-stack features'],
      competitiveAdvantages: ['Clean code'],
      growthAreas: [],
      overallMarketFitScore: 89,
      analyzedAt: new Date().toISOString(),
    };

    const sequence = generateFollowUpSequence(candidate, 'Frontend Developer', 'Stripe');
    expect(sequence.emails.length).toBe(4);
    sequence.emails.forEach((email) => {
      expect(email.body).toContain('Samantha Jones');
      expect(email.body).not.toContain('Alex Chen');
      expect(email.body).not.toContain('alexchen-dev');
      expect(email.body).not.toContain('distributed-cache');
    });
  });
});
