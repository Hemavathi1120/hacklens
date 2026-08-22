import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  FileText, 
  Layers, 
  HelpCircle, 
  Loader2, 
  ChevronRight,
  Compass
} from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { api } from '../lib/api';

export default function ChatbotPage() {
  const { project } = useOutletContext();
  const [searchParams] = useSearchParams();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [documents, setDocuments] = useState([]);
  const messagesEndRef = useRef(null);

  // Suggested questions from user prompt
  const suggestedQuestions = [
    "What is the main problem we're solving?",
    "What are the biggest gaps in our idea?",
    "Which requirements are missing?",
    "Summarize my documentation.",
    "What improvements would you suggest?",
    "Does my proposed solution actually solve the problem?",
    "What risks should we consider?",
    "What questions might judges ask?",
  ];

  const fetchSessions = async () => {
    try {
      const sessList = await api.getChatSessions(project.id);
      setSessions(sessList);
      if (sessList.length > 0 && !activeSessionId) {
        setActiveSessionId(sessList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (sessionId) => {
    if (!sessionId) return;
    try {
      const msgList = await api.getSessionMessages(sessionId);
      setMessages(msgList);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocs = async () => {
    try {
      const docs = await api.getDocuments(project.id);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchDocs();
  }, [project.id]);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  // Handle URL pre-fill query if any
  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleCreateSession = async () => {
    try {
      const newSess = await api.createChatSession(
        project.id,
        `Analysis #${sessions.length + 1}`,
        'demo-user'
      );
      setSessions([newSess, ...sessions]);
      setActiveSessionId(newSess.id);
      setMessages([]);
    } catch (err) {
      alert('Failed to create chat session');
    }
  };

  const handleSend = async (questionToSend) => {
    const text = questionToSend || query;
    if (!text.trim() || sending) return;

    const userText = text.trim();
    setQuery('');
    setSending(true);

    // Optimistic UI user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userText,
      citations: [],
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatQuery({
        project_id: project.id,
        session_id: activeSessionId,
        query: userText,
        user_id: 'demo-user',
      });

      if (res.message) {
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, res.message]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `**ANSWER**\nError querying project RAG: ${err.message}. Please verify your documents are indexed properly.`,
          citations: [],
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-210px)]">
      
      {/* Left Sidebar: Project Context & Chat Sessions */}
      <div className="hidden lg:flex flex-col rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-4 overflow-hidden">
        
        {/* Session Switcher Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chat Threads
          </span>
          <button
            onClick={handleCreateSession}
            className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
            title="New Chat Session"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-1 overflow-y-auto max-h-32 pr-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-medium truncate flex items-center gap-2 transition-all ${
                activeSessionId === s.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s.title || 'Chat Session'}</span>
            </button>
          ))}
        </div>

        {/* Project Context Summary */}
        <div className="flex-1 overflow-y-auto space-y-3 pt-3 border-t border-slate-800 pr-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            Project Grounding Context
          </span>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Problem:</span>
            <p className="text-slate-300 mt-0.5 line-clamp-3 leading-relaxed">
              {project.problem_statement || 'None provided.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Idea:</span>
            <p className="text-slate-300 mt-0.5 line-clamp-3 leading-relaxed">
              {project.initial_idea || 'None provided.'}
            </p>
          </div>

          {/* Indexed Docs List */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">
              Indexed Documents ({documents.length}):
            </span>
            {documents.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No documents attached.</p>
            ) : (
              documents.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                  <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{d.filename}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Area: RAG Chat Area */}
      <div className="lg:col-span-3 flex flex-col rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Project Assistant <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">RAG Grounded</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask anything about your project problem, requirements, or documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4 py-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Ask your project anything</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  ProjectLens AI retrieves relevant statutory and requirement clauses to give you evidence-grounded answers.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="w-full pt-4 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block text-center">
                  Suggested Questions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sq)}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white text-left transition-all group"
                    >
                      <span className="group-hover:text-indigo-400 transition-colors">"{sq}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}

          {/* AI Thinking Animation */}
          {sending && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 max-w-md animate-ai-pulse">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing project documentation & synthesizing grounded response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask your project anything (e.g., 'What are the main risks?', 'Which requirements are missing?')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !query.trim()}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
