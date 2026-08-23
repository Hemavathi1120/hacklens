"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue, useScroll } from "framer-motion";
import { Sparkles, Bot, FileText, Award, ShieldCheck, Zap, Kanban, Layers, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export interface MorphItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ElementType;
  score?: number;
  color?: string;
}

export interface ScrollMorphHeroProps {
  title?: string;
  subtitle?: string;
  items?: MorphItem[];
  defaultPhase?: AnimationPhase;
  interactivePhases?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const defaultItems: MorphItem[] = [
  { id: "1", label: "Problem Relevance", sublabel: "Grounded fit", icon: Sparkles, score: 92, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "2", label: "Statutory Citations", sublabel: "Zero hallucination", icon: FileText, score: 96, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "3", label: "RAG Vector Index", sublabel: "3072-dim embeddings", icon: Bot, score: 89, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { id: "4", label: "12-Category Scoring", sublabel: "Judge criteria", icon: Award, score: 87, color: "text-violet-600 bg-violet-50 border-violet-200" },
  { id: "5", label: "Security & RLS", sublabel: "Tenant isolation", icon: ShieldCheck, score: 94, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "6", label: "Interactive AI Board", sublabel: "7-column Kanban", icon: Kanban, score: 85, color: "text-amber-600 bg-amber-50 border-amber-200" },
];

export const ScrollMorphHero: React.FC<ScrollMorphHeroProps> = ({
  title = "Intelligent Hackathon Project Benchmarking",
  subtitle = "Dynamic visual morphing architecture aligning statutory requirements, evidence citations, and evaluation metrics in real time.",
  items = defaultItems,
  defaultPhase = "circle",
  interactivePhases = true,
  className = "",
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<AnimationPhase>(defaultPhase);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate coordinates for each animation phase
  const getCoordinates = (index: number, total: number, currentPhase: AnimationPhase) => {
    switch (currentPhase) {
      case "line": {
        const spacing = 140;
        const startX = -((total - 1) * spacing) / 2;
        return {
          x: startX + index * spacing,
          y: 220,
          scale: 0.95,
          rotate: 0,
          opacity: 1
        };
      }
      case "circle": {
        const radius = 240;
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * (radius * 0.65),
          scale: 1,
          rotate: (angle * 180) / Math.PI * 0.15,
          opacity: 1
        };
      }
      case "bottom-strip": {
        const spacing = 125;
        const startX = -((total - 1) * spacing) / 2;
        return {
          x: startX + index * spacing,
          y: 310,
          scale: 0.88,
          rotate: 0,
          opacity: 0.9
        };
      }
      case "scatter":
      default: {
        const angles = [45, 135, 210, 315, 90, 270];
        const distances = [280, 260, 290, 270, 240, 250];
        const rad = ((angles[index % angles.length] || 0) * Math.PI) / 180;
        const dist = distances[index % distances.length] || 250;
        return {
          x: Math.cos(rad) * dist,
          y: Math.sin(rad) * (dist * 0.7),
          scale: 0.9,
          rotate: (index % 2 === 0 ? 1 : -1) * 8,
          opacity: 0.85
        };
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full relative flex flex-col items-center justify-center py-16 px-4 overflow-hidden select-none", className)}
    >
      {/* Ambient Central Glow Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-violet-400/10 to-cyan-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Morph Animation Interactive Mode Toggles */}
      {interactivePhases && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/85 border border-slate-200 shadow-sm backdrop-blur-md mb-8 z-30">
          {(["circle", "line", "scatter", "bottom-strip"] as AnimationPhase[]).map((p) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all",
                phase === p
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {p.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {/* Main Central Content Area */}
      <div className="relative z-20 max-w-2xl text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Continuous Morphing Intelligence Nodes</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-display text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>

        <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl mx-auto">
          {subtitle}
        </p>

        {children}
      </div>

      {/* Morphing Nodes Orbiting Canvas */}
      <div className="relative w-full max-w-4xl h-[440px] flex items-center justify-center pointer-events-none">
        {items.map((item, index) => {
          const coords = getCoordinates(index, items.length, phase);
          const Icon = item.icon || Layers;

          return (
            <motion.div
              key={item.id}
              animate={{
                x: coords.x,
                y: coords.y,
                scale: coords.scale,
                rotate: coords.rotate,
                opacity: coords.opacity
              }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 18,
                mass: 0.9
              }}
              className="absolute pointer-events-auto"
            >
              <div
                className={cn(
                  "px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/90 shadow-lg backdrop-blur-xl flex items-center gap-2.5 hover:border-indigo-400 hover:scale-105 transition-all cursor-pointer group",
                  item.color
                )}
              >
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-xs border border-slate-100">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span className="text-[10px] text-slate-500 font-medium truncate block">
                      {item.sublabel}
                    </span>
                  )}
                </div>
                {item.score !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-800 ml-1">
                    {item.score}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollMorphHero;
