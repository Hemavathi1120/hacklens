import React, { useState } from 'react';
import { Sparkles, Award, ShieldCheck, Cpu, Database, Compass, Flame, Users, FileCheck, TrendingUp, Layers, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const DIMENSION_CONFIG = {
  problem_clarity: { label: 'Problem Clarity', shortLabel: 'Clarity', domain: 'Problem', color: '#ef4444' },
  problem_importance: { label: 'Problem Importance', shortLabel: 'Importance', domain: 'Problem', color: '#f97316' },
  solution_quality: { label: 'Solution Quality', shortLabel: 'Solution', domain: 'Product', color: '#f43f5e' },
  innovation: { label: 'Innovation & Differentiation', shortLabel: 'Innovation', domain: 'Product', color: '#e11d48' },
  technical_feasibility: { label: 'Technical Feasibility', shortLabel: 'Feasibility', domain: 'Tech', color: '#dc2626' },
  user_value: { label: 'User Value & Impact', shortLabel: 'Impact', domain: 'Product', color: '#fb7185' },
  requirements_completeness: { label: 'Requirement Completeness', shortLabel: 'Requirements', domain: 'Problem', color: '#a1a1aa' },
  scalability: { label: 'Scalability & Performance', shortLabel: 'Scalability', domain: 'Tech', color: '#f43f5e' },
  security: { label: 'Security & Privacy', shortLabel: 'Security', domain: 'Governance', color: '#dc2626' },
  rag_quality: { label: 'RAG Architecture & Citations', shortLabel: 'RAG Quality', domain: 'AI/RAG', color: '#ef4444' },
  implementation_feasibility: { label: 'Implementation Feasibility', shortLabel: 'Execution', domain: 'Tech', color: '#f59e0b' },
  overall_project_strength: { label: 'Overall Project Strength', shortLabel: 'Strength', domain: 'Core', color: '#ef4444' },
};

export function RadarScoringChart({ scores = {}, className = '' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const keys = Object.keys(DIMENSION_CONFIG);
  const totalPoints = keys.length;
  const size = 380;
  const center = size / 2;
  const maxRadius = 140;

  // Calculate polygon points
  const points = keys.map((key, index) => {
    const angle = (index / totalPoints) * 2 * Math.PI - Math.PI / 2;
    const rawScore = scores[key] !== undefined ? scores[key] : 8.0;
    const normalized = Math.min(Math.max(rawScore / 10, 0), 1);
    const radius = normalized * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    // Label coordinate (further out)
    const labelRadius = maxRadius + 32;
    const labelX = center + labelRadius * Math.cos(angle);
    const labelY = center + labelRadius * Math.sin(angle);

    return {
      key,
      config: DIMENSION_CONFIG[key],
      score: rawScore,
      x,
      y,
      labelX,
      labelY,
      angle
    };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  // Concentric guideline rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className={cn("flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-md", className)}>
      
      {/* SVG Radar Visualization */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <radialGradient id="redRadarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#e11d48" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0.08" />
            </radialGradient>
            <filter id="redRadarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#dc2626" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Web rings */}
          {rings.map((ringScale, idx) => (
            <polygon
              key={idx}
              points={keys.map((_, i) => {
                const a = (i / totalPoints) * 2 * Math.PI - Math.PI / 2;
                const r = ringScale * maxRadius;
                return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
              }).join(' ')}
              fill="none"
              stroke={idx === rings.length - 1 ? "#3f3f46" : "#27272a"}
              strokeWidth={idx === rings.length - 1 ? "1.5" : "1"}
              strokeDasharray={idx === rings.length - 1 ? "none" : "3,3"}
            />
          ))}

          {/* Axis spoke lines */}
          {keys.map((_, i) => {
            const a = (i / totalPoints) * 2 * Math.PI - Math.PI / 2;
            const x2 = center + maxRadius * Math.cos(a);
            const y2 = center + maxRadius * Math.sin(a);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#27272a"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled radar polygon */}
          <path
            d={polygonPath}
            fill="url(#redRadarGradient)"
            stroke="#ef4444"
            strokeWidth="2.5"
            filter="url(#redRadarGlow)"
            className="transition-all duration-700 ease-out"
          />

          {/* Points & Interactive Nodes */}
          {points.map((p) => {
            const isHovered = hoveredPoint === p.key;
            return (
              <g 
                key={p.key}
                onMouseEnter={() => setHoveredPoint(p.key)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Node Circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 4.5}
                  fill={isHovered ? "#ef4444" : "#18181b"}
                  stroke="#ef4444"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-300 shadow-sm"
                />

                {/* Outer label text */}
                <text
                  x={p.labelX}
                  y={p.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight={isHovered ? "bold" : "600"}
                  fill={isHovered ? "#ef4444" : "#a1a1aa"}
                  className="transition-colors"
                >
                  {p.config.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Side Legend & Dimension Inspector */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">
              Radar Balance Map
            </span>
            <h4 className="text-base font-black font-display text-zinc-100">
              12-Dimensional Equilibrium
            </h4>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold font-mono">
            Benchmark: 8.0+ Target
          </span>
        </div>

        {/* Dimension Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {points.map((p) => {
            const isHovered = hoveredPoint === p.key;
            const scoreVal = typeof p.score === 'number' ? p.score : parseFloat(p.score) || 0;
            const isExemplary = scoreVal >= 9.0;
            const isStrong = scoreVal >= 8.0;

            return (
              <div
                key={p.key}
                onMouseEnter={() => setHoveredPoint(p.key)}
                onMouseLeave={() => setHoveredPoint(null)}
                className={cn(
                  "p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-2xs",
                  isHovered
                    ? "bg-red-950/40 border-red-500 ring-2 ring-red-500/30 scale-[1.02]"
                    : "bg-zinc-950/70 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono truncate">
                    {p.config.domain}
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-black font-display",
                    isExemplary ? "bg-red-950 text-red-300 border border-red-500/40" : isStrong ? "bg-zinc-800 text-zinc-200" : "bg-amber-950/40 text-amber-400 border border-amber-500/30"
                  )}>
                    {scoreVal.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs font-bold text-zinc-200 truncate mt-1">
                  {p.config.shortLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>
            Hover over any dimension vertex on the radar chart to inspect specific category equilibrium and strengths.
          </span>
        </div>
      </div>

    </div>
  );
}

export default RadarScoringChart;
