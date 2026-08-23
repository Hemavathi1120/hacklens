import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

export default function AiHelperModal({ 
  isOpen, 
  onClose, 
  mode = 'problem', // 'problem' or 'idea'
  initialText = '', 
  problemContext = '', 
  onApply 
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'problem') {
        const res = await api.improveProblem(initialText);
        setResult(res);
      } else {
        const res = await api.improveIdea(initialText, problemContext);
        setResult(res);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'AI assistant error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      if (mode === 'problem') {
        onApply(result.improved_statement);
      } else {
        onApply(result.improved_idea, result.suggested_technologies);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-900 border border-red-500/40 shadow-2xl p-6 sm:p-7 space-y-5 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-zinc-100">
                {mode === 'problem' ? 'Gemini Problem Refinement' : 'Gemini Idea Architect'}
              </h3>
              <p className="text-xs text-zinc-400 font-normal">
                {mode === 'problem' 
                  ? 'Clarify pain points, affected stakeholders & quantifiable urgency' 
                  : 'Synthesize solution pillars, tech stack & unique differentiators'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Review */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Your Draft:</span>
          <p className="text-zinc-300 mt-1 italic font-normal">"{initialText || 'No text provided yet.'}"</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Result Preview */}
        {result && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-red-500/30 space-y-3 animate-in fade-in">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider font-mono">
                Refined {mode === 'problem' ? 'Problem Statement' : 'Solution Idea'}:
              </span>
              <p className="text-xs text-zinc-100 font-medium mt-1 leading-relaxed">
                {mode === 'problem' ? result.improved_statement : result.improved_idea}
              </p>
            </div>

            {mode === 'problem' && result.pain_points && (
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase font-mono">Key Pain Points:</span>
                <ul className="mt-1 space-y-1 text-xs text-zinc-300 list-disc list-inside font-normal">
                  {result.pain_points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {mode === 'idea' && result.solution_pillars && (
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase font-mono">Core Solution Pillars:</span>
                <ul className="mt-1 space-y-1 text-xs text-zinc-300 list-disc list-inside font-normal">
                  {result.solution_pillars.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {!result ? (
            <button
              onClick={handleGenerate}
              disabled={loading || !initialText.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all border border-red-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gemini is refining your {mode}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Improvements
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Regenerate
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all border border-red-500/30"
              >
                <Check className="w-4 h-4" />
                Apply to Survey
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
