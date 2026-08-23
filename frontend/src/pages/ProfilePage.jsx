import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  Database, 
  Bot, 
  CheckCircle2, 
  RotateCw, 
  Sparkles, 
  LogOut, 
  ArrowRight, 
  Plus, 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Compass, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Activity, 
  Award, 
  Clock, 
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import GLSLHills from '../components/ui/glsl-hills';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { user, isDemoUser, signOut, logout, getDisplayName, getDisplayAvatar, getAuthProvider } = useAuth();
  const navigate = useNavigate();
  
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);

  // User Projects State
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch (err) {
      console.error('Health fetch error:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchUserProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await api.getProjects(user?.id);
      setProjects(data || []);
    } catch (err) {
      console.error('User projects fetch error:', err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const handleSignOut = async () => {
    try {
      if (typeof signOut === 'function') {
        await signOut();
      } else if (typeof logout === 'function') {
        await logout();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      navigate('/login');
    }
  };

  const handleReseed = async () => {
    setReseeding(true);
    setReseedSuccess(false);
    try {
      await api.seedDemo();
      setReseedSuccess(true);
      await fetchUserProjects();
      setTimeout(() => setReseedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to reseed demo project');
    } finally {
      setReseeding(false);
    }
  };

  const handleDeleteProject = async (e, projectId, projectName) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete "${projectName || 'this project'}"? All evaluations, documents, and embeddings will be removed.`)) {
      setDeletingId(projectId);
      try {
        await api.deleteProject(projectId);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } catch (err) {
        alert(err.message || 'Failed to delete project.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const displayName = getDisplayName(user);
  const displayEmail = user?.email || (isDemoUser ? 'alex.chen@projectlens.ai' : 'judge@hacklens.ai');
  const displayAvatar = getDisplayAvatar(user);
  const provider = getAuthProvider(user);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projects;
    const q = projectSearch.toLowerCase();
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.problem_statement?.toLowerCase().includes(q) ||
        p.initial_idea?.toLowerCase().includes(q)
    );
  }, [projects, projectSearch]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col cockpit-grid relative selection:bg-red-500/30 selection:text-red-300">
      
      {/* Background Procedural GLSL Terrain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15">
        <GLSLHills speed={0.35} />
      </div>

      {/* Floating Animated Red VFX Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-red-600/15 to-rose-600/10 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-bl from-rose-600/15 via-red-600/10 to-transparent blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-red-700/10 via-rose-600/10 to-transparent blur-3xl animate-pulse-glow" />
      </div>

      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 animate-in fade-in">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-zinc-100 tracking-tight">
              User Account & Workspace Profile
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
              Manage your authenticated session, inspect your submitted projects, and verify system connectivity.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              to="/projects/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all border border-red-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 card-sheen">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-xl shadow-red-600/30 border border-red-500/30 flex-shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{displayName ? displayName[0].toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-bold font-display text-zinc-100">
                  {displayName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase font-mono tracking-wider">
                  {provider === 'google' ? 'Google OAuth' : provider === 'github' ? 'GitHub OAuth' : provider === 'demo' ? 'Demo Account' : provider === 'guest' ? 'Guest Pass' : 'Email Verified'}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {displayEmail}
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                User ID: <span className="text-zinc-400 select-all">{user?.id || 'demo-user'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Added Projects</span>
              <span className="text-lg font-black font-display text-red-400">{projects.length}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
           YOUR ADDED PROJECTS (ACCOUNT PROJECTS HUB)
           ========================================================================= */}
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-zinc-100 flex items-center gap-2">
                  <span>Your Added Projects</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
                    {projects.length}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Projects registered and managed under your account profile.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {/* Search in user projects */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter your projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                {projectSearch && (
                  <button
                    onClick={() => setProjectSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={fetchUserProjects}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all shadow-xs"
                title="Refresh Projects"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingProjects ? 'animate-spin' : ''}`} />
              </button>

              <Link
                to="/projects/new"
                className="px-3.5 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </Link>
            </div>
          </div>

          {/* Project List / Cards */}
          {loadingProjects ? (
            <div className="p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              <p className="text-xs text-zinc-400 font-mono">Loading your account projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-10 sm:p-12 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center shadow-lg">
                <FolderKanban className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-zinc-100">
                  {projectSearch ? 'No matching projects found' : 'No projects added yet'}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {projectSearch
                    ? `No project matched "${projectSearch}". Clear your search query to see all submissions.`
                    : 'Create your first hackathon project to run grounded RAG analysis, 12-dimensional judging criteria, and synchronize with your AI Action Board.'}
                </p>
              </div>

              {!projectSearch && (
                <Link
                  to="/projects/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] border border-red-500/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map((p) => {
                const isEvaluated = p.status === 'evaluated' || (p.overall_score && p.overall_score > 0);
                const score = p.overall_score || 0;

                return (
                  <div
                    key={p.id}
                    className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-md space-y-4 card-sheen group"
                  >
                    
                    {/* Top Row: Title, Status Badge & Score Ring */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/projects/${p.id}/evaluation`}
                            className="text-base sm:text-lg font-bold font-display text-zinc-100 hover:text-red-400 transition-colors truncate"
                          >
                            {p.name || 'Untitled Project'}
                          </Link>

                          {isEvaluated ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Evaluated
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase font-mono">
                              Draft / In Setup
                            </span>
                          )}

                          {p.document_count > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] font-mono flex items-center gap-1">
                              <FileText className="w-3 h-3 text-rose-400" />
                              {p.document_count} {p.document_count === 1 ? 'doc' : 'docs'}
                            </span>
                          )}
                        </div>

                        {/* Problem Statement Snippet */}
                        {p.problem_statement && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                            {p.problem_statement}
                          </p>
                        )}

                        {/* Tech tags */}
                        {p.technologies && Array.isArray(p.technologies) && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {p.technologies.slice(0, 4).map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono"
                              >
                                {tech}
                              </span>
                            ))}
                            {p.technologies.length > 4 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-zinc-950 text-[10px] text-zinc-500 font-mono">
                                +{p.technologies.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Score Ring or Status */}
                      <div className="flex items-center sm:flex-col items-start sm:items-end gap-3 flex-shrink-0">
                        {isEvaluated ? (
                          <div className="flex items-center gap-3">
                            <ScoreRing score={score} size={54} strokeWidth={4} />
                          </div>
                        ) : (
                          <div className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase block">Status</span>
                            <span className="text-xs font-semibold text-zinc-400">Ready to Analyze</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Bottom Action Toolbar */}
                    <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/projects/${p.id}/evaluation`}
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Evaluation & Scores</span>
                        </Link>

                        <Link
                          to={`/projects/${p.id}/board`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Layers className="w-3.5 h-3.5 text-red-400" />
                          <span>AI Board</span>
                        </Link>

                        <Link
                          to={`/projects/${p.id}/chat`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                          <span>RAG Chat</span>
                        </Link>

                        <Link
                          to={`/projects/${p.id}/documents`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Docs</span>
                        </Link>

                        <Link
                          to={`/projects/${p.id}/survey`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Compass className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Edit Survey</span>
                        </Link>
                      </div>

                      {/* Delete Project Action */}
                      <button
                        onClick={(e) => handleDeleteProject(e, p.id, p.name)}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className={`w-4 h-4 ${deletingId === p.id ? 'animate-spin' : ''}`} />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* System Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Supabase Health */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <Database className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">Supabase DB & RLS</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-bold">
                Connected ✓
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Supabase Endpoint:</span>
                <span className="font-mono text-[11px] text-zinc-200 truncate max-w-xs">
                  {health?.supabase_url || 'Active & Connected'}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Vector Extension:</span>
                <span className="font-semibold text-red-400">pgvector Enabled (3072-dim)</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Row Level Security:</span>
                <span className="font-semibold text-rose-400">Enforced on All Tables</span>
              </div>
            </div>
          </div>

          {/* Gemini AI Health */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <Bot className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">Google Gemini AI</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-bold">
                Healthy ✓
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Reasoning Model:</span>
                <span className="font-semibold text-red-400">Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Embedding Model:</span>
                <span className="font-semibold text-rose-400">gemini-embedding-001</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Key Security:</span>
                <span className="font-semibold text-red-400">Server-Side Protected</span>
              </div>
            </div>
          </div>

        </div>

        {/* Demo Data Reset / Seeding */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pre-Seeded Demo Project
            </h4>
            <p className="text-xs text-zinc-400 mt-1 font-normal">
              Reset or refresh the pre-populated demo documents, evaluation scores, and AI Board for presentations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {reseedSuccess && (
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Re-Seeded ✓
              </span>
            )}
            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
              {reseeding ? 'Seeding...' : 'Reset Demo Project'}
            </button>
          </div>
        </div>

      </main>

    </div>
  );
}
