import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Award, 
  CheckCircle2, 
  Compass,
  Zap,
  TrendingUp,
  Globe,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CardFanCarousel({ projects = [], className = '' }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCard = useCallback(() => {
    if (projects.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);

  const prevCard = useCallback(() => {
    if (projects.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  // Keyboard navigation (ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard]);

  if (!projects || projects.length === 0) return null;

  return (
    <div className={cn("relative w-full overflow-hidden py-12 select-none", className)}>
      
      {/* 3D Stage Fan Arc Container */}
      <div 
        className="relative mx-auto w-full max-w-5xl flex items-center justify-center"
        style={{ height: '440px', perspective: '1400px' }}
      >
        {projects.map((project, index) => {
          // Calculate offset relative to active card
          let offset = index - activeIndex;
          if (offset > projects.length / 2) offset -= projects.length;
          if (offset < -projects.length / 2) offset += projects.length;

          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 3; // Render center + 3 on each side

          if (!isVisible) return null;

          // Compute 3D transformation values
          const translateX = offset * 210;
          const translateY = Math.abs(offset) * 16;
          const rotateZ = offset * 4.5;
          const rotateY = offset * -6;
          const scale = isCenter ? 1 : Math.max(0.78, 1 - Math.abs(offset) * 0.08);
          const zIndex = 50 - Math.abs(offset) * 5;
          const opacity = isCenter ? 1 : Math.max(0.4, 0.9 - Math.abs(offset) * 0.18);

          const score = project.overall_score || 0;
          const status = project.status || 'Draft';
          const isHigh = score >= 80;

          return (
            <div
              key={project.id || index}
              onClick={() => {
                if (isCenter) {
                  navigate(`/projects/${project.id}/evaluation`);
                } else {
                  setActiveIndex(index);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${isCenter ? 100 : -Math.abs(offset) * 80}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                zIndex,
                opacity,
                transition: 'all 0.55s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className={cn(
                "absolute cursor-pointer rounded-3xl p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl border transition-all duration-300",
                "aspect-[16/9] w-[90%] max-w-[620px]",
                isCenter
                  ? "bg-zinc-900/95 border-red-500/50 shadow-2xl shadow-red-600/20 ring-2 ring-red-500/20 text-zinc-100"
                  : "bg-zinc-950/85 border-zinc-800/90 hover:border-zinc-700 text-zinc-300 shadow-md"
              )}
            >
              
              {/* CARD TOP HEADER: Domain, Status Pill & Score */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider font-mono truncate bg-red-950/40 text-red-400 border border-red-500/25">
                    {project.domain || 'General Tech'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {status}
                  </span>
                  {project.demo_url && (
                    <a
                      href={project.demo_url.startsWith('http') ? project.demo_url : `https://${project.demo_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-red-300 border border-zinc-700/80 flex items-center gap-1 transition-colors z-20"
                      title="Open Deployed Live Demo"
                    >
                      <Globe className="w-2.5 h-2.5 text-red-400" />
                      <span>Live</span>
                      <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                </div>

                {/* Score Chip with Red Gradient */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-inner flex-shrink-0">
                  <Award className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-black font-display text-zinc-100">
                    {Math.round(score)}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">/ 100</span>
                </div>
              </div>

              {/* CARD CENTER: Title & Problem Context */}
              <div className="space-y-2 my-auto">
                <h3 className="text-base sm:text-lg font-black font-display text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-normal">
                  {project.problem_statement || project.initial_idea || 'No detailed problem statement recorded yet for this hackathon submission.'}
                </p>
              </div>

              {/* CARD BOTTOM: 4 Scoring Dimension Meters & Action CTA */}
              <div className="pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                
                {/* 4 Mini Progress Indicators */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Clarity</span>
                    <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(score, 95)}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Tech</span>
                    <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(score * 0.95, 90)}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">RAG</span>
                    <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(score * 0.98, 88)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="flex items-center gap-1 text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors">
                  <span>{isCenter ? 'Inspect Full Evaluation' : 'Select'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Fan Carousel Controls & Pagination Dots */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={prevCard}
          aria-label="Previous project"
          className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 shadow-md transition-all hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dynamic Pagination Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {projects.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveIndex(dotIdx)}
              aria-label={`Go to project ${dotIdx + 1}`}
              className={cn(
                "rounded-full transition-all duration-300",
                dotIdx === activeIndex
                  ? "w-6 h-2 bg-gradient-to-r from-red-600 to-rose-600 shadow-xs"
                  : "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
              )}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          aria-label="Next project"
          className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 shadow-md transition-all hover:scale-105"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
