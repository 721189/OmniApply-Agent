import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Clock, 
  MessageSquare, 
  RefreshCw,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { ChatMessage, ActivityLog, UserAccount } from '../types';
import { apiFetch } from '../utils/apiClient';

interface CopilotChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CopilotChatDrawer: React.FC<CopilotChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<ChatMessage['topic']>('general');
  const [isSending, setIsSending] = useState<boolean>(false);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      fetchActivityLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await apiFetch('/api/chat/history');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history || []);
      }
    } catch (e) {
      console.warn('Failed to fetch chat history:', e);
    }
  };

  const fetchActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await apiFetch('/api/activity/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch activity logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const queryText = input.trim();
    setInput('');
    setIsSending(true);

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      userId: currentUser?.id || 'temp-user',
      sender: 'user',
      text: queryText,
      timestamp: new Date().toISOString(),
      topic: selectedTopic,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await apiFetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: queryText, topic: selectedTopic }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          data.userMessage,
          data.assistantMessage,
        ]);
      } else {
        onShowToast('Failed to connect to AI Copilot', 'error');
      }
    } catch (err) {
      onShowToast('Network error sending message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your AI chat history?')) return;
    try {
      const res = await apiFetch('/api/chat/history', { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
        onShowToast('Chat history wiped cleanly', 'success');
        fetchActivityLogs();
      }
    } catch (err) {
      onShowToast('Failed to clear chat history', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>OmniApply AI Copilot</span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-mono border border-indigo-500/30">
                  Persistent
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Career Advisor & Production Audit History</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AI Copilot Chat ({messages.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('activity');
              fetchActivityLogs();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Activity Audit Log ({logs.length})</span>
          </button>
        </div>

        {/* TAB 1: AI CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/40">
            {/* Quick Topic Chips */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Topic:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'general', label: 'General Strategy', icon: Sparkles },
                  { id: 'interview', label: 'Interview Prep', icon: Briefcase },
                  { id: 'resume', label: 'Resume Help', icon: FileText },
                  { id: 'salary', label: 'Negotiation', icon: DollarSign },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id as any)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border transition-all whitespace-nowrap ${
                        selectedTopic === t.id
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  title="Wipe Chat History"
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ask OmniApply Career Copilot</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Your conversations are saved securely in the database store. Ask for interview questions, resume review, or negotiation tactics.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-left w-full max-w-sm pt-2">
                    {[
                      "How do I highlight my top projects for Senior Frontend roles?",
                      "Give me 3 tough system design questions for Stripe.",
                      "How should I frame my salary counter-offer email?",
                    ].map((promptText, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(promptText);
                        }}
                        className="p-2.5 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors text-left"
                      >
                        💡 "{promptText}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl mt-0.5 shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] opacity-70">
                        <span>{msg.sender === 'user' ? 'You' : 'Copilot AI'}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl mt-0.5 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>OmniApply AI Copilot is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask Copilot (${selectedTopic})...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors font-semibold"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: ACTIVITY LOG */}
        {activeTab === 'activity' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/40 p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Persistent User Audit Trail</span>
                </h4>
                <p className="text-[11px] text-slate-400">Recorded account operations & database events</p>
              </div>
              <button
                onClick={fetchActivityLogs}
                className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-xs flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800/80">
                No activity logs recorded yet. Perform profile analysis or generate job applications to record events.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-900 border border-slate-800/80 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          log.category === 'security' ? 'bg-amber-400' :
                          log.category === 'profile' ? 'bg-indigo-400' :
                          log.category === 'chat' ? 'bg-emerald-400' : 'bg-blue-400'
                        }`} />
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 pl-3.5">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
