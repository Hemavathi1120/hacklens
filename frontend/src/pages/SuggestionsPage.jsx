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
    <div className="space-y-8 animate-in fade-in text-zinc-100">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-display text-zinc-100 flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Project Suggestions & Growth Vectors
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Curated improvements, technical recommendations, UX enhancements, and hackathon presentation tips.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 border border-red-500/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shadow-xs'
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
              className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-600/10 transition-all space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 px-2.5 py-0.5 rounded-md border border-red-500/30 font-mono">
                    {sug.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isHigh
                          ? 'bg-red-950/50 text-red-400 border-red-500/40'
                          : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {sug.priority}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">
                      {sug.difficulty}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-zinc-100 leading-snug">{sug.title}</h4>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Why It Matters:</span>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed font-normal">{sug.why_it_matters}</p>
                  </div>
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-bold text-red-400 uppercase">Suggested Implementation:</span>
                    <p className="text-zinc-200 mt-0.5 leading-relaxed font-mono text-[11px] font-normal">{sug.suggested_implementation}</p>
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
