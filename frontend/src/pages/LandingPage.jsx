import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Bot, 
  FileText, 
  Award, 
  ShieldCheck, 
  Zap, 
  Compass,
  Cpu,
  Kanban
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function LandingPage() {
  const { signInAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleExploreDemo = async () => {
    signInAsDemo();
    try {
      await api.seedDemo();
    } catch (_) {}
    navigate('/projects/demo-civiclens-ai-001/evaluation');
  };

  const steps = [
    {
      num: '01',
      title: 'Define Your Problem',
      desc: 'Formulate your core problem and solution idea with interactive Gemini AI helpers.',
      icon: Compass,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400'
    },
    {
      num: '02',
      title: 'Upload Documentation',
      desc: 'Ingest multi-format files (PDF, PPT, PPTX, DOC, DOCX, TXT, MD) with automatic text extraction.',
      icon: FileText,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400'
    },
    {
      num: '03',
      title: 'Let AI Understand Context',
      desc: '3072-dimensional Gemini embeddings build a private, grounded RAG knowledge base.',
      icon: Bot,
      color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400'
    },
    {
      num: '04',
      title: 'Get 12-Category Evaluation',
      desc: 'Comprehensive scoring, risk matrices, missing requirements, and hackathon judge critiques.',
      icon: Award,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400'
    },
    {
      num: '05',
      title: 'Build Your AI Board',
      desc: 'Interactive 7-column Kanban board syncing insights, risks, improvements, and next steps.',
      icon: Kanban,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400'
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-[#090d16]/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white">
              PROJECTLENS<span className="text-indigo-400 ml-1">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExploreDemo}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all"
            >
              Explore Demo Project
            </button>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Enterprise-Grade AI Project Evaluation & RAG Assistant
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
            Build Better Projects <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              With Grounded AI Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload your project documentation, ask evidence-grounded questions, discover critical weaknesses, and turn your idea into a stronger, hackathon-ready solution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4" /> Start Your Project Free
            </Link>
            <button
              onClick={handleExploreDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Explore Live Demo (CivicLens AI) <ArrowRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Grounded Citations (No Hallucination)
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 12 Scoring Dimensions
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Supabase RLS Security
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-950/60 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              How ProjectLens AI Powers Your Idea
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              From raw concept to rigorous evaluation and structured execution in 5 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-black font-display text-slate-600 group-hover:text-indigo-400 transition-colors">
                        {step.num}
                      </span>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mb-1.5">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Everything You Need for Flawless Project Execution
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Format RAG Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingest PDF, DOCX, PPTX, and Markdown. Extract page-level sections and query your knowledge base with zero hallucination.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">12-Category AI Evaluation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive rigorous scoring across Problem Clarity, Innovation, Feasibility, Security, Scalability, and RAG Architecture.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">7-Column Interactive AI Board</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically generate Kanban action cards from evaluation weaknesses, risks, and next steps with drag/drop control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <p>© 2026 PROJECTLENS AI. Powered by Google Gemini & Supabase.</p>
      </footer>

    </div>
  );
}
