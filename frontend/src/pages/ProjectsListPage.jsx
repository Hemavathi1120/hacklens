import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  FileText, 
  ArrowRight, 
  ArrowUpRight,
  Clock, 
  Sparkles,
  Layers,
  LayoutGrid,
  Trash2,
  Award,
  TrendingUp,
  Flame,
  RotateCw,
  Filter,
  CreditCard,
  CheckCircle2,
  Compass,
  X,
  Globe,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import CardFanCarousel from '../components/ui/card-fan-carousel';
import GLSLHills from '../components/ui/glsl-hills';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function ProjectsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('fan'); // 'fan' | 'grid'

  const fetchProjects = () => {
    setLoading(true);
    api.getProjects(user?.id)
      .then((data) => setProjects(data || []))
      .catch((err) => {
        console.error(err);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
        (p.problem_statement && p.problem_statement.toLowerCase().includes(search.toLowerCase())) ||
        (p.domain && p.domain.toLowerCase().includes(search.toLowerCase()));

      const matchesDomain = selectedDomain === 'ALL' || (p.domain || 'General Tech') === selectedDomain;
      const matchesStatus = selectedStatus === 'ALL' || (p.status || 'draft').toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [projects, search, selectedDomain, selectedStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = projects.length;
    const evaluated = projects.filter(p => p.status === 'evaluated' || p.overall_score > 0).length;
    const avgScore = evaluated > 0 
      ? Math.round(projects.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / evaluated)
      : 0;
    const highScores = projects.filter(p => (p.overall_score || 0) >= 80).length;

    return { total, evaluated, avgScore, highScores };
  }, [projects]);

  const domains = [
    'ALL',
    'Agriculture / Agritech',
    'Healthcare & Life Sciences',
    'Fintech & Web3',
    'Civic & Public Tech',
    'Education & Learning',
    'General Tech'
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
           ENLARGED & HUMANIZED HERO BANNER (PROJECTS DIRECTORY & SUBMISSIONS HUB)
           ========================================================================= */}
        <section className="relative rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-zinc-800/90 shadow-2xl shadow-red-600/10 overflow-hidden card-sheen">
          
          {/* Subtle natural crimson ambient light glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono uppercase font-bold text-red-400">Submissions Directory • Real-time Benchmarks</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-display text-zinc-100 tracking-tight leading-[1.15]">
                Hackathon Projects & Submissions Hub
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                Explore, benchmark, and evaluate hackathon projects. Seamlessly rotate submissions in the interactive 3D Fan Carousel or inspect comprehensive criteria scores across the landscape grid.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 self-start lg:self-auto flex-shrink-0">
              <button
                onClick={fetchProjects}
                className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all shadow-xs"
                title="Refresh Projects List"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                to="/projects/new"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl shadow-red-600/30 transition-all hover:scale-[1.02] border border-red-500/30 group"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>

        </section>

        {/* =========================================================================
           4 HUMANIZED KPI STATS SUMMARY CARDS
           ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Total Submissions</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">{stats.total}</h3>
              <p className="text-[10px] text-zinc-500 font-mono">On-file submissions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-red-400 flex items-center justify-center border border-zinc-700 shadow-xs">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Evaluated</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">{stats.evaluated}</h3>
              <p className="text-[10px] text-red-400 font-semibold font-mono">{Math.round((stats.evaluated / (stats.total || 1)) * 100)}% analyzed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-red-400 flex items-center justify-center border border-red-500/30 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Avg Score</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">{stats.avgScore} <span className="text-xs font-normal text-zinc-500">/ 100</span></h3>
              <p className="text-[10px] text-zinc-500 font-mono">12-category baseline</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-rose-400 flex items-center justify-center border border-zinc-700 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex items-center justify-between card-sheen">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Strong Concepts</span>
              <h3 className="text-2xl font-black font-display text-zinc-100">{stats.highScores}</h3>
              <p className="text-[10px] text-red-400 font-semibold font-mono">&gt; 80+ Score Benchmark</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-red-400 flex items-center justify-center border border-red-500/30 shadow-xs">
              <Flame className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* =========================================================================
           TOOLBAR: SEARCH, DOMAIN PILLS & DUAL VIEW TOGGLE
           ========================================================================= */}
        <div className="space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs">
            
            {/* Search Input with Clear Button */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, problem, domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status & View Mode Toggle */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="evaluated">Evaluated</option>
                <option value="draft">Draft</option>
              </select>

              <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xs">
                <button
                  onClick={() => setViewMode('fan')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    viewMode === 'fan'
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                      : "text-zinc-400 hover:text-zinc-100"
                  )}
                  aria-label="Fan Carousel View"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Fan Showcase</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    viewMode === 'grid'
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                      : "text-zinc-400 hover:text-zinc-100"
                  )}
                  aria-label="Grid Matrix View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-mono",
                  selectedDomain === dom
                    ? "bg-red-950/50 text-red-400 border border-red-500/40 shadow-xs"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                {dom === 'ALL' ? 'All Domains' : dom}
              </button>
            ))}
          </div>

        </div>

        {/* =========================================================================
           PROJECTS SHOWCASE: 3D FAN CAROUSEL vs 16:9 LANDSCAPE GRID
           ========================================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/9] rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse shadow-xs" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/90 border border-dashed border-zinc-800 max-w-lg mx-auto shadow-sm space-y-3">
            <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-base font-bold text-zinc-200">No Projects Found</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-normal">
              No hackathon submissions matched your current search filters.
            </p>
          </div>
        ) : viewMode === 'fan' ? (
          /* --- 1. 3D FAN CAROUSEL SHOWCASE --- */
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Interactive Fan Arc Showcase
                </h3>
                <p className="text-xs text-zinc-500 font-normal">
                  Use arrow buttons or click side cards to rotate submissions into review focus.
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono font-medium">
                {filtered.length} Projects Loaded
              </span>
            </div>

            <CardFanCarousel 
              projects={filtered} 
              onDeleteProject={handleDeleteProject}
            />
          </div>
        ) : (
          /* --- 2. 16:9 LANDSCAPE GRID MATRIX --- */
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Submissions Matrix ({filtered.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, idx) => {
                const isDemo = project.id?.includes('demo');
                const score = project.overall_score || 0;
                const teamId = project.id?.slice(0, 8)?.toUpperCase() || `P#${idx + 1}`;

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 transition-all shadow-xs hover:shadow-xl hover:shadow-red-600/10 flex flex-col justify-between group aspect-[16/9] relative overflow-hidden card-sheen"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                          #{teamId}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono bg-red-950/40 text-red-400 border border-red-500/25 truncate">
                          {project.domain || 'General Tech'}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="my-auto">
                      <h3 className="text-base font-bold font-display text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {project.description || project.problem_statement || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Score</span>
                        <span className="font-black font-display text-red-400">{score > 0 ? `${Math.round(score)}/100` : 'Draft'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.demo_url && (
                          <a
                            href={project.demo_url.startsWith('http') ? project.demo_url : `https://${project.demo_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-red-300 text-xs font-bold flex items-center gap-1 transition-all border border-zinc-700/50 shadow-2xs"
                            title="Open Live Deployed Application"
                          >
                            <Globe className="w-3.5 h-3.5 text-red-400" />
                          </a>
                        )}

                        <Link
                          to={`/projects/${project.id}/evaluation`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-200 text-xs font-bold flex items-center gap-1 transition-all shadow-xs border border-zinc-700/60"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
