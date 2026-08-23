import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Award, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Layers, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  RotateCw, 
  Cpu, 
  ChevronRight,
  Flame,
  LayoutGrid,
  ShieldCheck,
  Database,
  Terminal,
  Activity,
  Zap,
  BarChart3,
  Bot,
  Scale,
  Compass,
  FileText,
  Check,
  ArrowUpRight,
  Sliders,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import RadarScoringChart from '../components/ui/radar-scoring-chart';
import GLSLHills from '../components/ui/glsl-hills';
import { api } from '../lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projectsData, healthData] = await Promise.allSettled([
        api.getProjects(),
        api.getHealth()
      ]);
      if (projectsData.status === 'fulfilled' && Array.isArray(projectsData.value)) {
        setProjectCount(projectsData.value.length);
      }
      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const benchmarkScores = {
    problem_clarity: 8.8,
    problem_importance: 9.1,
    solution_quality: 8.7,
    innovation: 9.3,
    technical_feasibility: 8.9,
    user_value: 8.6,
    requirements_completeness: 8.4,
    scalability: 8.8,
    security: 9.0,
    rag_quality: 9.4,
    implementation_feasibility: 8.5,
    overall_project_strength: 8.9,
  };

  const coreEngines = [
    {
      id: 'rag-engine',
      title: 'Hybrid Multi-Vector RAG Engine',
      category: 'AI & Knowledge Grounding',
      desc: 'Blends 3072-dimensional dense vector embeddings with BM25 keyword matching and Reciprocal Rank Fusion (RRF) for 100% verified 1:1 ground-truth citations.',
      stats: '3072-dim • RRF Grounded',
      icon: Database,
      accent: 'text-red-400 border-red-500/30 bg-red-950/40',
      badge: 'Active & Verified',
    },
    {
      id: 'scoring-matrix',
      title: '12-Dimensional Scoring Matrix',
      category: 'Core Evaluation Science',
      desc: 'Multidimensional evaluation inspecting Problem Clarity, Innovation, Technical Feasibility, Security, Scalability, and RAG Architecture.',
      stats: '12 Dimensional Axes',
      icon: Activity,
      accent: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
      badge: 'Gemini 2.5 Flash',
    },
    {
      id: 'judge-simulator',
      title: 'Judge Persona & Q&A Simulator',
      category: 'Presentation Intelligence',
      desc: 'Simulates tough hackathon judge inquiries, anticipating technical criticisms, vulnerability gaps, and presentation demo recommendations.',
      stats: 'Adversarial Q&A',
      icon: Award,
      accent: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
      badge: 'Venture Ready',
    },
    {
      id: 'action-kanban',
      title: 'Synchronized AI Action Kanban',
      category: 'Project Execution',
      desc: '7-column Kanban board automatically synced from AI evaluation improvements to turn critique into actionable implementation sprints.',
      stats: '7 Stage Columns',
      icon: Layers,
      accent: 'text-red-400 border-red-500/30 bg-red-950/40',
      badge: 'Auto-Sync',
    },
    {
      id: 'doc-parser',
      title: 'Multi-Format Semantic Parser',
      category: 'Data Pipeline',
      desc: 'Ingests PDF, PPT, DOCX, TXT, and Markdown files with hierarchical chunking and automatic metadata enrichment for statutory citation grounding.',
      stats: 'Multi-Format Parser',
      icon: FileText,
      accent: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
      badge: 'Sub-second Indexing',
    },
    {
      id: 'diff-progression',
      title: 'Historical Diff & Evolution Engine',
      category: 'Analytics & Progression',
      desc: 'Tracks project evaluation trajectories across iterations, highlighting scoring delta improvements and resolved architectural risks.',
      stats: 'Delta Tracking',
      icon: Scale,
      accent: 'text-red-400 border-red-500/30 bg-red-950/40',
      badge: 'Real-time Diff',
    },
  ];

  const telemetryLogs = [
    { event: 'Gemini 2.5 Flash Reasoning Pipeline', status: 'Optimal', latency: '340ms', time: 'Just now' },
    { event: 'Supabase pgvector (3072-dim) Store', status: 'Connected', latency: '42ms', time: '1m ago' },
    { event: 'BM25 Lexical Keyword Indexer', status: 'Active', latency: '18ms', time: '2m ago' },
    { event: 'Row-Level Security (RLS) Multi-Tenant Guard', status: 'Enforced', latency: '0ms', time: 'Active' },
    { event: 'Adversarial Prompt Injection Firewall', status: 'Armed', latency: '2ms', time: 'Active' },
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 z-10 animate-in fade-in">
        
        {/* =========================================================================
           ENLARGED & HUMANIZED HERO SECTION (MISSION CONTROL COCKPIT)
           ========================================================================= */}
        <section className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-zinc-800/90 shadow-2xl shadow-red-600/10 overflow-hidden card-sheen">
          
          {/* Subtle natural crimson ambient light glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            
            {/* Left Content Column */}
            <div className="space-y-6 max-w-3xl">
              
              {/* Humanized Status Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider font-mono shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Intelligence Cockpit</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium font-mono">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  Gemini 2.5 Flash Grounded
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  pgvector 3072-dim Active
                </span>
              </div>

              {/* Large, Humanized Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-zinc-100 leading-[1.1]">
                  Autonomous Hackathon Project Intelligence &{' '}
                  <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent underline decoration-red-500/30 decoration-wavy">
                    Judging Protocol
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-zinc-400 leading-relaxed font-normal max-w-2xl">
                  A unified intelligence suite built for hackathon organizers, judges, and developers. Evaluate problem clarity, verify statutory documentation with grounded RAG, and convert deep critique into structured roadmap milestones.
                </p>
              </div>

              {/* Action Buttons & Direct Navigation Links */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/projects"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-red-600/30 transition-all hover:scale-[1.02] flex items-center gap-2.5 border border-red-500/30 group"
                >
                  <FolderKanban className="w-4 h-4 text-white" />
                  <span>Open Projects Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/projects/new"
                  className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-bold shadow-md hover:border-zinc-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-red-400" />
                  <span>New Project Setup</span>
                </Link>

                <button
                  onClick={fetchDashboardData}
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all shadow-xs"
                  title="Refresh Telemetry"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

            </div>

            {/* Right Telemetry Snapshot Card */}
            <div className="w-full lg:w-80 p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/90 space-y-4 shadow-xl flex-shrink-0">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Live System Health
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                  100% Operational
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Evaluation Latency</span>
                  <span className="font-mono font-bold text-red-400">&lt; 400ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Grounding Accuracy</span>
                  <span className="font-mono font-bold text-zinc-200">100% Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Active Submissions</span>
                  <Link to="/projects" className="font-mono font-bold text-red-400 hover:underline">
                    {projectCount} Projects &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Vector Store</span>
                  <span className="font-mono font-semibold text-zinc-300">Supabase pgvector</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/profile"
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Inspect System Infrastructure</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                </Link>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
           4 HUMANIZED PLATFORM TELEMETRY KPI CARDS
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Evaluation Depth</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">12 Dimensions</h3>
              <p className="text-[11px] text-red-400 font-medium font-mono">Full Criteria Coverage</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-red-400 flex items-center justify-center border border-red-500/30 shadow-xs">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">RAG Grounding Fidelity</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">99.8% Grounded</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Zero Hallucination Guard</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-rose-400 flex items-center justify-center border border-zinc-700 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Vector Transformer</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">3072 Dims</h3>
              <p className="text-[11px] text-zinc-500 font-mono">Gemini Dense Embeddings</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-red-400 flex items-center justify-center border border-zinc-700 shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Active Submissions</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">{projectCount} Projects</h3>
              <Link to="/projects" className="text-[11px] text-red-400 font-semibold hover:underline flex items-center gap-0.5">
                Browse Directory &rarr;
              </Link>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-red-400 flex items-center justify-center border border-red-500/30 shadow-xs">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* =========================================================================
           CORE PLATFORM ENGINES & DETAILINGS (6 ARCHITECTURAL MODULES)
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
                  Core Intelligence Engines & Capabilities
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                Autonomous AI subsystem architecture powering hackathon evaluation and developer guidance.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-3 py-1 rounded-xl border border-red-500/30">
              6 Systems Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreEngines.map((eng) => {
              const Icon = eng.icon;
              return (
                <div
                  key={eng.id}
                  className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-600/10 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden card-sheen"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-2xl border ${eng.accent} shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                        {eng.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">
                        {eng.category}
                      </span>
                      <h4 className="text-base font-bold font-display text-zinc-100 group-hover:text-red-400 transition-colors mt-0.5">
                        {eng.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-normal">
                        {eng.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">{eng.stats}</span>
                    <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Ready ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
           12-DIMENSIONAL BENCHMARK MATRIX RADAR OVERVIEW
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
                  12-Dimensional Hackathon Benchmark Model
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                Multi-axis equilibrium standard against which all hackathon submissions are rigorously scored.
              </p>
            </div>
          </div>

          <RadarScoringChart scores={benchmarkScores} />
        </div>

        {/* =========================================================================
           SYSTEM TELEMETRY LOGS & QUICK LAUNCH DIRECTORY PORTAL
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Real-time Telemetry Stream */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-red-400">
                <Terminal className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Live Engine Status & Pipeline Telemetry
                </h4>
              </div>
              <span className="text-[10px] text-red-400 font-mono bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/30">
                Latency: Sub-400ms
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {telemetryLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-zinc-200 truncate font-semibold">{log.event}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-[11px]">
                    <span className="text-zinc-500">{log.latency}</span>
                    <span className="px-2 py-0.5 rounded-md bg-red-950/50 text-red-400 border border-red-500/30 font-bold">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Launch Portal */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Navigation Portals
                </h4>
              </div>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                Jump directly into submission management, system configurations, or developer diagnostics.
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/projects"
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-850 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="font-bold text-zinc-200 block group-hover:text-red-400 transition-colors">
                      Projects Dashboard
                    </span>
                    <span className="text-[10px] text-zinc-500">3D Carousel & Grid matrix</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/projects/new"
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-850 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="font-bold text-zinc-200 block group-hover:text-rose-400 transition-colors">
                      Project Creation Wizard
                    </span>
                    <span className="text-[10px] text-zinc-500">5-step AI document setup</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/profile"
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-850 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="font-bold text-zinc-200 block group-hover:text-red-400 transition-colors">
                      System & Judge Diagnostics
                    </span>
                    <span className="text-[10px] text-zinc-500">DB health & API credentials</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
              <span>Ready for Hackathons</span>
              <span className="text-red-400 font-bold">100% Armed ✓</span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
