import React from 'react';
import { TrendingUp, X, CheckCircle2, ArrowRight, Sparkles, Scale } from 'lucide-react';

export default function ComparisonModal({ isOpen, onClose, comparisonData, projectName }) {
  if (!isOpen || !comparisonData) return null;

  const currentScore = comparisonData.current_score || 0;
  const prevScore = comparisonData.previous_score || 0;
  const delta = comparisonData.delta_score || 0;
  const isImproved = delta >= 0;
  const changes = comparisonData.dimension_changes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/25 border border-red-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 font-mono">
                Evaluation Diff Engine
              </span>
              <h3 className="text-lg font-bold font-display text-zinc-100 mt-1">
                Progression Diff: <span className="text-red-400">{projectName}</span>
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

        {/* Score Progression Delta Bar */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shadow-xs">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Previous Evaluation</span>
            <div className="text-xl font-bold font-display text-zinc-400">{prevScore.toFixed(1)} / 100</div>
          </div>

          <div className="flex flex-col items-center">
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
              isImproved 
                ? 'bg-red-950/40 text-red-400 border-red-500/30' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {isImproved ? `+${delta.toFixed(1)} PTS` : `${delta.toFixed(1)} PTS`}
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-500 mt-1" />
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[10px] font-bold text-red-400 uppercase font-mono">Current Evaluation</span>
            <div className="text-xl font-black font-display text-zinc-100">{currentScore.toFixed(1)} / 100</div>
          </div>
        </div>

        {/* Dimension Level Changes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Dimension Progression
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {changes.map((item, idx) => {
              const diff = item.delta || 0;
              const hasGrown = diff >= 0;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs shadow-2xs"
                >
                  <span className="font-semibold text-zinc-300 capitalize">{item.dimension.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-zinc-500">{item.old_score || 0}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span className="font-bold text-zinc-100">{item.new_score || 0}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hasGrown ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {hasGrown ? `+${diff}` : `${diff}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all border border-red-500/30"
          >
            Close Progression View
          </button>
        </div>

      </div>
    </div>
  );
}
