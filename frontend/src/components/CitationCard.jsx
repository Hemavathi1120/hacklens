import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark, CheckCircle2, Hash } from 'lucide-react';

export default function CitationCard({ citation, index }) {
  const [expanded, setExpanded] = useState(false);

  // Compute a match score badge if available
  const simScore = citation.similarity_score ? Math.round(citation.similarity_score * 100) : null;
  const rrfScore = citation.rrf_score ? citation.rrf_score.toFixed(4) : null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden text-left transition-all hover:border-red-500/50 shadow-sm">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-red-950/50 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold border border-red-500/30 shadow-inner">
            #{citation.source_id || index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-zinc-100 truncate flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="truncate">{citation.filename}</span>
              </p>
              {simScore && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950/40 text-red-400 border border-red-500/30 font-semibold">
                  {simScore}% Match
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-normal">
              Page {citation.page_number} {citation.section_title ? `• Section: ${citation.section_title}` : ''}
            </p>
          </div>
        </div>

        <button className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-all flex-shrink-0 ml-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/90 text-xs text-zinc-300 leading-relaxed space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans">
            <span className="flex items-center gap-1 text-red-400 font-medium">
              <Bookmark className="w-3.5 h-3.5 text-red-400" />
              Verified Chunk Context
            </span>
            {rrfScore && (
              <span className="font-mono text-[10px] text-zinc-500">
                RRF Score: {rrfScore}
              </span>
            )}
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-[11px] leading-relaxed select-text">
            "{citation.snippet}"
          </div>
        </div>
      )}
    </div>
  );
}
