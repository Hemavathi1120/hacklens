import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Lightbulb, 
  Cpu, 
  Layout, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Zap,
  TrendingUp
} from 'lucide-react';
import { api } from '../lib/api';

export default function SuggestionsPage() {
  const { project } = useOutletContext();
  const [evaluation, setEvaluation] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    api.getEvaluations(project.id).then((evals) => {
      if (evals && evals.length > 0) {
        setEvaluation(evals[0]);
      }
    });
  }, [project.id]);

  const defaultSuggestions = [
    {
      category: 'Technical Architecture',
      title: 'Automated Deprecation & Effective-Date Filtering',
      why_it_matters: 'Prevents serving obsolete policy versions or superseded statutory circulars to end users.',
      suggested_implementation: 'Add publication_date and effective_until metadata to document chunks; implement pre-filtering query clauses in Supabase pgvector RPC.',
      priority: 'HIGH',
      difficulty: 'Moderate',
      icon: Cpu,
    },
    {
      category: 'User Experience',
      title: 'Multi-Lingual Citizen Guidance Synthesis',
      why_it_matters: 'Expands accessibility to non-native speakers and minority demographic populations.',
      suggested_implementation: 'Utilize Gemini dynamic localization in RAG response generation to output answers in target language while citing original statutes.',
      priority: 'MEDIUM',
      difficulty: 'Easy',
      icon: Layout,
    },
    {
      category: 'Missing Feature',
      title: 'Human Caseworker Escalation Protocol',
      why_it_matters: 'Ensures complex, ambiguous, or high-liability disputes are routed to certified public case workers.',
      suggested_implementation: 'Detect confidence thresholds < 0.65 and render an immediate "Connect to Municipal Case Worker" action card with pre-filled context.',
      priority: 'HIGH',
      difficulty: 'Moderate',
      icon: Zap,
    },
    {
      category: 'Innovation Opportunity',
      title: 'Interactive Statutory Flowchart Generation',
      why_it_matters: 'Visual decision trees simplify dense bureaucratic procedures for ordinary citizens.',
      suggested_implementation: 'Generate Mermaid.js or SVG eligibility trees dynamically based on citizen survey answers.',
      priority: 'MEDIUM',
      difficulty: 'Moderate',
      icon: Sparkles,
    },
    {
      category: 'Hackathon Pitch',
      title: 'Lead Pitch with Real Citizen Impact Story',
      why_it_matters: 'Judges remember quantifiable human stories over purely abstract technical diagrams.',
      suggested_implementation: 'Showcase a 30-second before/after: citizen navigating 45-page welfare PDF vs instant 3-second cited guidance via CivicLens.',
      priority: 'HIGH',
      difficulty: 'Easy',
      icon: Award,
    },
  ];

  const categories = [
    'ALL',
    'Technical Architecture',
    'User Experience',
    'Missing Feature',
    'Innovation Opportunity',
    'Hackathon Pitch',
  ];

  const filteredSuggestions = defaultSuggestions.filter(
    (s) => activeCategory === 'ALL' || s.category === activeCategory
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Project Suggestions & Growth Vectors
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Curated improvements, technical recommendations, UX enhancements, and hackathon presentation tips.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Suggestions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuggestions.map((sug, idx) => {
          const Icon = sug.icon;
          const isHigh = sug.priority === 'HIGH';

          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                    {sug.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isHigh
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {sug.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {sug.difficulty}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{sug.title}</h4>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Why It Matters:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{sug.why_it_matters}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">Suggested Implementation:</span>
                    <p className="text-emerald-200 mt-0.5 leading-relaxed font-mono text-[11px]">{sug.suggested_implementation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
