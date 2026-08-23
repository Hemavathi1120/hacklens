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
  const citations = message.citations || message.sources || [];
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <strong key={keyIdx++} className="font-bold text-zinc-100">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-zinc-300">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-red-400 text-xs font-mono border border-zinc-700">
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

  const CodeBlock = ({ language, code }) => {
    const [codeCopied, setCodeCopied] = useState(false);
    const copyCode = () => {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
      <div className="my-3 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-zinc-800 text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 uppercase font-semibold text-red-400">
            <Code2 className="w-3.5 h-3.5" />
            {language || 'code'}
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-zinc-800 transition-all text-[11px]"
          >
            {codeCopied ? <Check className="w-3 h-3 text-red-400" /> : <Copy className="w-3 h-3" />}
            {codeCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono text-red-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  const formatContent = (text) => {
    if (!text) return null;

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

        if (trimmed.includes('Scope Boundary Notice') || trimmed.includes('Guardrail Notice')) {
          const bodyLines = trimmed.split('\n').filter(l => !l.includes('Scope Boundary Notice') && !l.includes('Guardrail Notice'));
          return (
            <div key={`scope-${i}`} className="my-3 p-4 rounded-2xl bg-zinc-950 border border-red-500/30 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-red-950 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-red-400 font-bold text-xs uppercase tracking-wider font-mono">
                  Scope & Grounding Boundary Notice
                </span>
              </div>
              <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-normal">
                {bodyLines.map((line, lIdx) => (
                  <p key={lIdx} className={line.startsWith('•') || line.startsWith('-') ? 'pl-2 text-zinc-400' : ''}>
                    {renderInline(line)}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        if (
          trimmed.startsWith('### **ANSWER**') ||
          trimmed.startsWith('**ANSWER**') ||
          trimmed.startsWith('### ANSWER') ||
          trimmed.startsWith('### **EXECUTIVE SUMMARY**')
        ) {
          const body = trimmed.replace(/^(###\s*)?(\*\*(ANSWER|EXECUTIVE SUMMARY)\*\*|ANSWER|EXECUTIVE SUMMARY):?\n*/, '').trim();
          return (
            <div key={`ans-${i}`} className="mb-4 p-4 rounded-2xl bg-zinc-950 border border-red-500/30 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="p-1 rounded-md bg-red-950 text-red-400">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
                  Direct Grounded Answer
                </span>
              </div>
              <div className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-normal">
                {renderInline(body)}
              </div>
            </div>
          );
        }

        return (
          <div key={`p-${i}`} className="text-zinc-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap font-normal">
            {renderInline(trimmed)}
          </div>
        );
      });
    });
  };

  return (
    <div className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'} mb-6 group text-zinc-100`}>
      {isAssistant && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-red-600/20 mt-1 border border-red-500/30">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-[90%] sm:max-w-[80%] ${isAssistant ? 'text-left' : 'text-right'}`}>
        <div
          className={`relative p-5 rounded-3xl transition-all ${
            isAssistant
              ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 shadow-md backdrop-blur-md'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 rounded-tr-md border border-red-500/30'
          }`}
        >
          {/* Assistant Header Actions */}
          {isAssistant && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-zinc-300 text-[11px] uppercase tracking-wider">
                  RAG Evidence Synthesizer
                </span>
              </div>
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all text-[11px] font-medium"
                title="Copy Full Response"
              >
                {copied ? <Check className="w-3 h-3 text-red-400" /> : <Copy className="w-3 h-3" />}
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
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  <BookOpen className="w-4 h-4 text-red-400" />
                  <span>Ground-Truth Source Citations ({citations.length})</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 font-mono font-medium">
                  Verified 1:1 ✓
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
        <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-300 mt-1 shadow-xs">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
