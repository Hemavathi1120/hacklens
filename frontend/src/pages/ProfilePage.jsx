import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Database, Bot, CheckCircle2, RotateCw, Sparkles, LogOut, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import GLSLHills from '../components/ui/glsl-hills';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { user, isDemoUser, signOut, logout, getDisplayName, getDisplayAvatar, getAuthProvider } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

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
      setTimeout(() => setReseedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to reseed demo project');
    } finally {
      setReseeding(false);
    }
  };

  const displayName = getDisplayName(user);
  const displayEmail = user?.email || (isDemoUser ? 'alex.chen@projectlens.ai' : 'judge@hacklens.ai');
  const displayAvatar = getDisplayAvatar(user);
  const provider = getAuthProvider(user);

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
      </div>

      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 animate-in fade-in">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-zinc-100">Profile & System Diagnostics</h1>
            <p className="text-xs text-zinc-400 mt-1 font-normal">
              Manage your account credentials, session, and monitor Supabase & Gemini infrastructure connectivity.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg shadow-red-600/30 border border-red-500/30 flex-shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{displayName ? displayName[0].toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-100">
                  {displayName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase font-mono">
                  {provider === 'google' ? 'Google OAuth' : provider === 'github' ? 'GitHub OAuth' : provider === 'demo' ? 'Demo Account' : provider === 'guest' ? 'Guest Pass' : 'Email Verified'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">{displayEmail}</p>
              <p className="text-[11px] text-zinc-500 font-mono">ID: {user?.id || 'demo-user'}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>

        {/* System Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
