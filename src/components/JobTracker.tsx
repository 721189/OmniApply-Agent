import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Building2, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Download, 
  Kanban, 
  List, 
  Sparkles,
  FileText,
  DollarSign,
  MapPin,
  Check,
  Award,
  Scale
} from 'lucide-react';
import { JobApplication, JobStatus, PlatformType, JobOfferDetails } from '../types';
import { OfferCalculatorModal } from './OfferCalculatorModal';

interface JobTrackerProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onUpdateStatus: (jobId: string, status: JobStatus, notes?: string) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onCreateNewApplication: () => void;
  onRefreshJobs?: () => Promise<void>;
  candidateName?: string;
}

const STATUS_COLUMNS: { id: JobStatus; label: string; color: string }[] = [
  { id: 'prepared', label: 'Prepared / Draft', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'applied', label: 'Applied', color: 'border-indigo-500/40 bg-indigo-950/20' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-amber-500/40 bg-amber-950/20' },
  { id: 'offer', label: 'Offer Received', color: 'border-emerald-500/40 bg-emerald-950/20' },
  { id: 'archived', label: 'Archived', color: 'border-slate-800 bg-slate-950/40' },
];

export const JobTracker: React.FC<JobTrackerProps> = ({
  jobs,
  onSelectJob,
  onUpdateStatus,
  onDeleteJob,
  onCreateNewApplication,
  onRefreshJobs,
  candidateName,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [editingNotesJobId, setEditingNotesJobId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [selectedOfferJob, setSelectedOfferJob] = useState<JobApplication | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const handleSaveOfferDetails = async (jobId: string, offerDetails: JobOfferDetails) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerDetails }),
      });
      if (res.ok) {
        if (onRefreshJobs) await onRefreshJobs();
      }
    } catch (err) {
      console.error('Failed to update offer details:', err);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || job.targetPlatform === selectedPlatform;
    const matchesStatus = selectedStatusFilter === 'all' || job.status === selectedStatusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Calculate Metrics
  const totalJobs = jobs.length;
  const appliedCount = jobs.filter((j) => j.status === 'applied' || j.status === 'interviewing' || j.status === 'offer').length;
  const interviewCount = jobs.filter((j) => j.status === 'interviewing' || j.status === 'offer').length;
  const offerCount = jobs.filter((j) => j.status === 'offer').length;
  const interviewRate = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0;
  const avgAtsScore = jobs.length > 0 
    ? Math.round(jobs.reduce((acc, j) => acc + (j.applicationPackage?.atsReport?.atsMatchScore || 90), 0) / jobs.length)
    : 92;

  const handleSaveNotes = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      await onUpdateStatus(jobId, job.status, noteInput);
      setEditingNotesJobId(null);
      setNoteInput('');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Job Title', 'Platform', 'Status', 'Applied Date', 'ATS Match Score', 'Notes'];
    const rows = filteredJobs.map((j) => [
      `"${j.companyName}"`,
      `"${j.jobTitle}"`,
      `"${j.targetPlatform}"`,
      `"${j.status}"`,
      `"${j.appliedDate || j.createdAt}"`,
      `"${j.applicationPackage?.atsReport?.atsMatchScore || 90}%"`,
      `"${(j.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omni-apply-job-pipeline-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Applications</span>
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalJobs}</div>
          <div className="text-[11px] text-slate-400">Generated across all boards</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interview Rate</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{interviewRate}%</div>
          <div className="text-[11px] text-slate-400">{interviewCount} in active interview loops</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg ATS Match</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{avgAtsScore}%</div>
          <div className="text-[11px] text-slate-400">Keyword relevance rating</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Offers Received</span>
            <Award className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">{offerCount}</div>
          <div className="text-[11px] text-slate-400">Offer stages secured</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Mode Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or job title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Platform & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="wellfound">Wellfound</option>
            <option value="linkedin">LinkedIn</option>
            <option value="internshala">Internshala</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Data Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition-colors"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onCreateNewApplication}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New</span>
          </button>
        </div>
      </div>

      {/* View 1: Interactive Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const colJobs = filteredJobs.filter((j) => j.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-3xl border p-4 flex flex-col gap-3 min-h-[420px] ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                    {colJobs.length}
                  </span>
                </div>

                {/* Job Cards in Column */}
                <div className="space-y-3 flex-1">
                  {colJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl shadow-md space-y-3 transition-all cursor-pointer group"
                      onClick={() => onSelectJob(job)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {job.jobTitle}
                          </h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" />
                            <span>{job.companyName}</span>
                          </p>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 text-indigo-400 rounded border border-slate-800 font-bold uppercase">
                          {job.targetPlatform}
                        </span>
                      </div>

                      {/* ATS Score & Date */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="text-emerald-400 font-bold">
                          ATS: {job.applicationPackage?.atsReport?.atsMatchScore || 92}%
                        </span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Status Shifter dropdown */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Offer received highlight button */}
                        {job.status === 'offer' && (
                          <button
                            onClick={() => {
                              setSelectedOfferJob(job);
                              setIsOfferModalOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold transition shadow-sm"
                          >
                            <Scale className="h-3.5 w-3.5" />
                            <span>Evaluate & Negotiate Offer</span>
                          </button>
                        )}

                        <div className="flex items-center justify-between">
                          <select
                            value={job.status}
                            onChange={(e) => onUpdateStatus(job.id, e.target.value as JobStatus)}
                            className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="draft">Draft</option>
                            <option value="prepared">Prepared</option>
                            <option value="applied">Applied</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offer">Offer Received</option>
                            <option value="archived">Archived</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedOfferJob(job);
                                setIsOfferModalOpen(true);
                              }}
                              className="text-slate-500 hover:text-emerald-400 p-1 transition-colors"
                              title="Salary & Offer Negotiation Calculator"
                            >
                              <Scale className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={`/api/jobs/${job.id}/ics`}
                              download
                              className="text-slate-500 hover:text-purple-400 p-1 transition-colors"
                              title="Download Recruiter Follow-up .ICS Calendar"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete application for ${job.companyName}?`)) {
                                  onDeleteJob(job.id);
                                }
                              }}
                              className="text-slate-600 hover:text-rose-400 p-1"
                              title="Delete Application"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colJobs.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-2xl text-[11px] text-slate-600">
                      No jobs in {col.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View 2: Data Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Target Role & Company</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">ATS Match</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredJobs.map((job) => (
                  <tr 
                    key={job.id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onSelectJob(job)}
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{job.jobTitle}</div>
                      <div className="text-[11px] text-slate-400">{job.companyName}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-950 text-indigo-300 border border-slate-800 rounded-md font-medium uppercase text-[10px]">
                        {job.targetPlatform}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={job.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateStatus(job.id, e.target.value as JobStatus)}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="prepared">Prepared</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer Received</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-emerald-400 font-bold">
                        {job.applicationPackage?.atsReport?.atsMatchScore || 92}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {job.status === 'offer' && (
                          <button
                            onClick={() => {
                              setSelectedOfferJob(job);
                              setIsOfferModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
                          >
                            <Scale className="h-3 w-3" />
                            Negotiate
                          </button>
                        )}
                        <button
                          onClick={() => onSelectJob(job)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete application for ${job.companyName}?`)) {
                              onDeleteJob(job.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offer Negotiation & Evaluation Modal */}
      <OfferCalculatorModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false);
          setSelectedOfferJob(null);
        }}
        job={selectedOfferJob}
        onSaveOfferDetails={handleSaveOfferDetails}
        candidateName={candidateName}
      />

    </div>
  );
};
