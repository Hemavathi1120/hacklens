import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, FileText, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ProjectsListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getProjects(user?.id || 'demo-user')
      .then((data) => setProjects(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">All Projects</h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse, evaluate, and manage your AI projects and knowledge bases.
            </p>
          </div>

          <Link
            to="/projects/new"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <p className="text-xs text-slate-400">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => {
              const isDemo = project.id.includes('demo');
              const score = project.overall_score || 0;

              return (
                <div
                  key={project.id}
                  className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-5 shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase">
                        {isDemo ? 'Demo Project' : project.status || 'Draft'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-display text-white group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {project.description || project.problem_statement || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 items-center">
                    <ScoreRing score={score} size={58} strokeWidth={5} showLabel={false} />
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{project.document_count || 0} Docs</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Today'}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/projects/${project.id}/evaluation`}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
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
