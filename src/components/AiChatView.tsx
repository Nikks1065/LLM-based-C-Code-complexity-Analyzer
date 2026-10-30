/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  FileCode,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { ChatMessage } from '../types/repomind';

interface AiChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  onOpenFileInExplorer: (filePath: string) => void;
  initialQuestion?: string;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearHistory,
  onOpenFileInExplorer,
  initialQuestion,
}) => {
  const [inputText, setInputText] = useState(initialQuestion || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuestion) {
      setInputText(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText('');
    onSendMessage(msg);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedStarters = [
    'Explain the complete project architecture',
    'How does data move from client to server?',
    'Which functions have high cyclomatic complexity?',
    'Where is the main entry point and configuration?',
    'How can I add a new feature to this codebase?',
  ];

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight">AI Repository Assistant</h2>
            <p className="text-[11px] text-slate-400">RAG Grounded with strict citations</p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Explore Code with Grounded AI</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Ask anything about architecture, execution flows, functions, or potential bugs. Responses cite exact file paths and line ranges.
            </p>

            <div className="w-full space-y-2 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block px-1">
                Suggested Prompts
              </span>
              {suggestedStarters.map((starter) => (
                <button
                  key={starter}
                  onClick={() => onSendMessage(starter)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-slate-850 hover:text-white transition-all text-left"
                >
                  <span>{starter}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                    <span className="font-semibold text-indigo-400 text-[11px]">RepoMind AI</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 border-t border-slate-800/80 pt-2.5 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Referenced Files & Lines
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenFileInExplorer(c.filePath)}
                          className="flex items-center gap-1 rounded bg-slate-950 px-2 py-1 font-mono text-[11px] text-indigo-300 border border-slate-800 hover:border-indigo-500 transition-colors"
                        >
                          <FileCode className="h-3 w-3 text-slate-400" />
                          <span>{c.filePath}{c.startLine ? `:${c.startLine}-${c.endLine}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 border-t border-slate-800/60 pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(q)}
                        className="rounded bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        {q} &rarr;
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Analyzing code context and formulating grounded answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900/80 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about execution flow, authentication, functions, or database queries..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 shadow-md shadow-indigo-600/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
