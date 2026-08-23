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
import GLSLHills from '../components/ui/glsl-hills';
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
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <h3 className="text-lg font-bold text-zinc-200">Project Not Found</h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

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

      <Navbar activeProject={project} />

      {/* Project Subheader Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Breadcrumb & Project Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Project</span>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/40 text-red-400 border border-red-500/30">
                  {project.status || 'Draft'}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-zinc-100 mt-0.5">
                {project.name}
              </h2>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs">
              <div className="text-right">
                <div className="text-xs font-bold text-zinc-300">
                  Score: <span className="text-red-400 font-display font-black">{Math.round(project.overall_score || 0)}/100</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">{project.document_count || 0} Indexed Documents</div>
              </div>
            </div>

            <button
              onClick={handleReevaluate}
              disabled={evaluating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all hover:scale-[1.02]"
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
                  `flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-red-500 text-red-400 bg-red-950/20'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
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
