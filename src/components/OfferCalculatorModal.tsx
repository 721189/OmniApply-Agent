import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Sparkles, Copy, Check, X, 
  ShieldCheck, ArrowRight, Building2, Sliders, BarChart3, 
  Percent, Award, Info, Scale, Plus, Trash2, Mail, MessageSquare
} from 'lucide-react';
import { 
  JobOfferDetails, LocationTier, SeniorityLevel, CompetingOffer, 
  CounterOfferScript, JobApplication 
} from '../types';
import { 
  getMarketBenchmark, calculateOfferMetrics, getPercentileScore, 
  generateCounterOfferScript 
} from '../utils/negotiationEngine';

interface OfferCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication | null;
  onSaveOfferDetails?: (jobId: string, offerDetails: JobOfferDetails) => Promise<void>;
  candidateName?: string;
}

export const OfferCalculatorModal: React.FC<OfferCalculatorModalProps> = ({
  isOpen,
  onClose,
  job,
  onSaveOfferDetails,
  candidateName = 'Alex Chen',
}) => {
  // Offer state default initialized from job or realistic senior defaults
  const [offer, setOffer] = useState<JobOfferDetails>({
    baseSalary: job?.offerDetails?.baseSalary || 195000,
    currency: job?.offerDetails?.currency || '$',
    equityGrant: job?.offerDetails?.equityGrant || 160000,
    equityVestingYears: job?.offerDetails?.equityVestingYears || 4,
    equityCliffMonths: job?.offerDetails?.equityCliffMonths || 12,
    equityType: job?.offerDetails?.equityType || 'RSU',
    annualBonusPercentage: job?.offerDetails?.annualBonusPercentage || 12,
    signOnBonus: job?.offerDetails?.signOnBonus || 20000,
    locationTier: job?.offerDetails?.locationTier || 'us_tier1_sf_ny',
    seniorityLevel: job?.offerDetails?.seniorityLevel || 'senior_l5',
    stockGrowthMultiplier: job?.offerDetails?.stockGrowthMultiplier || 1.0,
    competingOffers: job?.offerDetails?.competingOffers || [
      {
        company: 'Stripe',
        role: 'Senior Software Engineer',
        baseSalary: 205000,
        equityPerYear: 75000,
        signOnBonus: 25000,
        totalCompensation: 305000,
        currency: '$',
      },
    ],
    negotiationStrategy: job?.offerDetails?.negotiationStrategy || 'competing_offer',
  });

  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'benchmark' | 'counter_script' | 'competing'>('calculator');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New competing offer form state
  const [newCompCompany, setNewCompCompany] = useState('');
  const [newCompBase, setNewCompBase] = useState<number>(190000);
  const [newCompEquity, setNewCompEquity] = useState<number>(60000);
  const [newCompSignOn, setNewCompSignOn] = useState<number>(15000);

  useEffect(() => {
    if (job?.offerDetails) {
      setOffer(job.offerDetails);
    }
  }, [job?.id]);

  if (!isOpen) return null;

  const companyName = job?.companyName || 'Target Company';
  const jobTitle = job?.jobTitle || 'Senior Software Engineer';

  const benchmark = getMarketBenchmark(offer.locationTier, offer.seniorityLevel);
  const metrics = calculateOfferMetrics(offer);
  const percentileScore = getPercentileScore(metrics.year1TC, benchmark);
  const counterScript = generateCounterOfferScript(offer, companyName, jobTitle, candidateName);

  const curr = offer.currency;

  const handleFieldChange = (field: keyof JobOfferDetails, value: any) => {
    setOffer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCompetingOffer = () => {
    if (!newCompCompany) return;
    const totalComp = Number(newCompBase) + Number(newCompEquity) + Number(newCompSignOn);
    const newOffer: CompetingOffer = {
      company: newCompCompany,
      role: jobTitle,
      baseSalary: Number(newCompBase),
      equityPerYear: Number(newCompEquity),
      signOnBonus: Number(newCompSignOn),
      totalCompensation: totalComp,
      currency: offer.currency,
    };
    setOffer((prev) => ({
      ...prev,
      competingOffers: [...(prev.competingOffers || []), newOffer],
      negotiationStrategy: 'competing_offer',
    }));
    setNewCompCompany('');
  };

  const handleRemoveCompetingOffer = (index: number) => {
    setOffer((prev) => ({
      ...prev,
      competingOffers: (prev.competingOffers || []).filter((_, i) => i !== index),
    }));
  };

  const handleCopy = (text: string, type: 'subject' | 'body') => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!job || !onSaveOfferDetails) return;
    setIsSaving(true);
    try {
      await onSaveOfferDetails(job.id, offer);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Salary Negotiation & Offer Evaluation Engine
                </h2>
                <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Levels.fyi & Glassdoor Benchmarks
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valuation analysis & counter-offer scripts for <strong className="text-slate-200">{jobTitle}</strong> at <strong className="text-slate-200">{companyName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveOfferDetails && job && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Saved to Job!' : isSaving ? 'Saving...' : 'Save Offer to Job'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeSubTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Compensation Breakdown
          </button>
          <button
            onClick={() => setActiveSubTab('benchmark')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeSubTab === 'benchmark'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Market Percentiles ({percentileScore.label})
          </button>
          <button
            onClick={() => setActiveSubTab('competing')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeSubTab === 'competing'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Competing Offers ({offer.competingOffers?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('counter_script')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeSubTab === 'counter_script'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Counter-Offer Negotiation Script
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
          
          {/* Top Summary Metrics Cards (Always visible) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Year 1 Total Comp (TC)
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                {curr}{Math.round(metrics.year1TC).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Includes sign-on & bonus
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Recurring Annual TC
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                {curr}{Math.round(metrics.recurringTC).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Year 2-4 base + equity + bonus
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Market Band Standing
              </div>
              <div className={`text-lg sm:text-xl font-extrabold ${percentileScore.colorClass} mt-1`}>
                {percentileScore.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ~{percentileScore.percentile}th percentile
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                4-Year Total Value
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono mt-1">
                {curr}{Math.round(metrics.fourYearTotalValue).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Cumulative package value
              </div>
            </div>
          </div>

          {/* TAB 1: Compensation Input & Equity Simulator */}
          {activeSubTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Offer Parameters & Level Settings
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Currency:</span>
                    <select
                      value={offer.currency}
                      onChange={(e) => handleFieldChange('currency', e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2 py-1"
                    >
                      <option value="$">$ USD</option>
                      <option value="£">£ GBP</option>
                      <option value="€">€ EUR</option>
                      <option value="₹">₹ INR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location Tier */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Region / Market Tier
                    </label>
                    <select
                      value={offer.locationTier}
                      onChange={(e) => handleFieldChange('locationTier', e.target.value as LocationTier)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="us_tier1_sf_ny">US Tier 1 (SF Bay Area, NYC, Seattle)</option>
                      <option value="us_remote">US Remote (Nationwide)</option>
                      <option value="europe_uk">Europe & UK (London, Berlin, Zurich)</option>
                      <option value="india_apac">India & APAC (Bangalore, Singapore)</option>
                    </select>
                  </div>

                  {/* Seniority Level */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Role Seniority Level
                    </label>
                    <select
                      value={offer.seniorityLevel}
                      onChange={(e) => handleFieldChange('seniorityLevel', e.target.value as SeniorityLevel)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="entry_l3">L3 / Junior Engineer (0-2 yrs)</option>
                      <option value="mid_l4">L4 / Mid-Level Engineer (2-5 yrs)</option>
                      <option value="senior_l5">L5 / Senior Engineer (5-8+ yrs)</option>
                      <option value="staff_l6">L6 / Staff Engineer (8-12+ yrs)</option>
                      <option value="principal_l7">L7 / Principal Engineer</option>
                    </select>
                  </div>

                  {/* Base Salary */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Annual Base Salary ({curr})
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={offer.baseSalary}
                      onChange={(e) => handleFieldChange('baseSalary', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Sign-on Bonus */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      One-Time Sign-on Bonus ({curr})
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={offer.signOnBonus}
                      onChange={(e) => handleFieldChange('signOnBonus', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Equity Total Grant */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Total 4-Year Equity Grant ({curr})
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={offer.equityGrant}
                      onChange={(e) => handleFieldChange('equityGrant', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      = {curr}{Math.round(metrics.equityAnnual).toLocaleString()}/yr (over {offer.equityVestingYears} yrs)
                    </span>
                  </div>

                  {/* Target Annual Bonus % */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Annual Target Bonus (%)
                    </label>
                    <input
                      type="number"
                      step={1}
                      value={offer.annualBonusPercentage}
                      onChange={(e) => handleFieldChange('annualBonusPercentage', Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      = {curr}{Math.round(metrics.annualBonus).toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                {/* Equity Growth Scenario Simulator */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      Company Stock Growth Simulation ({offer.stockGrowthMultiplier || 1.0}x)
                    </label>
                    <span className="text-xs font-mono text-indigo-300 font-bold">
                      Simulated 4-Yr Equity: {curr}{Math.round(metrics.simulated4YrEquity).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={4.0}
                    step={0.25}
                    value={offer.stockGrowthMultiplier || 1.0}
                    onChange={(e) => handleFieldChange('stockGrowthMultiplier', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0.5x (Bear)</span>
                    <span>1.0x (Flat Baseline)</span>
                    <span>2.0x (Strong Growth)</span>
                    <span>4.0x (Unicorn / IPO)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Breakdown & Negotiation Action (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Visual Stack Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Compensation Composition (Year 1)
                  </h3>

                  {/* Horizontal Bar Breakdown */}
                  <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner">
                    <div 
                      style={{ width: `${(offer.baseSalary / metrics.year1TC) * 100}%` }}
                      className="bg-blue-600 h-full transition-all"
                      title={`Base Salary: ${curr}${offer.baseSalary.toLocaleString()}`}
                    />
                    <div 
                      style={{ width: `${(metrics.equityAnnual / metrics.year1TC) * 100}%` }}
                      className="bg-purple-600 h-full transition-all"
                      title={`Equity/Yr: ${curr}${Math.round(metrics.equityAnnual).toLocaleString()}`}
                    />
                    <div 
                      style={{ width: `${(metrics.annualBonus / metrics.year1TC) * 100}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title={`Bonus: ${curr}${Math.round(metrics.annualBonus).toLocaleString()}`}
                    />
                    {offer.signOnBonus > 0 && (
                      <div 
                        style={{ width: `${(offer.signOnBonus / metrics.year1TC) * 100}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Sign-on: ${curr}${offer.signOnBonus.toLocaleString()}`}
                      />
                    )}
                  </div>

                  {/* Legend Table */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Base Salary
                      </span>
                      <span className="font-mono font-bold text-white">
                        {curr}{offer.baseSalary.toLocaleString()} ({Math.round((offer.baseSalary / metrics.year1TC) * 100)}%)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        Annualized Equity
                      </span>
                      <span className="font-mono font-bold text-white">
                        {curr}{Math.round(metrics.equityAnnual).toLocaleString()}/yr ({Math.round((metrics.equityAnnual / metrics.year1TC) * 100)}%)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Target Annual Bonus ({offer.annualBonusPercentage}%)
                      </span>
                      <span className="font-mono font-bold text-white">
                        {curr}{Math.round(metrics.annualBonus).toLocaleString()}
                      </span>
                    </div>

                    {offer.signOnBonus > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          One-Time Sign-on
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {curr}{offer.signOnBonus.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Next Step:</span>
                    <button
                      onClick={() => setActiveSubTab('counter_script')}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Generate Counter-Offer Script
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Levels.fyi Market Percentiles & Benchmarks */}
          {activeSubTab === 'benchmark' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Levels.fyi & Industry Compensation Percentiles
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Benchmarked for <strong className="text-slate-200">{benchmark.levelLabel}</strong> in <strong className="text-slate-200">{benchmark.regionLabel}</strong>
                </p>
              </div>

              {/* Visual Market Percentile Meter */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>P25: {curr}{benchmark.totalP25.toLocaleString()}</span>
                  <span className="text-blue-400">Median (P50): {curr}{benchmark.totalMedian.toLocaleString()}</span>
                  <span className="text-indigo-400">P75: {curr}{benchmark.totalP75.toLocaleString()}</span>
                  <span className="text-emerald-400">P90 (Top Tier): {curr}{benchmark.totalP90.toLocaleString()}</span>
                </div>

                {/* Meter Bar */}
                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(100, Math.max(5, percentileScore.percentile))}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Your Current Offer TC: <strong className="text-emerald-400 font-mono">{curr}{Math.round(metrics.year1TC).toLocaleString()}</strong>
                  </span>
                  <span className={`font-bold ${percentileScore.colorClass}`}>
                    Standing: {percentileScore.label} ({percentileScore.percentile}th percentile)
                  </span>
                </div>
              </div>

              {/* Benchmarks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300">Base Salary Range</div>
                  <div className="space-y-1 text-slate-400 font-mono">
                    <div className="flex justify-between"><span>P25:</span> <span>{curr}{benchmark.baseP25.toLocaleString()}</span></div>
                    <div className="flex justify-between text-white font-bold"><span>Median:</span> <span>{curr}{benchmark.baseMedian.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>P75:</span> <span>{curr}{benchmark.baseP75.toLocaleString()}</span></div>
                    <div className="flex justify-between text-emerald-400"><span>P90:</span> <span>{curr}{benchmark.baseP90.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300">Total Comp Range</div>
                  <div className="space-y-1 text-slate-400 font-mono">
                    <div className="flex justify-between"><span>P25:</span> <span>{curr}{benchmark.totalP25.toLocaleString()}</span></div>
                    <div className="flex justify-between text-white font-bold"><span>Median:</span> <span>{curr}{benchmark.totalMedian.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>P75:</span> <span>{curr}{benchmark.totalP75.toLocaleString()}</span></div>
                    <div className="flex justify-between text-emerald-400"><span>P90:</span> <span>{curr}{benchmark.totalP90.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300">Negotiation Recommendation</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {metrics.year1TC < benchmark.totalP75 ? (
                      <>Your offer is currently below the 75th percentile for {benchmark.regionLabel}. You have strong leverage to ask for a <strong>{curr}{Math.round(benchmark.totalP75 - metrics.year1TC).toLocaleString()} TC bump</strong> targeting higher equity or base pay.</>
                    ) : (
                      <>Your offer is competitive in the top quartile (75th+ percentile). Anchor your counter-offer on a high-leverage signing bonus or equity acceleration.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Competing Offers Comparator */}
          {activeSubTab === 'competing' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    Competing Offers & Leverage Management
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add competing offers to automatically weave leverage points into your negotiation email.
                  </p>
                </div>
              </div>

              {/* List of Competing Offers */}
              <div className="space-y-3">
                {(offer.competingOffers || []).map((comp, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{comp.company}</span>
                        <span className="text-[11px] text-slate-400">({comp.role})</span>
                      </div>
                      <div className="text-xs font-mono text-purple-300 mt-1 flex flex-wrap gap-3">
                        <span>Base: {comp.currency}{comp.baseSalary.toLocaleString()}</span>
                        <span>Equity/Yr: {comp.currency}{comp.equityPerYear.toLocaleString()}</span>
                        {comp.signOnBonus > 0 && <span>Sign-on: {comp.currency}{comp.signOnBonus.toLocaleString()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Total Comp</div>
                        <div className="text-sm font-mono font-black text-emerald-400">
                          {comp.currency}{comp.totalCompensation.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCompetingOffer(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Remove Competing Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Competing Offer Form */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  Add Another Competing Offer
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Coinbase"
                      value={newCompCompany}
                      onChange={(e) => setNewCompCompany(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Base Salary ({curr})</label>
                    <input
                      type="number"
                      step={1000}
                      value={newCompBase}
                      onChange={(e) => setNewCompBase(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Annual Equity ({curr})</label>
                    <input
                      type="number"
                      step={1000}
                      value={newCompEquity}
                      onChange={(e) => setNewCompEquity(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Sign-on Bonus ({curr})</label>
                    <input
                      type="number"
                      step={1000}
                      value={newCompSignOn}
                      onChange={(e) => setNewCompSignOn(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddCompetingOffer}
                  disabled={!newCompCompany}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-40"
                >
                  Save Competing Offer
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Counter-Offer Negotiation Script Generator */}
          {activeSubTab === 'counter_script' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    Counter-Offer Negotiation Strategy & Script
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a negotiation angle to generate customized email scripts and verbal talking points.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Angle:</span>
                  <select
                    value={offer.negotiationStrategy || 'competing_offer'}
                    onChange={(e) => handleFieldChange('negotiationStrategy', e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="competing_offer">Competing Offer Leverage</option>
                    <option value="top_market_percentile">Top Market Percentile (Levels.fyi)</option>
                    <option value="cash_heavy_pivot">Cash & Base Pay Focus</option>
                    <option value="sign_on_tradeoff">Sign-On Bonus Bridge</option>
                  </select>
                </div>
              </div>

              {/* Target Ask Banner */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Recommended Target Ask:</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {curr}{counterScript.targetAskBase.toLocaleString()} Base • {curr}{counterScript.targetAskEquity.toLocaleString()} Equity • {curr}{counterScript.targetAskSignOn.toLocaleString()} Sign-on
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-xl font-semibold">
                  Target TC: {curr}{Math.round(counterScript.targetAskTotal).toLocaleString()}
                </div>
              </div>

              {/* Email Subject */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email Subject Line</span>
                  <button
                    onClick={() => handleCopy(counterScript.emailSubject, 'subject')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-medium"
                  >
                    {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSubject ? 'Copied' : 'Copy Subject'}
                  </button>
                </div>
                <div className="font-mono text-xs text-indigo-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  {counterScript.emailSubject}
                </div>
              </div>

              {/* Email Body */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email Counter-Offer Body</span>
                  <button
                    onClick={() => handleCopy(counterScript.emailBody, 'body')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedBody ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedBody ? 'Copied Full Script' : 'Copy Full Email Script'}
                  </button>
                </div>
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
                  {counterScript.emailBody}
                </div>
              </div>

              {/* Phone / Verbal Script Talking Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Verbal Phone Script Talking Points
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11.5px]">
                    {counterScript.verbalTalkingPoints.map((tp, idx) => (
                      <li key={idx} className="leading-snug">{tp}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Fallback & Walkaway Boundary
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11.5px]">
                    {counterScript.fallbackWalkawayBoundary}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
