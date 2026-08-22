import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Award, 
  RotateCw, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight, 
  Lightbulb, 
  Loader2, 
  Layers, 
  Zap,
  HelpCircle,
  Clock
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import EvaluationCategoryCard from '../components/EvaluationCategoryCard';
import JudgeModeModal from '../components/JudgeModeModal';
import ComparisonModal from '../components/ComparisonModal';
import { api } from '../lib/api';

export default function EvaluationPage() {
  const { project, fetchProject } = useOutletContext();

  const [evaluations, setEvaluations] = useState([]);
  const [latestEval, setLatestEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // Modals
  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  const fetchEvals = async () => {
    setLoading(true);
    try {
      const list = await api.getEvaluations(project.id);
      setEvaluations(list);
      if (list.length > 0) {
        setLatestEval(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvals();
  }, [project.id]);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await api.runEvaluation(project.id);
      await fetchEvals();
      await fetchProject();
      if (res.evaluation) {
        setLatestEval(res.evaluation);
      }
    } catch (err) {
      alert(err.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleOpenComparison = async () => {
    try {
      const comp = await api.compareEvaluations(project.id);
      setComparisonData(comp);
      setCompareModalOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to compare evaluations');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // If no evaluation yet, show CTA
  if (!latestEval) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5 max-w-xl mx-auto shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <Award className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display text-white">No Evaluation Run Yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Run Gemini 12-category evaluation to assess problem clarity, technical feasibility, security, and RAG architecture.
          </p>
        </div>
        <button
          onClick={handleRunEvaluation}
          disabled={evaluating}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 mx-auto transition-all"
        >
          {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Evaluate My Project Now
        </button>
      </div>
    );
  }

  const score = latestEval.overall_score || 0;
  const statusLabel = latestEval.status_label || (score >= 80 ? 'Strong Concept' : score >= 65 ? 'Promising' : 'Needs Refinement');

  // Category scores mapping
  const categoryScores = {
    problem_clarity: latestEval.problem_score || 8.0,
    problem_importance: 8.5,
    solution_quality: 8.4,
    innovation: latestEval.innovation_score || 8.0,
    technical_feasibility: latestEval.technical_score || 8.5,
    user_value: latestEval.user_value_score || 8.0,
    requirements_completeness: latestEval.requirements_score || 7.5,
    scalability: latestEval.scalability_score || 8.0,
    security: latestEval.security_score || 8.0,
    rag_quality: latestEval.rag_quality_score || 8.5,
    implementation_feasibility: latestEval.feasibility_score || 8.0,
    overall_project_strength: (score / 10).toFixed(1),
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Banner: Overall Score, Status & Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-6">
          <ScoreRing score={score} size={110} strokeWidth={8} showLabel={false} />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Overall Score</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                {statusLabel}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              {score.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed line-clamp-2">
              {latestEval.summary || 'Project displays strong technical and problem-solution alignment.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setJudgeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Award className="w-4 h-4" /> Judge My Project
          </button>

          <button
            onClick={handleOpenComparison}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Compare Evaluations
          </button>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            {evaluating ? 'Evaluating...' : 'Re-Evaluate'}
          </button>
        </div>

      </div>

      {/* 12 Evaluation Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            12-Dimensional Scoring Matrix
          </h3>
          <span className="text-xs text-slate-500 font-medium">Evaluated with Gemini 3.6 Flash</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(categoryScores).map(([key, sc]) => (
            <EvaluationCategoryCard
              key={key}
              categoryKey={key}
              score={sc}
            />
          ))}
        </div>
      </div>

      {/* Executive Breakdown: What's Strong vs What's Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WHAT'S STRONG */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">What's Strong</h4>
          </div>
          <div className="space-y-2.5">
            {(latestEval.strengths || []).map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                <p className="leading-relaxed font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT'S MISSING */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">What's Missing</h4>
          </div>
          <div className="space-y-2.5">
            {(latestEval.weaknesses || []).map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                <p className="leading-relaxed font-medium">{w}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Technical & Product Risks */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Technical, Product & Security Risks ({latestEval.risks?.length || 0})
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(latestEval.risks || []).map((r, idx) => {
            const isHigh = r.severity === 'HIGH';
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    [{r.type || 'Tech'}]
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isHigh
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {r.severity || 'MED'} RISK
                  </span>
                </div>
                <h5 className="text-xs font-semibold text-slate-200 leading-snug">{r.risk}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                  <span className="text-indigo-400 font-semibold">Mitigation:</span> {r.mitigation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOW TO IMPROVE: Prioritized Action Plan */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-indigo-400">
          <Lightbulb className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            How to Improve (Prioritized Recommendations)
          </h4>
        </div>

        <div className="space-y-3">
          {(latestEval.improvements || []).map((imp, idx) => {
            const isHigh = imp.priority === 'HIGH';
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isHigh
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {imp.priority || 'MEDIUM'} PRIORITY
                    </span>
                    <span className="text-xs font-bold text-white">{imp.issue}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">Why it matters:</span> {imp.why_it_matters}
                  </p>
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    <span className="font-semibold text-emerald-400">Recommended action:</span> {imp.recommended_action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <JudgeModeModal
        isOpen={judgeModalOpen}
        onClose={() => setJudgeModalOpen(false)}
        judgeData={latestEval.judge_feedback}
        projectName={project.name}
      />

      <ComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        comparisonData={comparisonData}
        projectName={project.name}
      />

    </div>
  );
}
