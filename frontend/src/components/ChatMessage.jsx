import React from 'react';
import { Bot, User, FileText, CheckCircle, Sparkles } from 'lucide-react';
import CitationCard from './CitationCard';

export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';
  const citations = message.citations || [];

  // Parse simple markdown-like elements for beautiful styling
  const formatContent = (text) => {
    if (!text) return null;
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, i) => {
      // Check for headings
      if (para.startsWith('**ANSWER**') || para.startsWith('### ANSWER') || para.startsWith('ANSWER')) {
        const body = para.replace(/^(\*\*ANSWER\*\*|### ANSWER|ANSWER):?/, '').trim();
        return (
          <div key={i} className="mb-4">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              Answer
            </span>
            <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
          </div>
        );
      }

      if (para.includes('KEY OBSERVATIONS') || para.includes('**KEY OBSERVATIONS**')) {
        const lines = para.split('\n').filter(l => !l.includes('KEY OBSERVATIONS'));
        return (
          <div key={i} className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              Key Observations
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="leading-relaxed">
                  {line.replace(/^[•\-\*]\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (para.includes('RECOMMENDATION') || para.includes('**RECOMMENDATION**') || para.includes('RECOMMENDATIONS')) {
        const body = para.replace(/^(\*\*RECOMMENDATION(S)?\*\*|RECOMMENDATION(S)?):?/, '').trim();
        return (
          <div key={i} className="mb-4 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
              Recommendations
            </span>
            <p className="text-emerald-100 text-xs leading-relaxed whitespace-pre-wrap">{body}</p>
          </div>
        );
      }

      // Default paragraph
      return (
        <p key={i} className="text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {para}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'} mb-6 group`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-500/20 mt-1">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${isAssistant ? 'text-left' : 'text-right'}`}>
        <div
          className={`inline-block p-4 rounded-2xl ${
            isAssistant
              ? 'glass-card border-slate-800 text-slate-100'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 rounded-tr-sm'
          }`}
        >
          {isAssistant ? (
            formatContent(message.content)
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Citations section if assistant message */}
          {isAssistant && citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verified Source Documents ({citations.length}):</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {citations.map((cite, idx) => (
                  <CitationCard key={idx} citation={cite} index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
