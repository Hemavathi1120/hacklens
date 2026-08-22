import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Layers,
  Code2,
  BookOpen
} from 'lucide-react';
import CitationCard from './CitationCard';

export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';
  const citations = message.citations || [];
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse inline markdown formatting (bold, italic, code tags, links)
  const renderInline = (text) => {
    if (!text) return text;
    const parts = [];
    let keyIdx = 0;
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={keyIdx++}>{text.substring(lastIndex, match.index)}</span>);
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-indigo-200">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-300">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-slate-800/90 text-violet-300 text-xs font-mono border border-slate-700/50">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={keyIdx++}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  // Component for Code Blocks with Copy button
  const CodeBlock = ({ language, code }) => {
    const [codeCopied, setCodeCopied] = useState(false);
    const copyCode = () => {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
      <div className="my-3 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono uppercase font-semibold text-indigo-400">
            <Code2 className="w-3.5 h-3.5" />
            {language || 'code'}
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-all text-[11px]"
          >
            {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {codeCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  const formatContent = (text) => {
    if (!text) return null;

    // Split text by markdown code blocks first
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const segments = [];
    let lastIdx = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ type: 'text', content: text.substring(lastIdx, match.index) });
      }
      segments.push({ type: 'code', language: match[1] || 'text', code: match[2].trim() });
      lastIdx = codeBlockRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      segments.push({ type: 'text', content: text.substring(lastIdx) });
    }

    return segments.map((seg, sIdx) => {
      if (seg.type === 'code') {
        return <CodeBlock key={`code-${sIdx}`} language={seg.language} code={seg.code} />;
      }

      const paragraphs = seg.content.split('\n\n');

      return paragraphs.map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // 1. Scope Boundary Notice / Guardrail Warning
        if (trimmed.includes('Scope Boundary Notice') || trimmed.includes('Guardrail Notice')) {
          const bodyLines = trimmed.split('\n').filter(l => !l.includes('Scope Boundary Notice') && !l.includes('Guardrail Notice'));
          return (
            <div key={`scope-${i}`} className="my-3 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/20 to-slate-900 border border-rose-500/30 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-rose-300 font-bold text-xs uppercase tracking-wider">
                  Scope & Grounding Boundary Notice
                </span>
              </div>
              <div className="space-y-2 text-xs text-rose-100/90 leading-relaxed">
                {bodyLines.map((line, lIdx) => (
                  <p key={lIdx} className={line.startsWith('•') || line.startsWith('-') ? 'pl-2 text-slate-200' : ''}>
                    {renderInline(line)}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // 2. Project Assistant Header / Greeting
        if (trimmed.startsWith('### **Project Assistant') || trimmed.startsWith('### Project Assistant') || trimmed.startsWith('### **ProjectLens AI Assistant')) {
          const body = trimmed.replace(/^###\s*(\*\*Project.*?Assistant.*?\*\*|Project.*?Assistant.*?)\n*/i, '').trim();
          return (
            <div key={`greeting-${i}`} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Grounded Project Assistant
                </span>
              </div>
              {body && <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{renderInline(body)}</div>}
            </div>
          );
        }

        // 3. Direct Answer Section
        if (
          trimmed.startsWith('### **ANSWER**') ||
          trimmed.startsWith('**ANSWER**') ||
          trimmed.startsWith('### ANSWER') ||
          trimmed.startsWith('### **EXECUTIVE SUMMARY**')
        ) {
          const body = trimmed.replace(/^(###\s*)?(\*\*(ANSWER|EXECUTIVE SUMMARY)\*\*|ANSWER|EXECUTIVE SUMMARY):?\n*/, '').trim();
          return (
            <div key={`ans-${i}`} className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-950 border border-indigo-500/30 shadow-md">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Direct Grounded Answer
                </span>
              </div>
              <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                {renderInline(body)}
              </div>
            </div>
          );
        }

        // 4. Key Observations & Architecture Details
        if (
          trimmed.includes('KEY OBSERVATIONS') ||
          trimmed.includes('**KEY OBSERVATIONS**') ||
          trimmed.includes('KEY TECHNICAL DETAILS') ||
          trimmed.includes('**KEY TECHNICAL DETAILS**') ||
          trimmed.includes('TECHNICAL ARCHITECTURE & EVIDENCE')
        ) {
          const lines = trimmed.split('\n').filter(l => 
            !l.includes('KEY OBSERVATIONS') && 
            !l.includes('KEY TECHNICAL DETAILS') &&
            !l.includes('TECHNICAL ARCHITECTURE & EVIDENCE')
          );
          return (
            <div key={`obs-${i}`} className="mb-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Technical Architecture & Grounded Evidence
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {lines.map((line, lIdx) => {
                  const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
                  if (!cleaned) return null;
                  return (
                    <li key={lIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{renderInline(cleaned)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        // 5. Developer Guide & Recommendations
        if (
          trimmed.includes('RECOMMENDATION') || 
          trimmed.includes('**RECOMMENDATION**') || 
          trimmed.includes('RECOMMENDATIONS') ||
          trimmed.includes('DEVELOPER IMPLEMENTATION GUIDE') ||
          trimmed.includes('DEVELOPER ACTION PLAN')
        ) {
          const body = trimmed.replace(/^(###\s*)?(\*\*(RECOMMENDATIONS?|DEVELOPER IMPLEMENTATION GUIDE|DEVELOPER ACTION PLAN)\*\*|RECOMMENDATIONS?):?\n*/, '').trim();
          const lines = body.split('\n').filter(l => l.trim().length > 0);
          return (
            <div key={`rec-${i}`} className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-950 border border-emerald-500/30 shadow-md">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Developer Implementation & Action Plan
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-emerald-100/90 leading-relaxed">
                {lines.map((line, lIdx) => (
                  <p key={lIdx} className={line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line) ? 'pl-2' : ''}>
                    {renderInline(line)}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '');
          return (
            <blockquote key={`quote-${i}`} className="my-3 pl-4 py-1 border-l-2 border-indigo-500 text-slate-300 italic text-xs leading-relaxed bg-indigo-950/10 rounded-r-xl">
              {renderInline(quoteText)}
            </blockquote>
          );
        }

        // Default paragraph
        return (
          <div key={`p-${i}`} className="text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {renderInline(trimmed)}
          </div>
        );
      });
    });
  };

  return (
    <div className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'} mb-6 group`}>
      {isAssistant && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-indigo-500/20 mt-1">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-[90%] sm:max-w-[80%] ${isAssistant ? 'text-left' : 'text-right'}`}>
        <div
          className={`relative p-5 rounded-3xl transition-all ${
            isAssistant
              ? 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-md'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/25 rounded-tr-md'
          }`}
        >
          {/* Assistant Header Actions */}
          {isAssistant && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                  RAG Evidence Synthesizer
                </span>
              </div>
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
                title="Copy Full Response"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* Body Content */}
          {isAssistant ? (
            formatContent(message.content)
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
          )}

          {/* Citations section if assistant message */}
          {isAssistant && citations.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800/90">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Ground-Truth Source Citations ({citations.length})</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                  Verified 1:1
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {citations.map((cite, idx) => (
                  <CitationCard key={idx} citation={cite} index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1 shadow-md">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
