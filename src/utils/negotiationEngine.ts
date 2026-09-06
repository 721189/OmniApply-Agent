import { JobOfferDetails, LocationTier, SeniorityLevel, MarketBenchmark, CounterOfferScript, CompetingOffer } from '../types';

export const MARKET_BENCHMARKS: Record<string, MarketBenchmark> = {
  // US Tier 1 (San Francisco Bay Area, New York, Seattle)
  'us_tier1_sf_ny:entry_l3': {
    level: 'entry_l3',
    levelLabel: 'L3 / Junior Software Engineer (0-2 yrs)',
    region: 'us_tier1_sf_ny',
    regionLabel: 'US Tier 1 (SF Bay Area, NYC, Seattle)',
    currency: '$',
    baseP25: 125000,
    baseMedian: 145000,
    baseP75: 165000,
    baseP90: 180000,
    totalP25: 155000,
    totalMedian: 185000,
    totalP75: 220000,
    totalP90: 255000,
    equityMedian: 30000,
    bonusMedianPercent: 10,
  },
  'us_tier1_sf_ny:mid_l4': {
    level: 'mid_l4',
    levelLabel: 'L4 / Mid-Level Software Engineer (2-5 yrs)',
    region: 'us_tier1_sf_ny',
    regionLabel: 'US Tier 1 (SF Bay Area, NYC, Seattle)',
    currency: '$',
    baseP25: 155000,
    baseMedian: 175000,
    baseP75: 195000,
    baseP90: 215000,
    totalP25: 210000,
    totalMedian: 260000,
    totalP75: 310000,
    totalP90: 365000,
    equityMedian: 65000,
    bonusMedianPercent: 12,
  },
  'us_tier1_sf_ny:senior_l5': {
    level: 'senior_l5',
    levelLabel: 'L5 / Senior Software Engineer (5-8+ yrs)',
    region: 'us_tier1_sf_ny',
    regionLabel: 'US Tier 1 (SF Bay Area, NYC, Seattle)',
    currency: '$',
    baseP25: 185000,
    baseMedian: 210000,
    baseP75: 235000,
    baseP90: 265000,
    totalP25: 310000,
    totalMedian: 385000,
    totalP75: 465000,
    totalP90: 550000,
    equityMedian: 140000,
    bonusMedianPercent: 15,
  },
  'us_tier1_sf_ny:staff_l6': {
    level: 'staff_l6',
    levelLabel: 'L6 / Staff Software Engineer (8-12+ yrs)',
    region: 'us_tier1_sf_ny',
    regionLabel: 'US Tier 1 (SF Bay Area, NYC, Seattle)',
    currency: '$',
    baseP25: 220000,
    baseMedian: 250000,
    baseP75: 285000,
    baseP90: 320000,
    totalP25: 450000,
    totalMedian: 560000,
    totalP75: 690000,
    totalP90: 820000,
    equityMedian: 260000,
    bonusMedianPercent: 20,
  },
  'us_tier1_sf_ny:principal_l7': {
    level: 'principal_l7',
    levelLabel: 'L7 / Principal Engineer / Director',
    region: 'us_tier1_sf_ny',
    regionLabel: 'US Tier 1 (SF Bay Area, NYC, Seattle)',
    currency: '$',
    baseP25: 260000,
    baseMedian: 295000,
    baseP75: 340000,
    baseP90: 390000,
    totalP25: 680000,
    totalMedian: 880000,
    totalP75: 1100000,
    totalP90: 1450000,
    equityMedian: 500000,
    bonusMedianPercent: 25,
  },

  // US Remote / Tier 2
  'us_remote:mid_l4': {
    level: 'mid_l4',
    levelLabel: 'L4 / Mid-Level Software Engineer',
    region: 'us_remote',
    regionLabel: 'US Remote (Nationwide)',
    currency: '$',
    baseP25: 135000,
    baseMedian: 155000,
    baseP75: 175000,
    baseP90: 195000,
    totalP25: 175000,
    totalMedian: 215000,
    totalP75: 260000,
    totalP90: 310000,
    equityMedian: 45000,
    bonusMedianPercent: 10,
  },
  'us_remote:senior_l5': {
    level: 'senior_l5',
    levelLabel: 'L5 / Senior Software Engineer',
    region: 'us_remote',
    regionLabel: 'US Remote (Nationwide)',
    currency: '$',
    baseP25: 165000,
    baseMedian: 190000,
    baseP75: 215000,
    baseP90: 240000,
    totalP25: 250000,
    totalMedian: 320000,
    totalP75: 390000,
    totalP90: 460000,
    equityMedian: 105000,
    bonusMedianPercent: 15,
  },
  'us_remote:staff_l6': {
    level: 'staff_l6',
    levelLabel: 'L6 / Staff Software Engineer',
    region: 'us_remote',
    regionLabel: 'US Remote (Nationwide)',
    currency: '$',
    baseP25: 195000,
    baseMedian: 225000,
    baseP75: 255000,
    baseP90: 290000,
    totalP25: 360000,
    totalMedian: 460000,
    totalP75: 570000,
    totalP90: 690000,
    equityMedian: 195000,
    bonusMedianPercent: 18,
  },

  // Europe & UK (London, Berlin, Amsterdam, Zurich)
  'europe_uk:senior_l5': {
    level: 'senior_l5',
    levelLabel: 'L5 / Senior Software Engineer',
    region: 'europe_uk',
    regionLabel: 'Europe & UK (London, Berlin, Zurich)',
    currency: '£',
    baseP25: 90000,
    baseMedian: 115000,
    baseP75: 140000,
    baseP90: 170000,
    totalP25: 120000,
    totalMedian: 165000,
    totalP75: 220000,
    totalP90: 280000,
    equityMedian: 40000,
    bonusMedianPercent: 12,
  },
  'europe_uk:mid_l4': {
    level: 'mid_l4',
    levelLabel: 'L4 / Mid-Level Software Engineer',
    region: 'europe_uk',
    regionLabel: 'Europe & UK (London, Berlin, Zurich)',
    currency: '£',
    baseP25: 65000,
    baseMedian: 80000,
    baseP75: 98000,
    baseP90: 115000,
    totalP25: 80000,
    totalMedian: 105000,
    totalP75: 135000,
    totalP90: 165000,
    equityMedian: 20000,
    bonusMedianPercent: 10,
  },

  // India & APAC (Bangalore, Hyderabad, Singapore)
  'india_apac:senior_l5': {
    level: 'senior_l5',
    levelLabel: 'L5 / Senior Software Engineer',
    region: 'india_apac',
    regionLabel: 'India & APAC (Bangalore, Singapore)',
    currency: '₹',
    baseP25: 3200000,
    baseMedian: 4500000,
    baseP75: 6000000,
    baseP90: 7800000,
    totalP25: 4500000,
    totalMedian: 6500000,
    totalP75: 9000000,
    totalP90: 12500000,
    equityMedian: 1600000,
    bonusMedianPercent: 15,
  },
  'india_apac:mid_l4': {
    level: 'mid_l4',
    levelLabel: 'L4 / Mid-Level Software Engineer',
    region: 'india_apac',
    regionLabel: 'India & APAC (Bangalore, Singapore)',
    currency: '₹',
    baseP25: 1800000,
    baseMedian: 2600000,
    baseP75: 3500000,
    baseP90: 4500000,
    totalP25: 2400000,
    totalMedian: 3500000,
    totalP75: 4800000,
    totalP90: 6200000,
    equityMedian: 750000,
    bonusMedianPercent: 12,
  },
};

export function getMarketBenchmark(region: LocationTier, level: SeniorityLevel): MarketBenchmark {
  const key = `${region}:${level}`;
  if (MARKET_BENCHMARKS[key]) {
    return MARKET_BENCHMARKS[key];
  }
  // Fallbacks by region
  const fallbackKey = `${region}:senior_l5`;
  if (MARKET_BENCHMARKS[fallbackKey]) {
    return MARKET_BENCHMARKS[fallbackKey];
  }
  return MARKET_BENCHMARKS['us_tier1_sf_ny:senior_l5'];
}

export function calculateOfferMetrics(offer: JobOfferDetails) {
  const equityAnnual = (offer.equityGrant || 0) / (offer.equityVestingYears || 4);
  const annualBonus = (offer.baseSalary || 0) * ((offer.annualBonusPercentage || 0) / 100);
  const year1TC = (offer.baseSalary || 0) + equityAnnual + annualBonus + (offer.signOnBonus || 0);
  const recurringTC = (offer.baseSalary || 0) + equityAnnual + annualBonus;
  const fourYearTotalValue = ((offer.baseSalary || 0) * 4) + (offer.equityGrant || 0) + (annualBonus * 4) + (offer.signOnBonus || 0);

  // Growth Multiplier on Equity
  const multiplier = offer.stockGrowthMultiplier || 1.0;
  const simulated4YrEquity = (offer.equityGrant || 0) * multiplier;
  const simulatedYear1TC = (offer.baseSalary || 0) + (simulated4YrEquity / 4) + annualBonus + (offer.signOnBonus || 0);

  return {
    equityAnnual,
    annualBonus,
    year1TC,
    recurringTC,
    fourYearTotalValue,
    simulated4YrEquity,
    simulatedYear1TC,
  };
}

export function getPercentileScore(totalCompensation: number, benchmark: MarketBenchmark): {
  percentile: number;
  label: string;
  colorClass: string;
} {
  if (totalCompensation >= benchmark.totalP90) {
    const excess = Math.min(99, 90 + Math.round(((totalCompensation - benchmark.totalP90) / benchmark.totalP90) * 10));
    return { percentile: excess, label: 'Top Tier (P90+)', colorClass: 'text-emerald-400' };
  }
  if (totalCompensation >= benchmark.totalP75) {
    const range = benchmark.totalP90 - benchmark.totalP75;
    const progress = (totalCompensation - benchmark.totalP75) / (range || 1);
    const p = Math.round(75 + progress * 15);
    return { percentile: p, label: 'High Market (P75-P90)', colorClass: 'text-emerald-300' };
  }
  if (totalCompensation >= benchmark.totalMedian) {
    const range = benchmark.totalP75 - benchmark.totalMedian;
    const progress = (totalCompensation - benchmark.totalMedian) / (range || 1);
    const p = Math.round(50 + progress * 25);
    return { percentile: p, label: 'Market Median (P50-P75)', colorClass: 'text-blue-400' };
  }
  if (totalCompensation >= benchmark.totalP25) {
    const range = benchmark.totalMedian - benchmark.totalP25;
    const progress = (totalCompensation - benchmark.totalP25) / (range || 1);
    const p = Math.round(25 + progress * 25);
    return { percentile: p, label: 'Below Median (P25-P50)', colorClass: 'text-amber-400' };
  }
  const p = Math.max(10, Math.round((totalCompensation / (benchmark.totalP25 || 1)) * 25));
  return { percentile: p, label: 'Below Market Band (<P25)', colorClass: 'text-rose-400' };
}

export function generateCounterOfferScript(
  offer: JobOfferDetails,
  companyName: string,
  roleTitle: string,
  candidateName: string = 'Shivam Singh'
): CounterOfferScript {
  const benchmark = getMarketBenchmark(offer.locationTier, offer.seniorityLevel);
  const metrics = calculateOfferMetrics(offer);
  const curr = offer.currency || '$';

  const strategy = offer.negotiationStrategy || (offer.competingOffers && offer.competingOffers.length > 0 ? 'competing_offer' : 'top_market_percentile');

  // Determine realistic target asks
  const targetAskBase = offer.customAskBase || Math.round(Math.max(offer.baseSalary * 1.12, benchmark.baseP75));
  const targetAskEquity = offer.customAskEquity || Math.round(Math.max(offer.equityGrant * 1.25, benchmark.equityMedian * 4 * 1.15));
  const targetAskSignOn = offer.customAskSignOn || (offer.signOnBonus > 0 ? Math.round(offer.signOnBonus * 1.5) : Math.round(offer.baseSalary * 0.1));
  const targetAskTotal = targetAskBase + (targetAskEquity / 4) + (targetAskBase * (offer.annualBonusPercentage / 100)) + targetAskSignOn;

  if (strategy === 'competing_offer' && offer.competingOffers && offer.competingOffers.length > 0) {
    const topCompeting = offer.competingOffers[0];
    return {
      strategy: 'competing_offer',
      strategyTitle: `Competing Offer Leverage (${topCompeting.company})`,
      targetAskTotal,
      targetAskBase,
      targetAskEquity,
      targetAskSignOn,
      emailSubject: `Offer Discussion & Excitement for the ${roleTitle} role - ${candidateName}`,
      emailBody: `Hi [Recruiter / Hiring Manager Name],

Thank you so much for extending the offer to join ${companyName} as a ${roleTitle}! I've really enjoyed our conversations and I am genuinely excited about the team's roadmap and mission.

${companyName} remains my top choice because of the engineering culture and the technical problems we discussed. To be completely transparent, I am currently navigating another competitive offer from ${topCompeting.company} with a total compensation package around ${topCompeting.currency}${topCompeting.totalCompensation.toLocaleString()} (${topCompeting.currency}${topCompeting.baseSalary.toLocaleString()} base salary + equity).

Because ${companyName} is where I see the greatest long-term impact, if we are able to bridge the gap and adjust the package to ${curr}${targetAskBase.toLocaleString()} base salary and ${curr}${targetAskEquity.toLocaleString()} in equity grant (or an increased sign-on bonus of ${curr}${targetAskSignOn.toLocaleString()}), I would be thrilled to sign immediately and withdraw from all other interview processes today.

I appreciate your partnership throughout this process and look forward to hearing your thoughts!

Best regards,
${candidateName}`,
      verbalTalkingPoints: [
        `Express genuine excitement for ${companyName} as your primary choice.`,
        `Frame the competing offer from ${topCompeting.company} (${topCompeting.currency}${topCompeting.totalCompensation.toLocaleString()}) as a reference point for your current market value.`,
        `Give them an exact target (${curr}${targetAskBase.toLocaleString()} base or ${curr}${targetAskEquity.toLocaleString()} equity) that guarantees an immediate signature.`,
        `Be cooperative, collaborative, and ask how much flexibility exists in their compensation bands.`,
      ],
      keyLeveragePoints: [
        `Competing offer validation from ${topCompeting.company}`,
        `Immediate closing guarantee if target numbers are met`,
        `High market demand for full-stack engineering skillset`,
      ],
      fallbackWalkawayBoundary: `If base salary is hard-capped by HR band levels, request a higher 1st-year sign-on bonus (${curr}${targetAskSignOn.toLocaleString()}) or an accelerated 6-month compensation review milestone.`,
    };
  }

  if (strategy === 'cash_heavy_pivot') {
    return {
      strategy: 'cash_heavy_pivot',
      strategyTitle: 'Cash & Base Salary Optimization (Risk-Adjusted)',
      targetAskTotal,
      targetAskBase,
      targetAskEquity: offer.equityGrant * 0.9,
      targetAskSignOn,
      emailSubject: `Compensation Review for ${roleTitle} offer - ${candidateName}`,
      emailBody: `Hi [Hiring Manager / Recruiter Name],

Thank you very much for extending the offer for the ${roleTitle} position at ${companyName}. I have high conviction in the team and the product direction.

As I evaluate the overall structure of the package, I want to discuss the balance between base salary and equity. Due to my current personal financial commitments and cost of living considerations, I am seeking greater predictability in fixed compensation.

Would it be possible to adjust the base salary to ${curr}${targetAskBase.toLocaleString()}? I am very open to a slight rebalancing in equity (e.g., ${curr}${(offer.equityGrant * 0.9).toLocaleString()}) or a one-time sign-on bonus of ${curr}${targetAskSignOn.toLocaleString()} to reach an agreement that fits within your team's budget constraints.

If we can align on this structure, I would be ready to confirm my acceptance and finalize the start date immediately.

Warmly,
${candidateName}`,
      verbalTalkingPoints: [
        `Emphasize commitment to the role while highlighting preference for guaranteed base cash flow.`,
        `Offer flexibility to trade a portion of equity grant in exchange for higher recurring base pay.`,
        `Propose a sign-on bonus as a non-recurring budget bridge for the hiring manager.`,
      ],
      keyLeveragePoints: [
        `Budget neutrality via equity-for-cash trade-off`,
        `Predictable cash compensation matching senior market rates`,
      ],
      fallbackWalkawayBoundary: `Accept current base only if offset by a guaranteed performance bonus structure or sign-on bonus of at least ${curr}${targetAskSignOn.toLocaleString()}.`,
    };
  }

  // Default: Top Market Percentile (Levels.fyi / Glassdoor Benchmark Justification)
  return {
    strategy: 'top_market_percentile',
    strategyTitle: 'Market Benchmark & Technical Impact Justification',
    targetAskTotal,
    targetAskBase,
    targetAskEquity,
    targetAskSignOn,
    emailSubject: `Offer Discussion & Compensation Alignment for ${roleTitle} - ${candidateName}`,
    emailBody: `Hi [Recruiter / Hiring Manager Name],

I want to thank you and the entire team for the offer to join ${companyName} as a ${roleTitle}. I thoroughly enjoyed the interview process and came away very impressed by the engineering vision and challenges ahead.

I am eager to join and hit the ground running. When evaluating the offer against current compensation data for senior engineering roles in ${benchmark.regionLabel} (benchmarked via Levels.fyi and Glassdoor top quartiles), the market median for this scope is approximately ${curr}${benchmark.totalP75.toLocaleString()} TC.

Given my track record in architecting scalable distributed systems and delivering full-stack solutions with measurable impact, I am targeting a package closer to ${curr}${targetAskBase.toLocaleString()} base salary and ${curr}${targetAskEquity.toLocaleString()} in equity grant over 4 years.

With this adjustment, I would be thrilled to sign the offer right away and begin preparing for onboarding with the team.

Thank you again for your time and advocacy!

Sincerely,
${candidateName}`,
    verbalTalkingPoints: [
      `Anchor negotiations in objective third-party industry data (Levels.fyi, Glassdoor 75th percentile).`,
      `Tie the ask to your concrete technical capabilities (system architecture, shipping velocity, full-stack breadth).`,
      `Express enthusiasm to join immediately once the package reaches the targeted market band.`,
    ],
    keyLeveragePoints: [
      `Objective market compensation benchmarks for ${benchmark.levelLabel}`,
      `Candidate's verified engineering portfolio and problem-solving velocity`,
      `Streamlined hiring closing with zero extended delays`,
    ],
    fallbackWalkawayBoundary: `Seek a hybrid compromise: a modest ${curr}${(Math.round(offer.baseSalary * 1.06)).toLocaleString()} base increase combined with an additional ${curr}${(Math.round(offer.equityGrant * 0.15)).toLocaleString()} in equity or bonus guarantee.`,
  };
}
