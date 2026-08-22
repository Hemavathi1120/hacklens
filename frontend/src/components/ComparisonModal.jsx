import React from 'react';
import { X, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

export default function ComparisonModal({ isOpen, onClose, comparisonData, projectName }) {
  if (!isOpen || !comparisonData) return null;

  const { target_eval, base_eval, overall_delta, category_deltas } = comparisonData;

  const targetScore = target_eval?.overall_score || 86;
  const baseScore = base_eval?.overall_score || (targetScore - (overall_delta || 14));
  const delta = overall_delta !== undefined ? overall_delta : 14;

  const categoryNames = {
    problem_clarity: 'Problem Clarity',
    innovation: 'Innovation',
    technical_feasibility: 'Technical Feasibility',
    user_value: 'User Value',
    requirements_completeness: 'Requirements',
    scalability: 'Scalability',
    security: 'Security',
    rag_quality: 'RAG Quality',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Evaluation Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Tracking iterative improvements for <span className="text-indigo-400">{projectName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Comparison Hero Cards */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center items-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium uppercase">Before</span>
            <div className="text-2xl font-bold font-display text-slate-400 mt-1">
              {Math.round(baseScore)} <span className="text-xs text-slate-600">/ 100</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
              <ArrowUpRight className="w-4 h-4" />
              +{delta} pts
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Overall Delta</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
            <span className="text-[11px] text-indigo-400 font-medium uppercase">After Improvements</span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
              {Math.round(targetScore)} <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* Category Delta Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Category Breakdown Changes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(category_deltas || {}).map(([key, val]) => {
              const numVal = parseFloat(val) || 0;
              const isPositive = numVal >= 0;
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-slate-300">
                    {categoryNames[key] || key.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-bold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isPositive ? `+${numVal}` : numVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-all"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
}
