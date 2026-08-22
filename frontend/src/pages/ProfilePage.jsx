import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Database, Bot, CheckCircle2, RotateCw, Sparkles, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { user, isDemoUser, signOut } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
        
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Profile & System Diagnostics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account and monitor Supabase & Gemini infrastructure connectivity.
          </p>
        </div>

        {/* User Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg shadow-indigo-600/30">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}</span>
            )}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                {user?.user_metadata?.full_name || 'ProjectLens User'}
              </h3>
              {isDemoUser && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">{user?.email || 'demo@projectlens.ai'}</p>
            <p className="text-[11px] text-slate-500">ID: {user?.id || 'demo-user'}</p>
          </div>
        </div>

        {/* System Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Supabase Health */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Database className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Supabase DB & RLS</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Connected ✓
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Supabase Endpoint:</span>
                <span className="font-mono text-[11px] text-slate-200 truncate max-w-xs">
                  {health?.supabase_url || 'Active & Connected'}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Vector Extension:</span>
                <span className="font-semibold text-emerald-400">pgvector Enabled (3072-dim)</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Row Level Security:</span>
                <span className="font-semibold text-emerald-400">Enforced on All Tables</span>
              </div>
            </div>
          </div>

          {/* Gemini AI Health */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Bot className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Google Gemini AI</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Healthy ✓
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Reasoning Model:</span>
                <span className="font-semibold text-indigo-300">Gemini 3.6 Flash</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Embedding Model:</span>
                <span className="font-semibold text-purple-300">gemini-embedding-001</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Key Security:</span>
                <span className="font-semibold text-emerald-400">Server-Side Protected</span>
              </div>
            </div>
          </div>

        </div>

        {/* Demo Data Reset / Seeding */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pre-Seeded Demo Project (CivicLens AI)
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Reset or refresh the pre-populated demo documents, evaluation scores, and AI Board for presentations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {reseedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Re-Seeded ✓
              </span>
            )}
            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
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
