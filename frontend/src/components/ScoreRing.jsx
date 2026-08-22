import React from 'react';

export default function ScoreRing({ score = 0, size = 120, strokeWidth = 8, showLabel = true, subtitle = "Overall Score" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = "text-indigo-500";
  let bgClass = "stroke-indigo-500/20";
  let textClass = "text-indigo-400";

  if (normalizedScore >= 80) {
    colorClass = "text-emerald-500";
    bgClass = "stroke-emerald-500/20";
    textClass = "text-emerald-400";
  } else if (normalizedScore >= 60) {
    colorClass = "text-amber-500";
    bgClass = "stroke-amber-500/20";
    textClass = "text-amber-400";
  } else {
    colorClass = "text-rose-500";
    bgClass = "stroke-rose-500/20";
    textClass = "text-rose-400";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            className={bgClass}
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground progress circle */}
          <circle
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-bold font-display ${textClass}`}>
            {Math.round(normalizedScore)}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-2 text-xs font-medium text-slate-300">{subtitle}</span>
      )}
    </div>
  );
}
