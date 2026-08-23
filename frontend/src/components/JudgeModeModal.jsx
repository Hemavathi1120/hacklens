import React from 'react';
import { Award, X, HelpCircle, AlertTriangle, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';

export default function JudgeModeModal({ isOpen, onClose, judgeData, projectName }) {
  if (!isOpen || !judgeData) return null;

  const judgeScore = judgeData.judge_score || 85;
  const questions = judgeData.potential_questions || [];
  const criticisms = judgeData.potential_criticisms || [];
  const tips = judgeData.presentation_tips || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/25 border border-red-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-500/30">
                  Hackathon / Venture Judge Mode
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-zinc-100 mt-1">
                AI Judge Critique: <span className="text-red-400">{projectName}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verdict Banner */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">Judge Verdict</span>
            <p className="text-sm font-semibold text-zinc-200 mt-0.5 leading-relaxed">
              "{judgeData.verdict || 'A high-potential concept with strong architectural merit.'}"
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black font-display text-red-400">{judgeScore}<span className="text-xs text-red-300 font-normal">/100</span></div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Judge Score</span>
          </div>
        </div>

        {/* Potential Judge Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
            <HelpCircle className="w-4 h-4" />
            <span>Tough Questions Judges Will Ask You</span>
          </div>
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 flex items-start gap-2.5 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-red-500/30">
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
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>Potential Criticisms & Gaps to Prepare For</span>
            </div>
            <div className="space-y-2">
              {criticisms.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p className="leading-relaxed font-medium">{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitch Tips */}
        {tips.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
              <Lightbulb className="w-4 h-4" />
              <span>Hackathon Presentation & Demo Tips</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tips.map((tip, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all border border-red-500/30"
          >
            Close Critique
          </button>
        </div>

      </div>
    </div>
  );
}
