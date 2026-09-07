import { CandidateAnalysis, FollowUpEmail, FollowUpSequence } from '../src/types';

/**
 * Generates an automated 4-stage recruiter & founder follow-up drip sequence
 */
export function generateFollowUpSequence(
  candidate: CandidateAnalysis,
  jobTitle: string,
  companyName: string,
  targetPlatform: string = 'linkedin'
): FollowUpSequence {
  const candidateName = candidate.fullName || 'Alex Chen';
  const starRepo = candidate.githubMetrics?.featuredRepos?.[0]?.repoName || 'distributed-cache';
  const starTech = candidate.githubMetrics?.topLanguages?.[0] || 'TypeScript';

  const emails: FollowUpEmail[] = [
    {
      stage: 'day0_intro',
      dayOffset: 0,
      label: 'Day 0: Initial Application / Outreach Note',
      recommendedWait: 'Send immediately upon submitting application',
      subject: `Application for ${jobTitle} -- ${candidateName}`,
      body: `Hi Team at ${companyName},

I recently submitted my application for the ${jobTitle} opening. With my background in ${starTech} and distributed systems (including open-source work on ${starRepo}), I've been following ${companyName}'s work and would love the opportunity to contribute to your engineering team.

I’ve summarized my background and key projects here for quick reference. Looking forward to hearing your thoughts!

Best regards,
${candidateName}
Portfolio / GitHub: https://github.com/${candidate.githubMetrics?.username || 'alexchen-dev'}`,
      callToAction: 'Confirm application receipt and schedule initial screening call.',
      valueAddHook: `Direct reference to ${starTech} codebase and alignment with role requirements.`,
    },
    {
      stage: 'day4_polite_touchpoint',
      dayOffset: 4,
      label: 'Day 4: Polite Touchpoint & Value Reiteration',
      recommendedWait: 'Wait 4 business days after initial outreach',
      subject: `Following up: ${jobTitle} application -- ${candidateName}`,
      body: `Hi Team,

I wanted to quickly follow up on the ${jobTitle} application I submitted earlier this week. 

I understand you likely receive a high volume of candidates, but I wanted to reiterate my strong enthusiasm for ${companyName}. Since applying, I've been exploring your recent engineering updates and noticed some exciting parallels with problems I solved while architecting ${starRepo}.

If you have 10-15 minutes in the coming days, I'd love to introduce myself and discuss how my skill set can support your upcoming milestones.

Warmly,
${candidateName}`,
      callToAction: 'Request a brief 10-15 minute introductory phone chat.',
      valueAddHook: 'Highlights active interest in recent company engineering updates.',
    },
    {
      stage: 'day8_value_add',
      dayOffset: 8,
      label: 'Day 8: High-Value Technical Insight / Mini-Demo',
      recommendedWait: 'Wait 8 business days (approx. 1.5 weeks after initial apply)',
      subject: `Quick insight for ${companyName}'s engineering team (${jobTitle})`,
      body: `Hi ${companyName} Recruiting Team,

Hope you're having a productive week. 

While thinking about the ${jobTitle} position, I put together a quick technical prototype / architecture outline demonstrating how to optimize event throughput and reduce API latency using ${starTech} and Redis. 

I've documented the key insights here: https://github.com/${candidate.githubMetrics?.username || 'alexchen-dev'}/${starRepo}

Regardless of where you are in the hiring process, I hope this provides some value to your team. Happy to chat if you’d like to walk through the implementation!

Best,
${candidateName}`,
      callToAction: 'Share a mini technical artifact / demo demonstrating immediate domain competency.',
      valueAddHook: 'Delivers unprompted technical value and tangible code proof.',
    },
    {
      stage: 'day14_soft_breakup',
      dayOffset: 14,
      label: 'Day 14: Graceful Closing & Future Touchpoint',
      recommendedWait: 'Wait 14 business days (2 full weeks)',
      subject: `Closing the loop: ${jobTitle} at ${companyName}`,
      body: `Hi Team,

I know how busy the engineering and recruiting calendars get, so I assume now might not be the optimal time to move forward for the ${jobTitle} position.

I’ll plan on closing the loop on my end, but I remain a huge supporter of ${companyName} and would love to stay connected on LinkedIn (linkedin.com/in/alexchen-dev) for future opportunities down the road.

Wishing you and the team continued success!

Best regards,
${candidateName}`,
      callToAction: 'Establish a lasting professional network connection on LinkedIn with zero pressure.',
      valueAddHook: 'Professional, low-friction closing that leaves a memorable positive impression.',
    },
  ];

  return {
    jobTitle,
    companyName,
    emails,
    calendarReminderSummary: `Follow-up cadence for ${jobTitle} at ${companyName}`,
  };
}

/**
 * Generates an .ICS file format string for calendar import
 */
export function generateIcsCalendarFile(
  sequence: FollowUpSequence,
  applicationDate: Date = new Date()
): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatIcsDate = (d: Date) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  let icsEvents = '';

  sequence.emails.forEach((email, idx) => {
    const eventDate = new Date(applicationDate.getTime() + email.dayOffset * 24 * 60 * 60 * 1000);
    // Set at 10:00 AM
    eventDate.setHours(10, 0, 0, 0);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000);

    const uid = `followup-${idx}-${Date.now()}@omniapply.ai`;
    const summary = `OmniApply Follow-up: ${sequence.companyName} (${email.label})`;
    const description = `Follow-up Subject: ${email.subject}\\n\\nRecommendation: ${email.callToAction}\\n\\nTemplate Body:\\n${email.body.replace(/\n/g, '\\n')}`;

    icsEvents += `
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatIcsDate(new Date())}
DTSTART:${formatIcsDate(eventDate)}
DTEND:${formatIcsDate(endDate)}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Follow-up Reminder
END:VALARM
END:VEVENT`;
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OmniApply AI//Recruiter Follow-up Sequencer//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${sequence.companyName} Application Follow-ups${icsEvents}
END:VCALENDAR`;
}
