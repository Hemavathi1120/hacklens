import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  LayoutGrid,
  Activity,
  BarChart3,
  Filter,
  CheckCircle,
  Flame
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import EvaluationCategoryCard from '../components/EvaluationCategoryCard';
import RadarScoringChart from '../components/ui/radar-scoring-chart';
import JudgeModeModal from '../components/JudgeModeModal';
import ComparisonModal from '../components/ComparisonModal';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function EvaluationPage() {
  const { project, fetchProject } = useOutletContext();

  const [evaluations, setEvaluations] = useState([]);
  const [latestEval, setLatestEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // View Mode & Domain Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'radar' | 'bars'
  const [selectedDomain, setSelectedDomain] = useState('ALL');

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
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  // If no evaluation yet, show CTA
  if (!latestEval) {
    return (
      <div className="p-12 text-center rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 max-w-xl mx-auto shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display text-zinc-100">No Evaluation Run Yet</h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-normal">
            Run Gemini 12-category evaluation to assess problem clarity, technical feasibility, security, and RAG architecture.
          </p>
        </div>
        <button
          onClick={handleRunEvaluation}
          disabled={evaluating}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/25 flex items-center gap-2 mx-auto transition-all hover:scale-[1.02]"
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

  const domainMapping = {
    problem_clarity: 'Problem Scope',
    problem_importance: 'Impact Vector',
    solution_quality: 'Product Design',
    innovation: 'Product Design',
    technical_feasibility: 'Engineering',
    user_value: 'Impact Vector',
    requirements_completeness: 'Problem Scope',
    scalability: 'Engineering',
    security: 'Governance',
    rag_quality: 'AI & Knowledge',
    implementation_feasibility: 'Engineering',
    overall_project_strength: 'Core Evaluation',
  };

  // Filtered categories
  const filteredCategories = Object.entries(categoryScores).filter(([key]) => {
    if (selectedDomain === 'ALL') return true;
    return domainMapping[key] === selectedDomain;
  });

  // Calculate tier distributions
  const scoresArray = Object.values(categoryScores).map(v => parseFloat(v) || 0);
  const exemplaryCount = scoresArray.filter(s => s >= 9.0).length;
  const strongCount = scoresArray.filter(s => s >= 8.0 && s < 9.0).length;
  const focusCount = scoresArray.filter(s => s < 8.0).length;

  return (
    <div className="space-y-8 animate-in fade-in text-zinc-100">
      
      {/* Top Banner: Overall Score, Status & Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-black to-zinc-950 border border-red-500/25 shadow-2xl shadow-red-600/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Luminous Glow Accent */}
        <div className="absolute top-0 right-1/4 w-80 h-40 bg-red-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex items-center gap-6">
          <ScoreRing score={score} size={110} strokeWidth={8} showLabel={false} />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Overall Score</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 text-xs font-bold shadow-xs">
                {statusLabel}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-100">
              {score.toFixed(1)} <span className="text-sm font-normal text-zinc-500">/ 100</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed line-clamp-2 font-normal">
              {latestEval.summary || 'Project displays strong technical and problem-solution alignment with grounded citations.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setJudgeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Award className="w-4 h-4 text-red-400" /> Judge My Project
          </button>

          <button
            onClick={handleOpenComparison}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs hover:border-zinc-700"
          >
            <TrendingUp className="w-4 h-4 text-rose-400" /> Compare Evaluations
          </button>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all hover:scale-[1.02] border border-red-500/30"
          >
            <RotateCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            {evaluating ? 'Evaluating...' : 'Re-Evaluate'}
          </button>
        </div>

      </div>

      {/* Score Tier KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">Exemplary Tier (9.0+)</span>
            <div className="text-xl font-black font-display text-zinc-100 mt-0.5">{exemplaryCount} Dimensions</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center border border-red-500/30 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">Strong Concept (8.0 - 8.9)</span>
            <div className="text-xl font-black font-display text-zinc-100 mt-0.5">{strongCount} Dimensions</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-800 text-rose-400 flex items-center justify-center border border-zinc-700 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">Opportunities (&lt;8.0)</span>
            <div className="text-xl font-black font-display text-zinc-100 mt-0.5">{focusCount} Dimensions</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-950/40 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
         12-DIMENSIONAL SCORING MATRIX WITH MULTI-CHART VIEW SWITCHER
         ========================================================================= */}
      <div className="space-y-4">
        
        {/* Matrix Header & Visual Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
                12-Dimensional Scoring Matrix
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comprehensive AI hackathon criteria benchmarking powered by Gemini 2.5 Flash.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 self-start sm:self-auto shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'grid'
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matrix Cards</span>
            </button>

            <button
              onClick={() => setViewMode('radar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'radar'
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Radar Chart</span>
            </button>

            <button
              onClick={() => setViewMode('bars')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'bars'
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Benchmark Bars</span>
            </button>
          </div>
        </div>

        {/* Domain Filter Pills */}
        {viewMode !== 'radar' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['ALL', 'Problem Scope', 'Product Design', 'Engineering', 'AI & Knowledge', 'Governance'].map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  selectedDomain === dom
                    ? "bg-red-950/50 text-red-400 border border-red-500/40 shadow-xs"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                )}
              >
                {dom === 'ALL' ? 'All Dimensions (12)' : dom}
              </button>
            ))}
          </div>
        )}

        {/* --- VIEW MODE 1: MATRIX CARDS --- */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map(([key, sc]) => (
              <EvaluationCategoryCard
                key={key}
                categoryKey={key}
                score={sc}
              />
            ))}
          </div>
        )}

        {/* --- VIEW MODE 2: RADAR SCORING CHART --- */}
        {viewMode === 'radar' && (
          <RadarScoringChart scores={categoryScores} />
        )}

        {/* --- VIEW MODE 3: HORIZONTAL BENCHMARK BARS --- */}
        {viewMode === 'bars' && (
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
              <span className="font-bold text-zinc-300 uppercase font-mono">Dimension</span>
              <div className="flex items-center gap-8 text-zinc-500 font-mono">
                <span>0.0</span>
                <span>5.0</span>
                <span className="text-red-400 font-bold">8.0 (Target)</span>
                <span>10.0</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredCategories.map(([key, sc]) => {
                const numVal = parseFloat(sc) || 0;
                const percentage = Math.min(Math.max((numVal / 10) * 100, 0), 100);
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const isExemplary = numVal >= 9.0;
                const isStrong = numVal >= 8.0;

                return (
                  <div key={key} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-200 group-hover:text-red-400 transition-colors">
                        {label}
                      </span>
                      <span className="font-black font-mono text-zinc-100">{numVal.toFixed(1)} / 10</span>
                    </div>
                    <div className="relative w-full h-3 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/60">
                      {/* Benchmark 8.0 line */}
                      <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-red-400/60 z-10" />
                      
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r",
                          isExemplary
                            ? "from-red-500 via-rose-500 to-amber-500"
                            : isStrong
                            ? "from-red-600 to-rose-600"
                            : "from-amber-600 to-rose-600"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
         EXECUTIVE BREAKDOWN: WHAT'S STRONG VS WHAT'S MISSING
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WHAT'S STRONG */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-red-400">
            <CheckCircle2 className="w-5 h-5 text-red-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">What's Strong</h4>
          </div>
          <div className="space-y-2.5">
            {(latestEval.strengths || []).map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 flex items-start gap-2.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT'S MISSING */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">What's Missing</h4>
          </div>
          <div className="space-y-2.5">
            {(latestEval.weaknesses || []).map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 flex items-start gap-2.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed font-medium">{w}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* =========================================================================
         TECHNICAL, PRODUCT & SECURITY RISKS
         ========================================================================= */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-red-400">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">
            Technical, Product & Security Risks ({latestEval.risks?.length || 0})
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(latestEval.risks || []).map((r, idx) => {
            const isHigh = r.severity === 'HIGH';
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    [{r.type || 'Tech'}]
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isHigh
                        ? 'bg-red-950/40 text-red-400 border-red-500/30'
                        : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {r.severity || 'MED'} RISK
                  </span>
                </div>
                <h5 className="text-xs font-bold text-zinc-200 leading-snug">{r.risk}</h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed pt-1.5 border-t border-zinc-800 font-normal">
                  <strong className="text-red-400 font-semibold">Mitigation:</strong> {r.mitigation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
         HOW TO IMPROVE: PRIORITIZED RECOMMENDATIONS
         ========================================================================= */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-red-400">
          <Lightbulb className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">
            How to Improve (Prioritized Recommendations)
          </h4>
        </div>

        <div className="space-y-3">
          {(latestEval.improvements || []).map((imp, idx) => {
            const isHigh = imp.priority === 'HIGH';
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-900 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isHigh
                          ? 'bg-red-950/40 text-red-400 border-red-500/30'
                          : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {imp.priority || 'MEDIUM'} PRIORITY
                    </span>
                    <span className="text-xs font-bold text-zinc-100">{imp.issue}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    <span className="font-semibold text-zinc-300">Why it matters:</span> {imp.why_it_matters}
                  </p>
                  <p className="text-xs text-red-300 leading-relaxed font-medium">
                    <span className="font-semibold text-red-400">Recommended action:</span> {imp.recommended_action}
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
