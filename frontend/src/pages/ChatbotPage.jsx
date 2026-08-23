import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
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
  ChevronDown, 
  Compass, 
  Paperclip, 
  ShieldCheck, 
  Search, 
  BookOpen,
  Globe,
  ExternalLink
} from 'lucide-react';
import RuixenMoonChat from '../components/ui/ruixen-moon-chat';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function ChatbotPage() {
  const { project } = useOutletContext();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [sessionSearch, setSessionSearch] = useState('');

  // Accordion open states
  const [problemOpen, setProblemOpen] = useState(true);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(true);

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
      handleSend(initialQuery);
    }
  }, [searchParams]);

  const handleCreateSession = async () => {
    try {
      const newSess = await api.createChatSession(
        project.id,
        `Analysis #${sessions.length + 1}`,
        user?.id || project.user_id || 'anonymous-user'
      );
      setSessions([newSess, ...sessions]);
      setActiveSessionId(newSess.id);
      setMessages([]);
    } catch (err) {
      alert('Failed to create chat session');
    }
  };

  const handleSend = async (userText) => {
    if (!userText || !userText.trim() || sending) return;

    const trimmed = userText.trim();
    setSending(true);

    // Optimistic UI user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      citations: [],
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatQuery({
        project_id: project.id,
        session_id: activeSessionId,
        query: trimmed,
        user_id: user?.id || project.user_id || 'anonymous-user',
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
          content: `Unable to connect to HackLens AI: ${err.message}. Please verify your documents are indexed properly in the Documents section.`,
          citations: [],
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    (s.title || '').toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-190px)] min-h-[520px] max-h-[820px] overflow-hidden text-zinc-100">
      
      {/* Left Sidebar: Bounded height & Internal Scrolling */}
      <div className="hidden lg:flex flex-col h-full rounded-3xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-3 overflow-hidden shadow-sm flex-shrink-0">
        
        {/* Session Switcher Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Chat Threads
            </span>
          </div>
          <button
            onClick={handleCreateSession}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-red-600/20 transition-all hover:scale-105 border border-red-500/30"
            title="New Chat Session"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Sessions Search Bar */}
        {sessions.length > 3 && (
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search threads..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black"
            />
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-1 overflow-y-auto max-h-32 pr-1 flex-shrink-0">
          {filteredSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={cn(
                "w-full p-2 rounded-xl text-left text-xs font-bold truncate flex items-center gap-2 transition-all",
                activeSessionId === s.id
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm border border-red-500/30"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s.title || 'Chat Session'}</span>
            </button>
          ))}
        </div>

        {/* Project Context Grounding Accordion (Scrolls Internally) */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pt-2.5 border-t border-zinc-800 pr-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">
              Grounding Knowledge
            </span>
            <span className="text-[10px] text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/30">
              Active
            </span>
          </div>

          {/* Live Deployed Demo App Card */}
          {project.demo_url && (
            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-2.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-red-400" />
                  Live App
                </span>
                <a
                  href={project.demo_url.startsWith('http') ? project.demo_url : `https://${project.demo_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-red-300 hover:text-white flex items-center gap-1 font-bold bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-700/60 transition-colors"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> Launch
                </a>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono truncate">{project.demo_url}</p>
            </div>
          )}

          {/* Problem Statement Accordion */}
          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden shadow-2xs">
            <button
              onClick={() => setProblemOpen(!problemOpen)}
              className="w-full p-2 flex items-center justify-between text-left font-bold text-zinc-300 text-xs hover:bg-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-400" />
                Problem Scope
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 transition-transform", problemOpen ? "rotate-180" : "")} />
            </button>
            {problemOpen && (
              <div className="p-2.5 pt-0 border-t border-zinc-800 text-zinc-400 text-[11px] leading-relaxed font-normal max-h-28 overflow-y-auto">
                {project.problem_statement || 'None provided.'}
              </div>
            )}
          </div>

          {/* Initial Idea Accordion */}
          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden shadow-2xs">
            <button
              onClick={() => setIdeaOpen(!ideaOpen)}
              className="w-full p-2 flex items-center justify-between text-left font-bold text-zinc-300 text-xs hover:bg-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Solution Idea
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 transition-transform", ideaOpen ? "rotate-180" : "")} />
            </button>
            {ideaOpen && (
              <div className="p-2.5 pt-0 border-t border-zinc-800 text-zinc-400 text-[11px] leading-relaxed font-normal max-h-28 overflow-y-auto">
                {project.initial_idea || 'None provided.'}
              </div>
            )}
          </div>

          {/* Indexed Docs Accordion */}
          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden shadow-2xs">
            <button
              onClick={() => setDocsOpen(!docsOpen)}
              className="w-full p-2 flex items-center justify-between text-left font-bold text-zinc-300 text-xs hover:bg-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                Docs ({documents.length})
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 transition-transform", docsOpen ? "rotate-180" : "")} />
            </button>
            {docsOpen && (
              <div className="p-2.5 pt-0 border-t border-zinc-800 space-y-1 max-h-24 overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic">No documents attached.</p>
                ) : (
                  documents.map((d) => (
                    <div key={d.id} className="flex items-center gap-1.5 text-[11px] text-zinc-300 truncate font-medium">
                      <FileText className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="truncate">{d.filename}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Area: Ruixen Moon Chat Component (Bounded Height) */}
      <div className="lg:col-span-3 h-full min-h-0 overflow-hidden">
        <RuixenMoonChat
          title="HackLens AI"
          subtitle="Ask questions about this hackathon, your project, requirements, evidence, and evaluation."
          projectName={project.name}
          domain={project.domain}
          score={project.overall_score}
          demoUrl={project.demo_url}
          messages={messages}
          onSendMessage={handleSend}
          isLoading={sending}
          onAttachFile={() => navigate(`/projects/${project.id}/documents`)}
        />
      </div>

    </div>
  );
}
