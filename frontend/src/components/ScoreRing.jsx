import React from 'react';

export default function ScoreRing({ score = 0, size = 64, strokeWidth = 5, showLabel = true }) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 90) return 'text-red-500 stroke-red-500';
    if (s >= 75) return 'text-rose-500 stroke-rose-500';
    if (s >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-zinc-500 stroke-zinc-500';
  };

  const getTextColor = (s) => {
    if (s >= 90) return 'text-red-400';
    if (s >= 75) return 'text-rose-400';
    if (s >= 50) return 'text-amber-400';
    return 'text-zinc-400';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track Circle */}
        <circle
          className="stroke-zinc-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground Animated Score Circle */}
        <circle
          className={`${getColor(normalizedScore)} transition-all duration-1000 ease-out`}
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
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-base font-black font-display ${getTextColor(normalizedScore)}`}>
            {Math.round(normalizedScore)}
          </span>
          <span className="text-[9px] uppercase font-bold text-zinc-500 -mt-1">/ 100</span>
        </div>
      )}
    </div>
  );
}
