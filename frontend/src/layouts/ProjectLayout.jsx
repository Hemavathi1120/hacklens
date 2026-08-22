import React, { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  FileText, 
  Bot, 
  Award, 
  Kanban, 
  Lightbulb, 
  Activity, 
  ArrowLeft, 
  RotateCw, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import { api } from '../lib/api';

export default function ProjectLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchProject = async () => {
    try {
      const data = await api.getProject(id);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleReevaluate = async () => {
    setEvaluating(true);
    try {
      await api.runEvaluation(id);
      await fetchProject();
      navigate(`/projects/${id}/evaluation`);
    } catch (err) {
      alert(err.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const navItems = [
    { label: 'Evaluation & Diffs', path: `/projects/${id}/evaluation`, icon: Award },
    { label: 'AI Board', path: `/projects/${id}/board`, icon: Kanban },
    { label: 'Project Assistant (RAG)', path: `/projects/${id}/chat`, icon: Bot },
    { label: 'Documentation', path: `/projects/${id}/documents`, icon: FileText },
    { label: 'Survey / Context', path: `/projects/${id}/survey`, icon: Compass },
    { label: 'Suggestions', path: `/projects/${id}/suggestions`, icon: Lightbulb },
    { label: 'RAG Diagnostics', path: `/projects/${id}/rag-dashboard`, icon: Activity },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <h3 className="text-lg font-bold text-white">Project Not Found</h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar activeProject={project} />

      {/* Project Subheader Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Breadcrumb & Project Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Project</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {project.status || 'Draft'}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-white mt-0.5">
                {project.name}
              </h2>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-200">
                  Score: <span className="text-emerald-400 font-display">{Math.round(project.overall_score || 0)}/100</span>
                </div>
                <div className="text-[10px] text-slate-500">{project.document_count || 0} Indexed Documents</div>
              </div>
            </div>

            <button
              onClick={handleReevaluate}
              disabled={evaluating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              {evaluating ? 'Analyzing...' : 'Re-Evaluate'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet context={{ project, fetchProject }} />
      </main>

    </div>
  );
}
