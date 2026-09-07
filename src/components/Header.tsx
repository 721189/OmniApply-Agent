import React from 'react';
import { 
  Briefcase, 
  Layers, 
  FileCheck, 
  Clock, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  LogOut,
  Cpu
} from 'lucide-react';
import { UserAccount, TabType } from '../types';

export type { TabType };

interface HeaderProps {
  activeTab: TabType;
  onSelectTab?: (tab: TabType) => void;
  setActiveTab?: (tab: TabType) => void;
  currentUser?: UserAccount | null;
  user?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  onOpenCopilot?: () => void;
  onLogout: () => void;
  savedJobsCount: number;
  hasAnalysis?: boolean;
  hasPreparedPackage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  currentUser,
  user,
  onOpenAuthModal,
  onOpenAuth,
  onOpenSettings,
  onOpenCopilot,
  onLogout,
  savedJobsCount,
  hasAnalysis,
  hasPreparedPackage,
}) => {
  const effectiveUser = currentUser !== undefined ? currentUser : user || null;
  const handleTabChange = (tab: TabType) => {
    if (onSelectTab) onSelectTab(tab);
    if (setActiveTab) setActiveTab(tab);
  };
  const handleAuthOpen = () => {
    if (onOpenAuthModal) onOpenAuthModal();
    if (onOpenAuth) onOpenAuth();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('profile')}>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  OmniApply <span className="text-indigo-400 font-extrabold">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Autonomous Agent
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
                Multi-Platform Career Intelligence & Application Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => handleTabChange('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>1. Profile Intelligence</span>
              {hasAnalysis && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => handleTabChange('studio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>2. Application Studio</span>
            </button>

            <button
              onClick={() => handleTabChange('review')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'review'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>3. Package Inspector</span>
              {hasPreparedPackage && (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded border border-emerald-500/40">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('tracker')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>4. Saved Jobs</span>
              {savedJobsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-bold rounded-full">
                  {savedJobsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('telemetry')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'telemetry'
                  ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Celery & Redis Worker Telemetry"
            >
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Workers</span>
            </button>
          </nav>

          {/* User Status / Auth Controls */}
          <div className="flex items-center gap-2.5">
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm"
                title="Open AI Copilot Chat & Activity Audit Trail"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span>AI Copilot</span>
              </button>
            )}

            {effectiveUser ? (
              <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
                  title="Click to manage profile & data settings"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                      {effectiveUser.name ? effectiveUser.name[0].toUpperCase() : 'U'}
                    </div>
                    {effectiveUser.isVerified ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full" />
                    ) : (
                      <span 
                        onClick={(e) => { e.stopPropagation(); handleAuthOpen(); }} 
                        className="cursor-pointer w-2.5 h-2.5 bg-amber-400 rounded-full absolute -bottom-0.5 -right-0.5 border border-slate-950" 
                        title="Email unverified - Click to verify" 
                      />
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                        {effectiveUser.name}
                      </span>
                      {effectiveUser.isVerified ? (
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 rounded font-medium border border-emerald-500/30">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-medium border border-amber-500/30">
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {effectiveUser.email}
                    </p>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors ml-1"
                  title="Logout / Switch Profile"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthOpen}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all duration-150"
              >
                <User className="h-4 w-4" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 gap-2 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => handleTabChange('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800/50'
            }`}
          >
            1. Profile Hub
          </button>
          <button
            onClick={() => handleTabChange('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'studio' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800/50'
            }`}
          >
            2. Job Studio
          </button>
          <button
            onClick={() => handleTabChange('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'review' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800/50'
            }`}
          >
            3. Package Review
          </button>
          <button
            onClick={() => handleTabChange('tracker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'tracker' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800/50'
            }`}
          >
            4. Saved ({savedJobsCount})
          </button>
          <button
            onClick={() => handleTabChange('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'telemetry' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-800/50'
            }`}
          >
            Workers
          </button>
        </div>

      </div>
    </header>
  );
};
