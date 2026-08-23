import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Paperclip, 
  FileText, 
  Award, 
  AlertCircle, 
  BarChart3, 
  Lightbulb, 
  Search, 
  Target, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  Copy, 
  Check, 
  Code2, 
  Cpu, 
  Loader2, 
  ShieldCheck, 
  RotateCw,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function RuixenMoonChat({
  title = "HackLens AI",
  subtitle = "Ask questions about this hackathon, your project, requirements, evidence, and evaluation.",
  projectName = "",
  domain = "",
  score = null,
  messages = [],
  onSendMessage,
  isLoading = false,
  onAttachFile,
  suggestedActions = [
    { label: "Explain Requirements", prompt: "Explain the mandatory requirements of this project and show supporting sources.", icon: FileText },
    { label: "Evaluate My Project", prompt: "Evaluate my project against the hackathon criteria and highlight key strengths.", icon: Award },
    { label: "Find Missing Requirements", prompt: "Identify any missing requirements or gaps in my project documentation.", icon: AlertCircle },
    { label: "Analyze Judging Criteria", prompt: "Analyze how judges will evaluate this submission and key scoring metrics.", icon: BarChart3 },
    { label: "Suggest Improvements", prompt: "What are the most impactful technical and UX improvements for this project?", icon: Lightbulb },
    { label: "Find Weak Evidence", prompt: "Which claims lack sufficient evidence or citations in the uploaded documentation?", icon: Search },
    { label: "Check Project Relevance", prompt: "How effectively does this project solve the declared problem statement?", icon: Target },
  ],
  className = ""
}) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  // Auto-resize textarea with strict max-height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [inputValue]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Inline markdown formatter (bold, italic, code tags)
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
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-zinc-800 text-red-400 text-xs font-mono border border-zinc-700 font-semibold">
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

  // Structured Message Content Formatter
  const formatAssistantContent = (text) => {
    if (!text) return null;

    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, i) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // 1. Direct Answer Container
      if (
        trimmed.startsWith('**ANSWER**') ||
        trimmed.startsWith('### **ANSWER**') ||
        trimmed.startsWith('ANSWER:')
      ) {
        const body = trimmed.replace(/^(###\s*)?(\*\*ANSWER\*\*|ANSWER):?\n*/, '').trim();
        return (
          <div key={`ans-${i}`} className="mb-2.5 p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/30 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 rounded-md bg-red-950 text-red-400">
                <Cpu className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 font-mono">
                Direct Grounded Answer
              </span>
            </div>
            <div className="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {renderInline(body)}
            </div>
          </div>
        );
      }

      // 2. Key Observations Container
      if (
        trimmed.includes('KEY OBSERVATIONS') ||
        trimmed.includes('**KEY OBSERVATIONS**')
      ) {
        const lines = trimmed.split('\n').filter(l => !l.includes('KEY OBSERVATIONS'));
        return (
          <div key={`obs-${i}`} className="mb-2.5 p-3.5 rounded-2xl bg-zinc-950/90 border border-amber-500/30 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 rounded-md bg-amber-950 text-amber-400">
                <Layers className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                Grounded Evidence Insights
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-300 font-normal">
              {lines.map((line, lIdx) => {
                const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
                if (!cleaned) return null;
                return (
                  <li key={lIdx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{renderInline(cleaned)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      // 3. Recommendations Container
      if (
        trimmed.includes('RECOMMENDATIONS') ||
        trimmed.includes('**RECOMMENDATIONS**')
      ) {
        const lines = trimmed.split('\n').filter(l => !l.includes('RECOMMENDATIONS'));
        return (
          <div key={`rec-${i}`} className="mb-2.5 p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/30 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 rounded-md bg-red-950 text-red-400">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 font-mono">
                Recommended Action Plan
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300 font-normal leading-relaxed">
              {lines.map((line, lIdx) => (
                <p key={lIdx} className={line.startsWith('•') || /^\d+\./.test(line) ? 'pl-1' : ''}>
                  {renderInline(line)}
                </p>
              ))}
            </div>
          </div>
        );
      }

      // Default text paragraph
      return (
        <div key={`p-${i}`} className="text-zinc-200 text-xs sm:text-sm leading-relaxed mb-2 whitespace-pre-wrap font-normal">
          {renderInline(trimmed)}
        </div>
      );
    });
  };

  return (
    <div className={cn("flex flex-col h-full rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl overflow-hidden relative", className)}>
      
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center text-white shadow-md shadow-red-600/25 flex-shrink-0 border border-red-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black font-display text-zinc-100 truncate">{title}</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                RAG Grounded
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-normal truncate max-w-sm">{subtitle}</p>
          </div>
        </div>

        {/* Project Context Chip */}
        {projectName && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-semibold shadow-2xs flex-shrink-0">
            <span className="truncate max-w-[120px] font-bold text-red-400">{projectName}</span>
            {score !== null && score !== undefined && score > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-500/30 font-mono text-[10px] font-bold">
                {Math.round(score)}/100
              </span>
            )}
          </div>
        )}
      </div>

      {/* Suggested Quick Action Chips Toolbar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-zinc-800 bg-zinc-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono whitespace-nowrap flex items-center gap-1">
          <Zap className="w-3 h-3 text-red-400" /> Prompts:
        </span>
        {suggestedActions.slice(0, 5).map((action, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(action.prompt)}
            className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 text-[11px] font-semibold whitespace-nowrap shadow-2xs transition-all hover:scale-[1.02]"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages Stream Container (Scrolls Internally) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 py-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-950 via-zinc-900 to-black border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-600/10">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold font-display text-zinc-100">
                Hi! I'm {title}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-normal">
                Ask questions about this hackathon, your project requirements, evidence verification, and recommendations.
              </p>
            </div>

            {/* Quick Action Grid */}
            <div className="w-full pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestedActions.slice(0, 4).map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(action.prompt)}
                      className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-900 transition-all text-left flex items-start gap-2 group shadow-2xs"
                    >
                      <div className="p-1 rounded-lg bg-zinc-900 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-zinc-200 group-hover:text-red-400 transition-colors">
                          {action.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                          {action.prompt}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            const citations = msg.citations || msg.sources || [];

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300",
                  isAssistant ? "justify-start" : "justify-end"
                )}
              >
                {/* Assistant Bot Icon */}
                {isAssistant && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5 border border-red-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble (Compact Chatbot Style) */}
                <div
                  className={cn(
                    "transition-all",
                    isAssistant
                      ? "max-w-[88%] sm:max-w-[80%] rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 p-4 shadow-sm"
                      : "max-w-[75%] sm:max-w-[65%] w-fit ml-auto rounded-2xl rounded-tr-xs bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-3 px-4 shadow-md shadow-red-600/20 text-right border border-red-500/30"
                  )}
                >
                  {/* Assistant Top Actions Header */}
                  {isAssistant && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold text-zinc-300 text-[10px] uppercase tracking-wider font-mono">
                          Grounded Synthesis
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[10px] font-semibold"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-2.5 h-2.5 text-red-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {/* Message Body */}
                  {isAssistant ? (
                    formatAssistantContent(msg.content)
                  ) : (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium text-left">
                      {msg.content}
                    </p>
                  )}

                  {/* Ground-Truth Sources / Citations */}
                  {isAssistant && citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-red-400" />
                          <span>Evidence Used ({citations.length})</span>
                        </div>
                        <span className="text-[9px] text-red-400 font-bold bg-red-950/40 px-1.5 py-0.2 rounded-full border border-red-500/30">
                          Verified ✓
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-medium shadow-2xs hover:border-red-500/40 hover:bg-zinc-900 transition-all cursor-default"
                          >
                            <FileText className="w-3 h-3 text-red-400 flex-shrink-0" />
                            <span className="font-bold text-zinc-200 truncate max-w-[160px]">
                              {cite.filename || cite.title || 'Document'}
                            </span>
                            {(cite.page_number || cite.page) && (
                              <span className="text-red-400 font-mono font-bold">· P.{cite.page_number || cite.page}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}

        {/* AI Loading Thinking State */}
        {isLoading && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-950/90 border border-red-500/30 text-xs text-red-300 max-w-sm animate-ai-pulse shadow-xs">
            <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin flex-shrink-0" />
            <span className="font-semibold">Retrieving verified evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Fixed at Bottom */}
      <div className="flex-shrink-0 p-3 sm:p-3.5 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="relative rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all p-1.5 flex items-end gap-1.5 shadow-inner">
          
          {/* Attachment Button */}
          {onAttachFile && (
            <button
              type="button"
              onClick={onAttachFile}
              className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors flex-shrink-0"
              title="Attach document or reference file"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          )}

          {/* Auto-Resizing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask HackLens AI anything (Shift+Enter for newline)..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none py-1.5 px-1 max-h-24 leading-relaxed font-normal"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white shadow-md shadow-red-600/25 transition-all flex items-center justify-center flex-shrink-0 hover:scale-105 border border-red-500/30"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1.5 px-1 font-mono">
          <span><strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
          <span className="font-semibold text-red-400">Gemini 2.5 Flash Grounded</span>
        </div>
      </div>

    </div>
  );
}
