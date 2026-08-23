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
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const categoryConfig = {
  problem_clarity: {
    icon: Compass,
    label: 'Problem Clarity',
    domain: 'Problem Scope',
    domainColor: 'text-red-400 bg-red-950/40 border-red-500/30',
    desc: 'Clarity of the declared problem domain, target audience, and pain point precision.'
  },
  problem_importance: {
    icon: Flame,
    label: 'Problem Importance',
    domain: 'Impact Vector',
    domainColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    desc: 'Significance, societal scale, and commercial/operational urgency of the problem.'
  },
  solution_quality: {
    icon: Sparkles,
    label: 'Solution Quality',
    domain: 'Product Design',
    domainColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    desc: 'Depth of solution capability, workflow alignment, and user journey ergonomics.'
  },
  innovation: {
    icon: Sparkles,
    label: 'Innovation & Differentiation',
    domain: 'Product Design',
    domainColor: 'text-red-400 bg-red-950/40 border-red-500/30',
    desc: 'Uniqueness compared to existing solutions and novel AI/technical leverage.'
  },
  technical_feasibility: {
    icon: Cpu,
    label: 'Technical Feasibility',
    domain: 'Engineering',
    domainColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    desc: 'Practicality of codebase architecture, API stability, and technology stack execution.'
  },
  user_value: {
    icon: Users,
    label: 'User Value & Impact',
    domain: 'Impact Vector',
    domainColor: 'text-red-400 bg-red-950/40 border-red-500/30',
    desc: 'Tangible utility and quantifiable outcome improvements delivered to end users.'
  },
  requirements_completeness: {
    icon: FileCheck,
    label: 'Requirement Completeness',
    domain: 'Problem Scope',
    domainColor: 'text-zinc-300 bg-zinc-800 border-zinc-700',
    desc: 'Coverage across mandatory hackathon guidelines, functional specs, and constraints.'
  },
  scalability: {
    icon: TrendingUp,
    label: 'Scalability & Performance',
    domain: 'Engineering',
    domainColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    desc: 'System throughput under concurrency, low-latency responsiveness, and load tolerance.'
  },
  security: {
    icon: ShieldCheck,
    label: 'Security & Privacy',
    domain: 'Governance',
    domainColor: 'text-red-400 bg-red-950/40 border-red-500/30',
    desc: 'Data isolation, access controls, tenant isolation, and prompt injection defense.'
  },
  rag_quality: {
    icon: Database,
    label: 'RAG Architecture & Citations',
    domain: 'AI & Knowledge',
    domainColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    desc: 'Chunking fidelity, vector embedding indexing accuracy, and verified citations.'
  },
  implementation_feasibility: {
    icon: Layers,
    label: 'Implementation Feasibility',
    domain: 'Engineering',
    domainColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    desc: 'Feasibility of delivering full production milestones within given timeline.'
  },
  overall_project_strength: {
    icon: CheckCircle,
    label: 'Overall Project Strength',
    domain: 'Core Evaluation',
    domainColor: 'text-red-400 bg-red-950/40 border-red-500/30',
    desc: 'Composite project rating synthesized across all 12 dimensional axes.'
  },
};

export default function EvaluationCategoryCard({ categoryKey, score = 0, description = "" }) {
  const config = categoryConfig[categoryKey] || {
    icon: Layers,
    label: categoryKey.replace(/_/g, ' ').toUpperCase(),
    domain: 'General',
    domainColor: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    desc: description || 'Evaluated category dimension.'
  };

  const Icon = config.icon;
  const numScore = parseFloat(score) || 0;
  const percentage = Math.min(Math.max((numScore / 10) * 100, 0), 100);

  // Status tiers & color palettes (Red & Black)
  let statusBadge = { label: 'Strong', badgeClass: 'bg-red-950/40 text-red-400 border-red-500/30', barClass: 'from-red-600 to-rose-600', strokeClass: 'text-red-500' };

  if (numScore >= 9.0) {
    statusBadge = { label: 'Exemplary', badgeClass: 'bg-red-900/50 text-red-300 border-red-500/50 font-black', barClass: 'from-red-500 via-rose-500 to-amber-500', strokeClass: 'text-red-400' };
  } else if (numScore < 6.0) {
    statusBadge = { label: 'Needs Focus', badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700', barClass: 'from-zinc-700 to-zinc-600', strokeClass: 'text-zinc-500' };
  } else if (numScore < 8.0) {
    statusBadge = { label: 'Developing', badgeClass: 'bg-amber-950/40 text-amber-400 border-amber-500/30', barClass: 'from-amber-600 to-rose-600', strokeClass: 'text-amber-500' };
  }

  // Mini circular SVG gauge
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-600/10 hover:-translate-y-0.5 transition-all shadow-sm flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Ambient Glow on Hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-600/15 transition-colors" />

      <div>
        {/* Header: Domain Pill & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border", config.domainColor)}>
            {config.domain}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", statusBadge.badgeClass)}>
            {statusBadge.label}
          </span>
        </div>

        {/* Title & Circular Mini Gauge */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-zinc-800 group-hover:bg-red-600 group-hover:text-white transition-colors flex items-center justify-center text-red-400 flex-shrink-0 shadow-xs border border-zinc-700">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-red-400 transition-colors">
                {config.label}
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono font-medium block">
                Target: 8.0/10
              </span>
            </div>
          </div>

          {/* Circular Score Ring Micro-Chart */}
          <div className="relative flex items-center justify-center w-11 h-11 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                stroke="#27272a"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="transparent"
                className={cn("transition-all duration-1000 ease-out", statusBadge.strokeClass)}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs font-black font-display text-zinc-100">
                {numScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Linear Gradient Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-2.5 border border-zinc-700/60">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r", statusBadge.barClass)} 
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Short Dimension Description */}
        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-normal">
          {description || config.desc}
        </p>
      </div>

      {/* Card Footer: Percentile & Benchmark Delta */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[10px]">
        <span className="text-zinc-500 font-mono">
          Score: <strong className="text-zinc-300">{Math.round(percentage)}%</strong>
        </span>
        <span className={cn(
          "font-bold font-mono",
          numScore >= 8.0 ? "text-red-400" : "text-amber-400"
        )}>
          {numScore >= 8.0 ? `+${(numScore - 8.0).toFixed(1)} vs Bench` : `${(numScore - 8.0).toFixed(1)} vs Bench`}
        </span>
      </div>

    </div>
  );
}
