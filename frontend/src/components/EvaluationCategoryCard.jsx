import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Database, 
  Compass, 
  Flame 
} from 'lucide-react';

const categoryIcons = {
  problem_clarity: Compass,
  problem_importance: Flame,
  solution_quality: Sparkles,
  innovation: Sparkles,
  technical_feasibility: Cpu,
  user_value: Users,
  requirements_completeness: FileCheck,
  scalability: TrendingUp,
  security: ShieldCheck,
  rag_quality: Database,
  implementation_feasibility: Layers,
  overall_project_strength: CheckCircle,
};

const categoryLabels = {
  problem_clarity: 'Problem Clarity',
  problem_importance: 'Problem Importance',
  solution_quality: 'Solution Quality',
  innovation: 'Innovation & Differentiation',
  technical_feasibility: 'Technical Feasibility',
  user_value: 'User Value & Impact',
  requirements_completeness: 'Requirement Completeness',
  scalability: 'Scalability & Performance',
  security: 'Security & Privacy',
  rag_quality: 'RAG Architecture & Citations',
  implementation_feasibility: 'Implementation Feasibility',
  overall_project_strength: 'Overall Project Strength',
};

export default function EvaluationCategoryCard({ categoryKey, score = 0, description = "" }) {
  const Icon = categoryIcons[categoryKey] || Layers;
  const label = categoryLabels[categoryKey] || categoryKey.replace(/_/g, ' ').toUpperCase();
  const numScore = parseFloat(score) || 0;
  const percentage = Math.min(Math.max((numScore / 10) * 100, 0), 100);

  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let barColor = 'bg-emerald-500';

  if (numScore < 6.0) {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    barColor = 'bg-rose-500';
  } else if (numScore < 8.0) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-200 truncate">{label}</h4>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold font-display ${badgeColor}`}>
          {numScore.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">/ 10</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
