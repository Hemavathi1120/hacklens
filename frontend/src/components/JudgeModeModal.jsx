import React from 'react';
import { Award, X, HelpCircle, AlertTriangle, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';

export default function JudgeModeModal({ isOpen, onClose, judgeData, projectName }) {
  if (!isOpen || !judgeData) return null;

  const judgeScore = judgeData.judge_score || 85;
  const questions = judgeData.potential_questions || [];
  const criticisms = judgeData.potential_criticisms || [];
  const tips = judgeData.presentation_tips || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Hackathon / Venture Judge Mode
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-1">
                AI Judge Critique: <span className="text-indigo-400">{projectName}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verdict Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Judge Verdict</span>
            <p className="text-sm font-medium text-slate-100 mt-0.5 leading-relaxed">
              "{judgeData.verdict || 'A high-potential concept with strong architectural merit.'}"
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black font-display text-amber-400">{judgeScore}/100</div>
            <span className="text-[10px] text-slate-400 font-medium">Judge Score</span>
          </div>
        </div>

        {/* Potential Judge Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <HelpCircle className="w-4 h-4" />
            <span>Tough Questions Judges Will Ask You</span>
          </div>
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  Q{idx + 1}
                </span>
                <p className="leading-relaxed font-medium">{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Criticisms */}
        {criticisms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Potential Criticisms & Gaps to Prepare For</span>
            </div>
            <div className="space-y-2">
              {criticisms.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
                  <p className="leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitch Tips */}
        {tips.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Lightbulb className="w-4 h-4" />
              <span>Hackathon Presentation & Demo Tips</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tips.map((tip, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Close Critique
          </button>
        </div>

      </div>
    </div>
  );
}
