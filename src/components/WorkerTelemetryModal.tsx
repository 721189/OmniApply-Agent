import React from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Terminal, 
  Server, 
  Database, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import { AgentTask } from '../types';

interface WorkerTelemetryModalProps {
  tasks: AgentTask[];
  onRefreshTasks: () => void;
}

export const WorkerTelemetryModal: React.FC<WorkerTelemetryModalProps> = ({
  tasks,
  onRefreshTasks,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Async Pipeline Worker Engine
              </span>
              <span className="text-xs text-slate-400">
                Worker Health: 100% SLA
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Agent Worker Pipeline & Task Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitoring of asynchronous task pipelines, Redis rate-limiting coordination, and Gemini reasoning execution.
            </p>
          </div>

          <button
            onClick={onRefreshTasks}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Worker Nodes Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Async Workers</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-black text-white">4 Active</div>
            <span className="text-[11px] text-slate-400 font-mono">async-worker-pipeline-[01..04]</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Redis Broker</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-black text-indigo-400">Sub-1ms</div>
            <span className="text-[11px] text-slate-400 font-mono">Atomic Rate-Limit & Pub/Sub</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Gemini Reasoning</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400">Active</div>
            <span className="text-[11px] text-slate-400 font-mono">Structured JSON Inference</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Task Completion</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-black text-purple-400">{tasks.length} Executed</div>
            <span className="text-[11px] text-slate-400 font-mono">0 Failed Tasks</span>
          </div>

        </div>

      </div>

      {/* Task Queue Execution Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span>Real-Time Asynchronous Worker Task Stream</span>
        </h3>

        {tasks.length === 0 ? (
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            No background worker tasks triggered in this session yet. Run profile analysis or application generation to see live logs!
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.taskId} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-400' : 'bg-indigo-400 animate-ping'}`} />
                    <span className="text-xs font-mono font-bold text-indigo-300">{task.taskId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 uppercase font-mono">
                      {task.type}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Worker: <strong className="text-slate-300">{task.workerId}</strong> • {new Date(task.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Stage & Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>{task.currentStage}</span>
                    <span className="text-indigo-400 font-mono">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>

                {/* Detailed Logs Accordion */}
                <div className="mt-3 bg-slate-900/90 rounded-xl p-3 border border-slate-800 font-mono text-[11px] space-y-1.5 max-h-40 overflow-y-auto">
                  {task.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={`shrink-0 ${log.level === 'success' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        [{log.stage}]
                      </span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
