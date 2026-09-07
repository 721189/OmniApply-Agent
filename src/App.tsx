import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProfileHub } from './components/ProfileHub';
import { JobStudio } from './components/JobStudio';
import { ApplicationReviewer } from './components/ApplicationReviewer';
import { JobTracker } from './components/JobTracker';
import { WorkerTelemetryModal } from './components/WorkerTelemetryModal';
import { AuthModal } from './components/AuthModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { CopilotChatDrawer } from './components/CopilotChatDrawer';
import { 
  ProfileUrls, 
  CandidateAnalysis, 
  JobApplication, 
  UserAccount, 
  AgentTask, 
  PlatformType, 
  JobStatus,
  TabType
} from './types';
import * as MockData from './data/mockProfiles';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { apiFetch } from './utils/apiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  
  // Profile URLs state - default to first rich preset
  const [urls, setUrls] = useState<ProfileUrls>(
    (MockData as any).SAMPLE_PROFILE_PRESETS?.[0]?.urls || {
      linkedin: 'https://linkedin.com/in/alexchen-dev',
      github: 'https://github.com/alexchen-dev',
      leetcode: 'https://leetcode.com/u/alexchen_dsa',
      substack: 'https://systems-scale.substack.com',
      twitter: 'https://x.com/alexchen_dev',
    }
  );
  const [analysis, setAnalysis] = useState<CandidateAnalysis | null>(
    (MockData as any).DEFAULT_SAMPLE_ANALYSIS || null
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);

  // Application Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [savedJobs, setSavedJobs] = useState<JobApplication[]>([]);
  const [telemetryTasks, setTelemetryTasks] = useState<AgentTask[]>([]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initialize Auth & fetch existing applications from database
  useEffect(() => {
    const initAuthAndData = async () => {
      const token = localStorage.getItem('omniapply_token');
      if (token) {
        try {
          const res = await apiFetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              localStorage.setItem('omniapply_user', JSON.stringify(data.user));
              await fetchSavedJobs();
              await fetchTelemetryTasks();
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to verify existing session:', e);
        }
      }

      // Check for cached user in localStorage
      const cachedUserStr = localStorage.getItem('omniapply_user');
      if (cachedUserStr) {
        try {
          const user = JSON.parse(cachedUserStr);
          setCurrentUser(user);
        } catch {
          // ignore
        }
      }

      await fetchSavedJobs();
      await fetchTelemetryTasks();
    };

    initAuthAndData();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await apiFetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          setSavedJobs(data.jobs);
          if (data.jobs.length > 0 && !currentApplication) {
            setCurrentApplication(data.jobs[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load saved jobs from server:', e);
    }
  };

  const fetchTelemetryTasks = async () => {
    try {
      const res = await apiFetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (data.tasks) {
          setTelemetryTasks(data.tasks);
        }
      }
    } catch (e) {
      console.warn('Could not load telemetry tasks:', e);
    }
  };

  const handleAuthSuccess = (user: UserAccount, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('omniapply_user', JSON.stringify(user));
    localStorage.setItem('omniapply_token', token);
    showToast(`Welcome, ${user.name}!`, 'success');
    fetchSavedJobs();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('omniapply_user');
    localStorage.removeItem('omniapply_token');
    showToast('Logged out successfully.');
    setSavedJobs([]);
  };

  const handleUpdateProfile = async (updatedData: Partial<UserAccount>) => {
    const res = await apiFetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    if (data.user) {
      setCurrentUser(data.user);
      localStorage.setItem('omniapply_user', JSON.stringify(data.user));
    }
  };

  // 1. Trigger Multi-Platform Profile Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const mockTaskId = `task-celery-${Math.random().toString(36).substring(2, 9)}`;
    const tempTask: AgentTask = {
      taskId: mockTaskId,
      type: 'profile_analysis',
      status: 'running',
      progress: 15,
      currentStage: 'Scraping LinkedIn & GitHub endpoints...',
      createdAt: new Date().toISOString(),
      workerId: 'celery-worker-01',
      logs: [
        {
          timestamp: new Date().toISOString(),
          stage: 'INGESTION',
          workerId: 'celery-worker-01',
          message: 'Connecting to LinkedIn public profile & GitHub REST API...',
          level: 'info',
        },
      ],
    };
    setActiveTask(tempTask);

    try {
      // Periodic progress ticker
      const progressInterval = setInterval(() => {
        setActiveTask((prev) => {
          if (!prev || prev.progress >= 90) return prev;
          const newProgress = Math.min(prev.progress + 18, 92);
          let newStage = 'Extracting LeetCode DSA rating and badges...';
          if (newProgress > 40) newStage = 'Reading Substack engineering articles & Twitter signals...';
          if (newProgress > 70) newStage = 'Synthesizing Unified Candidate Intelligence Dossier with Gemini...';
          return {
            ...prev,
            progress: newProgress,
            currentStage: newStage,
            logs: [
              ...prev.logs,
              {
                timestamp: new Date().toISOString(),
                stage: 'CORRELATION',
                workerId: 'celery-worker-01',
                message: `Parsed signals at ${newProgress}% completion...`,
                level: 'info',
              },
            ],
          };
        });
      }, 700);

      const res = await apiFetch('/api/analyze-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          userContext: currentUser ? { name: currentUser.name, email: currentUser.email } : undefined,
        }),
      });

      clearInterval(progressInterval);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze candidate profiles');
      }

      setAnalysis(data.analysis);
      if (data.task) {
        setActiveTask(data.task);
      }
      showToast('Profile analyzed with highest accuracy!', 'success');
      fetchTelemetryTasks();
    } catch (err: any) {
      showToast(err.message || 'Error running profile analysis', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Generate Tailored Application Package
  const handleGeneratePackage = async (params: {
    jobTitle: string;
    companyName: string;
    targetPlatform: PlatformType;
    jobDescription: string;
    salaryExpectation?: string;
    noticePeriod?: string;
  }) => {
    setIsGenerating(true);
    const mockTaskId = `task-appgen-${Math.random().toString(36).substring(2, 9)}`;
    const tempTask: AgentTask = {
      taskId: mockTaskId,
      type: 'application_generation',
      status: 'running',
      progress: 20,
      currentStage: `Formatting tailored responses for ${params.targetPlatform.toUpperCase()}...`,
      createdAt: new Date().toISOString(),
      workerId: 'celery-worker-02',
      logs: [
        {
          timestamp: new Date().toISOString(),
          stage: 'JOB_TARGETING',
          workerId: 'celery-worker-02',
          message: `Mapping candidate dossier to ${params.companyName} requirements...`,
          level: 'info',
        },
      ],
    };
    setActiveTask(tempTask);

    try {
      const progressInterval = setInterval(() => {
        setActiveTask((prev) => {
          if (!prev || prev.progress >= 90) return prev;
          const newProgress = Math.min(prev.progress + 20, 92);
          let newStage = 'Drafting custom founder note and recruiter InMail...';
          if (newProgress > 50) newStage = 'Auto-filling recruiter screening Q&A questions...';
          if (newProgress > 75) newStage = 'Evaluating ATS keyword score & resume mapping...';
          return {
            ...prev,
            progress: newProgress,
            currentStage: newStage,
            logs: [
              ...prev.logs,
              {
                timestamp: new Date().toISOString(),
                stage: 'GENERATION',
                workerId: 'celery-worker-02',
                message: `Synthesized recruiter package at ${newProgress}%`,
                level: 'info',
              },
            ],
          };
        });
      }, 600);

      const res = await apiFetch('/api/generate-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: params.jobTitle,
          companyName: params.companyName,
          targetPlatform: params.targetPlatform,
          jobDescription: params.jobDescription,
          salaryExpectation: params.salaryExpectation,
          noticePeriod: params.noticePeriod,
          candidateAnalysis: analysis,
        }),
      });

      clearInterval(progressInterval);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate application package');
      }

      if (data.jobApplication) {
        setCurrentApplication(data.jobApplication);
        setActiveTab('review');
        showToast('Application package synthesized systematically!', 'success');
        fetchSavedJobs();
      }
      fetchTelemetryTasks();
    } catch (err: any) {
      showToast(err.message || 'Error generating application package', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Update Job Drafts & Application Package
  const handleUpdateJob = async (updatedJob: JobApplication) => {
    try {
      const res = await apiFetch(`/api/jobs/${updatedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update job');

      setCurrentApplication(updatedJob);
      setSavedJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      showToast('Application package updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating job', 'error');
    }
  };

  // 4. Mark Job as Applied / Update Status
  const handleUpdateJobStatus = async (jobId: string, status: JobStatus, notes?: string) => {
    try {
      const res = await apiFetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update job status');

      showToast(`Job status updated to ${status.toUpperCase()}!`, 'success');
      if (currentApplication && currentApplication.id === jobId) {
        setCurrentApplication({
          ...currentApplication,
          status,
          notes: notes !== undefined ? notes : currentApplication.notes,
        });
      }
      fetchSavedJobs();
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  // 5. Delete Job from Database
  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete job');

      showToast('Application record removed.', 'info');
      if (currentApplication && currentApplication.id === jobId) {
        setCurrentApplication(null);
      }
      fetchSavedJobs();
    } catch (err: any) {
      showToast(err.message || 'Error deleting job', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onLogout={handleLogout}
        savedJobsCount={savedJobs.length}
        hasAnalysis={!!analysis}
        hasPreparedPackage={!!currentApplication}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Ingestion & Analysis Hub */}
        {activeTab === 'profile' && (
          <ProfileHub
            urls={urls}
            setUrls={setUrls}
            analysis={analysis}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            activeTask={activeTask}
            onProceedToStudio={() => setActiveTab('studio')}
            userName={currentUser?.name || 'Candidate'}
          />
        )}

        {/* Application Studio */}
        {activeTab === 'studio' && (
          <JobStudio
            analysis={analysis}
            onGeneratePackage={handleGeneratePackage}
            isGenerating={isGenerating}
            activeTask={activeTask}
            onBackToProfile={() => setActiveTab('profile')}
          />
        )}

        {/* Systematic Application Reviewer & Inspector */}
        {activeTab === 'review' && (
          <ApplicationReviewer
            currentJob={currentApplication}
            onUpdateJob={handleUpdateJob}
            onMarkAsApplied={(id) => handleUpdateJobStatus(id, 'applied')}
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {/* Job Applications History & Tracker */}
        {activeTab === 'tracker' && (
          <JobTracker
            jobs={savedJobs}
            onSelectJob={(job) => {
              setCurrentApplication(job);
              setActiveTab('review');
            }}
            onUpdateStatus={handleUpdateJobStatus}
            onDeleteJob={handleDeleteJob}
            onCreateNewApplication={() => setActiveTab('studio')}
            onRefreshJobs={fetchSavedJobs}
            candidateName={currentUser?.name || analysis?.fullName || 'Alex Chen'}
          />
        )}

        {/* Celery & Redis Workers Telemetry */}
        {activeTab === 'telemetry' && (
          <WorkerTelemetryModal
            tasks={telemetryTasks}
            onRefreshTasks={fetchTelemetryTasks}
          />
        )}

      </main>

      {/* Auth & Verification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Settings, Security & Data Privacy Modal */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* AI Copilot & Persistent Audit Trail Drawer */}
      <CopilotChatDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OmniApply AI Autonomous Career Engine</span>
          </div>
          <div className="text-slate-400">
            Supports <strong className="text-slate-200">Wellfound</strong>, <strong className="text-slate-200">LinkedIn</strong>, <strong className="text-slate-200">Internshala</strong> & <strong className="text-slate-200">Enterprise ATS</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}
