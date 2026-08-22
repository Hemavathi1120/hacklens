import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderKanban, 
  FileText, 
  Award, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  SlidersHorizontal,
  Trash2,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'score_high', 'score_low'

  const fetchProjects = async () => {
    if (!user?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await api.getProjects(user.id);
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Filter & Sort logic
  const filteredProjects = projects
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || (p.status || 'draft').toUpperCase() === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score_high') return (b.overall_score || 0) - (a.overall_score || 0);
      if (sortBy === 'score_low') return (a.overall_score || 0) - (b.overall_score || 0);
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Main Dashboard Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Your Project Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              Create, evaluate, and manage your private AI projects with grounded RAG insights.
            </p>
          </div>

          <div className="relative z-10">
            <Link
              to="/projects/new"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="EVALUATED">Evaluated</option>
              <option value="ANALYZING">Analyzing</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="recent">Recently Updated</option>
              <option value="score_high">Highest Score</option>
              <option value="score_low">Lowest Score</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No projects in your account</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm 
                ? 'No projects match your search query.' 
                : 'You have not added any projects yet. Create your first project to start evaluating!'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/25"
              >
                <Plus className="w-4 h-4" /> Create Your First Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isDemo = project.id.includes('demo');
              const score = project.overall_score || 0;

              return (
                <div
                  key={project.id}
                  className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all p-6 flex flex-col justify-between space-y-5 group shadow-lg hover:shadow-indigo-950/20"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {isDemo ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            Demo Project
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            {project.status || 'Draft'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold font-display text-white group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {project.description || project.problem_statement || 'No description provided.'}
                    </p>
                  </div>

                  {/* Mid Stats: ScoreRing & Counts */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 items-center">
                    <div className="flex flex-col items-center justify-center">
                      <ScoreRing score={score} size={64} strokeWidth={5} showLabel={false} />
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">Evaluation</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{project.document_count || 0} Docs</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>
                          {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/projects/${project.id}/evaluation`}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    Open Project <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}
