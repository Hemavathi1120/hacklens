import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark } from 'lucide-react';

export default function CitationCard({ citation, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden text-left transition-all hover:border-indigo-500/40">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3 flex items-center justify-between cursor-pointer select-none bg-slate-900/60 hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-indigo-500/20">
            {citation.source_id || index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              {citation.filename}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              Page {citation.page_number} {citation.section_title ? `• ${citation.section_title}` : ''}
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-200 p-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 font-mono leading-relaxed">
          <p className="italic text-slate-400 mb-1 font-sans text-[11px] flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-indigo-400" /> Extracted Citation Context:
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60 text-slate-300">
            "{citation.snippet}"
          </div>
        </div>
      )}
    </div>
  );
}
