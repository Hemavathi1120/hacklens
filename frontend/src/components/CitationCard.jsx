import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark, CheckCircle2, Hash } from 'lucide-react';

export default function CitationCard({ citation, index }) {
  const [expanded, setExpanded] = useState(false);

  // Compute a match score badge if available
  const simScore = citation.similarity_score ? Math.round(citation.similarity_score * 100) : null;
  const rrfScore = citation.rrf_score ? citation.rrf_score.toFixed(4) : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden text-left transition-all hover:border-indigo-500/50 shadow-sm">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-slate-900/60 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold border border-indigo-500/30 shadow-inner">
            #{citation.source_id || index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{citation.filename}</span>
              </p>
              {simScore && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {simScore}% Match
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Page {citation.page_number} {citation.section_title ? `• Section: ${citation.section_title}` : ''}
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all flex-shrink-0 ml-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
            <span className="flex items-center gap-1 text-indigo-300 font-medium">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              Verified Chunk Context
            </span>
            {rrfScore && (
              <span className="font-mono text-[10px] text-slate-500">
                RRF Score: {rrfScore}
              </span>
            )}
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed select-text">
            "{citation.snippet}"
          </div>
        </div>
      )}
    </div>
  );
}
