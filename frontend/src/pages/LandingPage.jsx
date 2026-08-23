import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  Search, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Compass, 
  FileText, 
  MessageSquare,
  Flame,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import GLSLHills from '../components/ui/glsl-hills';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('clarity');

  const capabilities = [
    {
      title: '12-Category Evaluation Engine',
      description: 'Multidimensional evaluation across Problem Clarity, Solution Architecture, Security, and Feasibility.',
      icon: Award,
      color: 'from-red-600 to-rose-600',
    },
    {
      title: 'Grounded RAG Evidence',
      description: 'Verifies statutory documentation and citations with zero hallucination guarantee.',
      icon: Database,
      color: 'from-rose-600 to-amber-600',
    },
    {
      title: 'Automated AI Kanban Board',
      description: 'Generates structured tasks, architecture risks, and prioritized recommendations automatically.',
      icon: Layers,
      color: 'from-red-600 to-zinc-800',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Survey & Context', desc: 'Define your problem statement, target audience, and solution idea.', icon: Compass },
    { step: '02', title: 'Document Ingestion', desc: 'Upload statutory PDFs, PPTs, architecture diagrams, and guidelines.', icon: FileText },
    { step: '03', title: 'Gemini 2.5 Evaluation', desc: 'Synthesizes 12 scoring dimensions and identifies critical risks.', icon: Cpu },
    { step: '04', title: 'Interactive AI Board', desc: 'Actionable Kanban tasks generated directly from evaluation findings.', icon: Layers },
    { step: '05', title: 'Grounded Assistant', desc: 'Ask questions with verified citations from your uploaded evidence.', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col cockpit-grid relative selection:bg-red-500/30 selection:text-red-300">
      
      {/* Background Procedural GLSL Terrain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <GLSLHills speed={0.4} />
      </div>

      {/* Floating Animated Red VFX Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-red-600/20 to-rose-600/10 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-bl from-rose-600/20 via-red-600/15 to-transparent blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-red-700/15 via-rose-600/10 to-transparent blur-3xl animate-pulse-glow" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col z-10">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-8">
          
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/10 backdrop-blur-md animate-in fade-in zoom-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>AI-Powered Hackathon Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-zinc-400 font-mono">v2.5 Flash</span>
          </div>

          {/* Main Hero Headline with Red-Black Gradient */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight leading-[1.08] text-zinc-100">
              Evaluate, Verify & Polish Hackathon Projects with{' '}
              <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent underline decoration-red-500/30 decoration-wavy">
                Grounded AI
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
              HackLens analyzes hackathon submissions across 12 dimensions, verifies statutory evidence using RAG, and produces actionable Kanban roadmap milestones.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/projects"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2 group border border-red-500/30"
            >
              <span>Launch Hackathon Cockpit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm shadow-md transition-all hover:border-zinc-700 flex items-center justify-center gap-2"
            >
              <span>Explore Judge Showcase</span>
            </Link>
          </div>

          {/* Interactive Live Evaluation Simulator Preview */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/25">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Live Evaluation Preview</h4>
                    <p className="text-xs text-zinc-400 font-normal">AI-Powered Government Scheme Assistance for Farmers</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold">
                    Score: 88.5/100
                  </span>
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium">
                    Strong Concept
                  </span>
                </div>
              </div>

              {/* Dimension Score Grid Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {[
                  { name: 'Problem Clarity', score: '9.5/10', bar: 'w-[95%]', color: 'bg-red-500' },
                  { name: 'Technical Feasibility', score: '8.9/10', bar: 'w-[89%]', color: 'bg-rose-500' },
                  { name: 'RAG Architecture', score: '8.8/10', bar: 'w-[88%]', color: 'bg-red-400' },
                  { name: 'Requirement Coverage', score: '9.2/10', bar: 'w-[92%]', color: 'bg-rose-400' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold truncate">{item.name}</span>
                      <span className="font-bold font-mono text-zinc-200">{item.score}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} ${item.bar}`} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </section>

        {/* 5-STEP WORKFLOW CARDS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
              End-To-End Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-zinc-100">
              From Raw Idea to Evaluated Submission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-600/5 transition-all space-y-3 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-red-500 bg-red-950/40 px-2 py-0.5 rounded-md border border-red-500/20">
                      {step.step}
                    </span>
                    <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">{step.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 CORE CAPABILITY CARDS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 mb-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
              Key Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-zinc-100">
              Why Hackathons Run on HackLens
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-600/10 transition-all space-y-4 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cap.color} flex items-center justify-center text-white shadow-lg shadow-red-600/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100">{cap.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-black/85 py-8 px-4 text-center text-xs text-zinc-500 font-normal">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-zinc-400">HACKLENS.AI — Autonomous Hackathon Evaluation</span>
          <span>Powered by Google Gemini 2.5 Flash & Supabase pgvector</span>
        </div>
      </footer>

    </div>
  );
}
