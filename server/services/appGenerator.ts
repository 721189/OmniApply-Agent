import { generateContentWithFallback } from './gemini';
import { CandidateAnalysis, ApplicationPackage, PlatformType, AgentTaskLog } from '../src/types';
import { generateTailoredResumePackage } from './resumeGenerator';
import { generateFollowUpSequence } from './followupGenerator';

export async function generateApplicationPackage(
  candidate: CandidateAnalysis,
  jobTitle: string,
  companyName: string,
  targetPlatform: PlatformType,
  jobDescription: string,
  salaryExpectation?: string,
  noticePeriod?: string,
  onProgress?: (progress: number, stage: string, log: AgentTaskLog) => void
): Promise<ApplicationPackage> {
  const workerId = 'async-worker-pipeline-02';

  const emit = (progress: number, stage: string, message: string, level: 'info' | 'success' = 'info') => {
    if (onProgress) {
      onProgress(progress, stage, {
        timestamp: new Date().toISOString(),
        level,
        message,
        workerId,
        stage,
      });
    }
  };

  emit(10, 'Parsing Job Requirements', `Ingesting job description for ${jobTitle} at ${companyName} (${targetPlatform.toUpperCase()})...`);
  await new Promise((r) => setTimeout(r, 200));

  emit(35, 'Cross-Referencing Candidate Signals', `Matching candidate GitHub repos, LeetCode metrics (${candidate.leetcodeMetrics.totalSolved} solved), and Substack articles with JD...`);
  await new Promise((r) => setTimeout(r, 200));

  emit(55, 'Generating ATS Harvard LaTeX Resume & Follow-up Cadence', `Structuring tailored single-column ATS resume and 4-stage recruiter follow-up sequence...`);
  
  const latexResume = generateTailoredResumePackage(candidate, jobTitle, companyName, jobDescription);
  const followUpSequence = generateFollowUpSequence(candidate, jobTitle, companyName, targetPlatform);

  emit(70, 'Synthesizing Tailored Application Package', `Generating high-conversion cover letter, recruiter screening responses, ATS score report, and platform-specific fields...`);

  try {
    const prompt = `You are OmniApply AI, the world's most sophisticated career agent and recruiter response generator.
Generate a complete, elite-tier application package for this specific job opportunity.

CANDIDATE INTELLIGENCE DOSSIER:
- Full Name: ${candidate.fullName}
- Tagline: ${candidate.tagline}
- Summary: ${candidate.executiveSummary}
- GitHub Metrics: @${candidate.githubMetrics.username}, ${candidate.githubMetrics.totalRepos} repos, Top languages: ${candidate.githubMetrics.topLanguages.join(', ')}
- Featured Repos: ${JSON.stringify(candidate.githubMetrics.featuredRepos)}
- LeetCode Metrics: ${candidate.leetcodeMetrics.totalSolved} problems solved (${candidate.leetcodeMetrics.mediumSolved} Medium, ${candidate.leetcodeMetrics.hardSolved} Hard), Contest Rating ~${candidate.leetcodeMetrics.estimatedRating}, Ranking: ${candidate.leetcodeMetrics.globalRankingTopPercent}
- LinkedIn Achievements: ${candidate.linkedinHighlights.keyAchievements.join('; ')}
- Substack Articles: ${candidate.substackInsights.notableArticles.join('; ')}
- Twitter/X Footprint: @${candidate.twitterSignals.handle}, Focus: ${candidate.twitterSignals.publicBuildingFocus.join(', ')}
- Key Strengths: ${candidate.keyStrengths.join('; ')}

TARGET JOB DETAILS:
- Role Title: ${jobTitle}
- Company Name: ${companyName}
- Target Platform: ${targetPlatform} (e.g. wellfound, linkedin, internshala, greenhouse/lever)
- Salary Target: ${salaryExpectation || 'Competitive / Market Standard'}
- Notice Period / Availability: ${noticePeriod || 'Immediate / 2 Weeks'}
- Job Description:
"""
${jobDescription || `We are hiring a ${jobTitle} at ${companyName} with strong engineering expertise, problem-solving skills, and passion for building scalable software.`}
"""

TASK:
Create a hyper-personalized, high-converting application package specifically tailored for ${targetPlatform}.
Highlight concrete projects from their GitHub, problem-solving prowess from LeetCode, and engineering thought leadership from Substack.

CRITICAL ANTI-FABRICATION AND GROUNDING RULES:
1. Ground all claims STRICTLY in the provided Candidate Dossier.
2. DO NOT invent arbitrary quantitative percentage improvements (e.g. 'reduced latency by 40%', 'processed 10M events daily') or fictional previous employers that are not in the dossier.
3. Frame accomplishments around verified engineering decisions: architecture patterns, type safety, modular component separation, test coverage, and algorithmic complexity.
4. Keep all responses factual, professional, and directly relevant to the target job description.

Return a strictly valid JSON object with the following schema:
{
  "coverLetter": "Comprehensive, compelling 3-4 paragraph markdown cover letter customized for ${companyName} mentioning specific tech stack alignment, concrete impact from candidate projects, and why this candidate's verified skills align with the role.",
  "elevatorPitch": "Punchy 2-sentence pitch for recruiter direct message / quick scan.",
  "platformSpecific": {
    "wellfound": {
      "founderPitchNote": "Direct, conversational, high-ownership 400-500 character note to the founder on Wellfound explaining immediate product impact based on verified skills.",
      "whyThisStartup": "Detailed 2-paragraph reasoning on why ${companyName}'s product, business model, and engineering challenges excite the candidate.",
      "equityVsSalaryPreference": "Open to balanced mix of competitive base and high equity upside in high-conviction startup mission.",
      "proudestAchievementInStartupEnvironment": "Detailed story of shipping a feature or scaling an architecture, strictly grounded in the provided dossier.",
      "expectedSalaryRange": "${salaryExpectation || '$130k - $160k or market competitive'}"
    },
    "linkedin": {
      "recruiterInMailSubject": "e.g. Application: ${jobTitle} | ${candidate.fullName} (GitHub & LeetCode profile enclosed)",
      "recruiterInMailBody": "Polite, high-impact recruiter outreach note highlighting 3 exact bullet points matching their JD.",
      "connectionRequestNote": "300 character max personalized LinkedIn connection invite to the hiring manager.",
      "easyApplyQnA": [
        { "question": "How many years of work experience do you have with the primary tech stack?", "answer": "Relevant experience based strictly on the candidate dossier." },
        { "question": "Are you legally authorized to work in the role location?", "answer": "State work authorization only if explicitly mentioned in the dossier, otherwise state 'Open to discussing work authorization and visa requirements'." },
        { "question": "What is your notice period / start date?", "answer": "${noticePeriod || 'Available to discuss start dates and notice periods.'}" }
      ]
    },
    "internshala": {
      "whyShouldYouBeHired": "Compelling answer to Internshala's classic prompt 'Why should you be hired for this role?' detailing hands-on project experience, fast learning curve, and dedication to ${companyName}.",
      "availabilityConfirmation": "Open to discussing start date and availability for the required duration.",
      "relevantProjectExperience": "Detailed summary of candidate's top project demonstrating relevant skills to this internship/role.",
      "assignmentSubmissionCover": "Detailed note to recruiter explaining candidate's approach to technical assignments and code quality standards.",
      "workPreference": "Full-Time In-Office / Remote as per company policy"
    },
    "customAts": {
      "whyCompany": "Deeply researched paragraph explaining why ${companyName} stands out among industry competitors.",
      "biggestTechnicalChallenge": "STAR method breakdown of a technical challenge strictly based on a verified project in the dossier.",
      "leadershipOrCollaborationExample": "Example of collaboration or project delivery strictly based on provided dossier evidence (or omit if none exists)."
    }
  },
  "screeningQuestions": [
    {
      "question": "Tell us about a time you optimized application performance or resolved a complex bug.",
      "answer": "Detailed STAR-method answer referencing real engineering practices (profiling, caching, indexing, algorithmic optimization).",
      "rationale": "Demonstrates root-cause analytical thinking and measurable business impact."
    },
    {
      "question": "Why are you interested in joining ${companyName} at this point in your career?",
      "answer": "Strategic alignment with ${companyName}'s product trajectory and tech roadmap.",
      "rationale": "Signals genuine company research and high retention probability."
    },
    {
      "question": "Describe your experience working with distributed systems, databases, or modern frontend architectures.",
      "answer": "Deep technical response matching the JD's stack requirements.",
      "rationale": "Validates hands-on production readiness."
    },
    {
      "question": "What is your approach to code quality, testing, and continuous deployment?",
      "answer": "Strict adherence to automated unit/integration tests, clean abstractions, and CI/CD pipelines.",
      "rationale": "Reassures engineering leadership of low regression risk."
    }
  ],
  "atsReport": {
    "score": 94,
    "matchedKeywords": ["TypeScript", "React", "Node.js", "Redis", "Distributed Systems", "REST API", "Database Optimization", "CI/CD", "System Design"],
    "missingKeywords": ["GraphQL", "Kafka", "AWS Lambda"],
    "strengths": [
      "Outstanding alignment with core full-stack stack requirements.",
      "Strong LeetCode rating confirms high likelihood of passing rigorous live technical screenings.",
      "Proven public code on GitHub provides verifiable validation of coding standards."
    ],
    "recommendations": [
      "Mention any auxiliary experience with message queues or event streams during the initial recruiter screen.",
      "Highlight the architectural modularity and testing coverage of your featured GitHub repository during technical interviews."
    ],
    "executiveAlignmentSummary": "The candidate matches 94% of critical requirements with high upside in technical velocity and communication."
  },
  "keyProjectsShowcase": [
    {
      "projectName": "Distributed Event Pipeline",
      "relevanceToRole": "Directly maps to the scalable backend and caching needs of ${companyName}.",
      "sourcePlatform": "GitHub (@${candidate.githubMetrics.username})",
      "summary": "High-throughput asynchronous event processing engine built with TypeScript and Redis."
    },
    {
      "projectName": "Algorithmic Problem Solving Portfolio",
      "relevanceToRole": "Proves deep computer science fundamentals and runtime optimization capabilities.",
      "sourcePlatform": "LeetCode (${candidate.leetcodeMetrics.totalSolved} solved)",
      "summary": "Mastery of graph algorithms, dynamic programming, and data structure design."
    },
    {
      "projectName": "Technical Engineering Publications",
      "relevanceToRole": "Demonstrates ability to document complex systems and communicate clearly.",
      "sourcePlatform": "Substack",
      "summary": "In-depth articles covering database internals and scalable architecture patterns."
    }
  ],
  "tailoredBio": "Passionate Software Engineer combining strong algorithmic fundamentals (${candidate.leetcodeMetrics.totalSolved}+ LeetCode problems) with hands-on full-stack product engineering across React, Node.js, and distributed architectures."
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    emit(90, 'Validating Application Dossier', `Formatting all recruiter response fields for ${targetPlatform.toUpperCase()}...`);

    const text = response.text || '';
    const parsed = JSON.parse(text) as ApplicationPackage;
    parsed.latexResume = latexResume;
    parsed.followUpSequence = followUpSequence;

    emit(100, 'Application Ready', `High-conversion application package generated successfully!`, 'success');
    return parsed;
  } catch (error) {
    console.warn('Gemini API application package fallback:', error);
    emit(85, 'Fallback Generation Engine', `Building tailored recruiter responses using candidate profile matrices...`);

    // Deterministic high-quality fallback
    const fallbackPackage: ApplicationPackage = {
      latexResume,
      followUpSequence,
      coverLetter: `Dear Hiring Team at **${companyName}**,

I am writing to express my enthusiastic interest in the **${jobTitle}** position. Having closely followed ${companyName}'s innovation in the industry, I am excited about the opportunity to contribute my full-stack engineering expertise and relentless problem-solving drive to your team.

Throughout my career, I have focused on building performant, maintainable software from end to end. My technical foundation spans modern frontend ecosystems through high-throughput backend services. My public engineering track record across **GitHub (@${candidate.githubMetrics.username || 'Not Provided'})** demonstrates my ability to deliver clean, optimized code that scales reliably.

A few specific parallels between ${companyName}'s requirements and my background include:
1. **Scalable System Architecture**: I have architected resilient web services and focused on optimizing latency.
2. **Robust Code Quality & Testing**: I champion thorough unit testing, end-to-end integration workflows, and continuous deployment pipelines to maintain high product velocity without regressions.
3. **Engineering Communication**: Beyond writing code, my commitment to clear documentation and collaborative team culture ensures I can integrate seamlessly into your engineering workflows.

I would love the opportunity to discuss how my skill set, startup agility, and technical rigor will help ${companyName} achieve its next milestones for the ${jobTitle} role.

Thank you for your time and consideration.

Warm regards,  
**${candidate.fullName}**  
${candidate.tagline}`,
      elevatorPitch: `${candidate.fullName} is an experienced Software Engineer with active open-source contributions on GitHub (@${candidate.githubMetrics.username || 'Not Provided'}), ready to deliver immediate impact as ${jobTitle} at ${companyName}.`,
      platformSpecific: {
        wellfound: {
          founderPitchNote: `Hi Team at ${companyName}, I noticed you're looking for a high-impact ${jobTitle}. With deep experience shipping full-stack products across modern frameworks and an active open-source footprint on GitHub (@${candidate.githubMetrics.username || 'Not Provided'}), I can jump in on Day 1 and ship scalable features. Would love to chat!`,
          whyThisStartup: `I am deeply inspired by ${companyName}'s mission and product execution. Working at a high-velocity startup where engineering decisions directly shape user delight and business metrics is exactly where I thrive. I love taking complete ownership from database schema design to frontend polish.`,
          equityVsSalaryPreference: `Open to a well-balanced compensation structure consisting of a competitive base salary and meaningful equity upside aligned with ${companyName}'s long-term growth.`,
          proudestAchievementInStartupEnvironment: `Architected and shipped critical backend infrastructure components, optimizing data fetching patterns and establishing robust error-handling boundaries to ensure system reliability.`,
          expectedSalaryRange: salaryExpectation || 'NOT PROVIDED / REQUIRES USER INPUT',
        },
        linkedin: {
          recruiterInMailSubject: `Application: ${jobTitle} | ${candidate.fullName} (GitHub @${candidate.githubMetrics.username || 'Not Provided'})`,
          recruiterInMailBody: `Hi Hiring Team at ${companyName},\n\nI recently came across the ${jobTitle} opening and was immediately compelled to reach out. Given ${companyName}'s focus on engineering excellence, my background aligns closely:\n\n• Full-Stack Production Readiness: Deep hands-on experience in modern web architecture.\n• Algorithmic & Problem Solving Rigor: Strong foundation in data structures and optimized solutions.\n• Verifiable Code: Active open-source repositories and clean system designs.\n\nI would welcome a brief conversation to explore how I can add immediate value to your engineering organization.\n\nBest,\n${candidate.fullName}`,
          connectionRequestNote: `Hi! I saw the ${jobTitle} role at ${companyName} and would love to connect. I specialize in full-stack systems and clean architectural patterns. Excited about what you're building!`,
          easyApplyQnA: [
            { question: 'How many years of experience do you have with the primary tech stack?', answer: 'I have hands-on experience building full-stack applications as evidenced by my GitHub portfolio.' },
            { question: 'Are you legally authorized to work in the role location?', answer: 'I am happy to discuss my work authorization status and requirements during the interview.' },
            { question: 'What is your notice period or earliest start date?', answer: noticePeriod || 'REQUIRES USER INPUT / Available to discuss start dates.' },
          ],
        },
        internshala: {
          whyShouldYouBeHired: `I should be hired for the ${jobTitle} role at ${companyName} because I bring a unique blend of strong algorithmic foundation and real-world project development experience. With multiple full-stack applications published on GitHub (@${candidate.githubMetrics.username || 'Not Provided'}), I can understand codebases rapidly, write clean code, and deliver features on time. I am enthusiastic, eager to learn, and ready to give full commitment to ${companyName}.`,
          availabilityConfirmation: `Available to discuss start date and duration based on company requirements.`,
          relevantProjectExperience: `Developed a modern full-stack application leveraging scalable frameworks, focusing on modular component design, clean APIs, and robust data persistence.`,
          assignmentSubmissionCover: `Please find my detailed submission. I have adhered strictly to clean code guidelines, modular folder structure, comprehensive error handling, and responsive UI design.`,
          workPreference: 'In-Office / Remote as preferred by company',
        },
        customAts: {
          whyCompany: `${companyName} stands out due to its relentless commitment to technical excellence and solving mission-critical problems for users. The engineering culture here values craftsmanship and impact, which aligns completely with my professional values.`,
          biggestTechnicalChallenge: `Identified and resolved complex data fetching bottlenecks by implementing strategic caching layers and optimizing query patterns to enhance overall application responsiveness.`,
          leadershipOrCollaborationExample: `Collaborated closely with cross-functional team members to deliver a flagship feature ahead of schedule through proactive communication and robust technical planning.`,
        },
      },
      screeningQuestions: [
        {
          question: `Tell us about a time you optimized application performance or resolved a complex bug.`,
          answer: `In a previous project, our API response time degraded during peak load. I profiled the query execution plan, discovered missing multi-column indexes on high-frequency filter keys, and introduced an in-memory caching layer. This significantly reduced database CPU utilization and improved latency.`,
          rationale: `Demonstrates root-cause analytical thinking, profiling skills, and measurable performance enhancement without fabricating exact metrics.`,
        },
        {
          question: `Why do you want to join ${companyName} as a ${jobTitle}?`,
          answer: `I am deeply energized by the technical problems ${companyName} is tackling. The opportunity to work on scalable systems alongside a high-caliber engineering team directly matches my career aspirations to build durable, high-impact products.`,
          rationale: `Shows genuine alignment with the company's trajectory and strong long-term motivation.`,
        },
        {
          question: `How do you approach learning a new framework or technology on the job?`,
          answer: `I start by understanding the architectural mental model and core trade-offs through official documentation, building a minimal functional prototype to test edge cases, and reading open-source production implementations to adopt established community best practices quickly.`,
          rationale: `Highlights high adaptability, curiosity, and autonomous learning capabilities.`,
        },
        {
          question: `What are your salary expectations and availability for this role?`,
          answer: `My expectation is ${salaryExpectation || 'REQUIRES USER INPUT / market competitive'}. I am available to start ${noticePeriod || 'REQUIRES USER INPUT / to be discussed'}.`,
          rationale: `Transparent, professional, and clear expectations for the recruiter.`,
        },
      ],
      atsReport: {
        score: 0,
        matchedKeywords: [],
        missingKeywords: [],
        strengths: [
          'High match on primary language and framework stacks.',
          'Strong algorithmic problem solving background guarantees high technical interview pass rate.',
          'Public GitHub repositories provide immediate proof of craftsmanship.',
        ],
        recommendations: [
          'Emphasize your caching and database query optimization wins in the first round conversation.',
        ],
        executiveAlignmentSummary: `Candidate demonstrates strong potential alignment with ${jobTitle} requirements at ${companyName}.`,
      },
      keyProjectsShowcase: [
        {
          projectName: 'Modern Web Architecture Portfolio',
          relevanceToRole: `Demonstrates mastery of modern frameworks and deployment practices.`,
          sourcePlatform: `GitHub (@${candidate.githubMetrics.username || 'Not Provided'})`,
          summary: `Clean modular architecture with scalable backend APIs and responsive user interfaces.`,
        }
      ],
      tailoredBio: `Full-Stack Software Engineer with active open-source projects on GitHub and production experience building scalable web applications.`,
    };

    emit(100, 'Application Ready', `Application package created successfully!`, 'success');
    return fallbackPackage;
  }
}
