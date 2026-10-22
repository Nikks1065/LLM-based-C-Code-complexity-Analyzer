import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { CompleteAnalysisResult, AIReviewResponse } from '../types/analyzer.ts';

interface AISectionProps {
  sourceCode: string;
  analysis: CompleteAnalysisResult;
  onNavigateToLine: (line: number) => void;
}

export const AISection: React.FC<AISectionProps> = ({
  sourceCode,
  analysis,
  onNavigateToLine
}) => {
  const [subTab, setSubTab] = useState<'review' | 'explain' | 'chat'>('review');

  // Review State
  const [reviewData, setReviewData] = useState<AIReviewResponse | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Explanation State
  const [selectedFunc, setSelectedFunc] = useState(analysis.functions[0]?.name || '');
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello! I am your C Code Intelligence Assistant, powered by Google Gemini and grounded in the deterministic static analysis of this C codebase. You can ask me about Big-O derivations, Cyclomatic Complexity calculations, memory safety risks, or potential optimizations.`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Fetch Code Review
  const fetchReview = async () => {
    setIsReviewLoading(true);
    setReviewError(null);
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, analysis })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewData(data);
      } else {
        setReviewError(data.error || 'Failed to generate AI review');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Network request failed');
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Fetch Explanation
  const fetchExplanation = async () => {
    setIsExplainLoading(true);
    setExplainError(null);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, analysis, targetFunction: selectedFunc })
      });
      const data = await res.json();
      if (res.ok) {
        setExplanationText(data.explanation);
      } else {
        setExplainError(data.error || 'Failed to explain complexity');
      }
    } catch (err: any) {
      setExplainError(err.message || 'Network request failed');
    } finally {
      setIsExplainLoading(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isChatLoading) return;

    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    if (!textToSend) setUserInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode,
          analysis,
          question: text,
          chatHistory: newMessages.slice(-6)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', text: `Error: ${data.error || 'Unable to generate answer.'}` }
        ]);
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { role: 'assistant', text: `Network error: ${err.message}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const quickQuestions = [
    `Why is the program rated ${analysis.programTimeComplexity.overallBigO} in time complexity?`,
    `How was the Cyclomatic Complexity score calculated?`,
    `Which function has the lowest maintainability and why?`,
    `What is the difference between Cyclomatic Complexity and Big-O?`,
    `Can this code be optimized without changing its intended behavior?`
  ];

  return (
    <div className="space-y-6">
      {/* Top AI Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Google Gemini AI Code Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded explanations, contextual reviews, and verified Q&A.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setSubTab('review')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subTab === 'review'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Intelligent Review</span>
          </button>
          <button
            onClick={() => setSubTab('explain')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subTab === 'explain'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complexity Explanation</span>
          </button>
          <button
            onClick={() => setSubTab('chat')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subTab === 'chat'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI About Code</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Intelligent Review */}
      {subTab === 'review' && (
        <div className="space-y-6">
          {!reviewData && !isReviewLoading && (
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-8 text-center space-y-3">
              <Bot className="w-12 h-12 text-indigo-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Comprehensive AI Code Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Gemini will analyze the C source code in tandem with the verified static metrics to identify subtle concurrency hazards, memory leaks, boundary bugs, and structural improvements.
              </p>
              <button
                onClick={fetchReview}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Intelligent Review</span>
              </button>
            </div>
          )}

          {isReviewLoading && (
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Conducting In-Depth AI Code Review...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluating control paths, pointer safety, and algorithmic efficiency.
              </p>
            </div>
          )}

          {reviewError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <span>{reviewError}</span>
              <button
                onClick={fetchReview}
                className="px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700"
              >
                Retry
              </button>
            </div>
          )}

          {reviewData && (
            <div className="space-y-6">
              {/* Executive Assessment */}
              <div className="bg-gradient-to-r from-indigo-900/30 via-slate-900 to-blue-900/30 border border-indigo-500/30 rounded-xl p-5 text-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Architectural Summary
                  </span>
                  <button
                    onClick={fetchReview}
                    className="text-xs text-indigo-300 hover:underline flex items-center gap-1"
                  >
                    <span>Re-evaluate</span>
                  </button>
                </div>
                <p className="text-sm leading-relaxed">{reviewData.summary}</p>
                <div className="p-3 bg-slate-950/80 rounded-lg text-xs font-sans text-slate-300 border border-slate-800">
                  <strong>Assessment: </strong> {reviewData.overallAssessment}
                </div>
              </div>

              {/* Review Findings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Identified Contextual Findings ({reviewData.findings.length})
                </h3>

                {reviewData.findings.map((f, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          f.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                          f.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                          {f.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {f.functionName}()
                        </span>
                      </div>

                      {f.lines && f.lines.length > 0 && (
                        <button
                          onClick={() => onNavigateToLine(f.lines[0])}
                          className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Line {f.lines.join(', ')}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {f.title}
                    </h4>

                    {f.snippet && (
                      <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-amber-300 border border-slate-800">
                        {f.snippet}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>Why this is a concern: </strong> {f.whyItIsAProblem}
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                      <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Recommended Implementation:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                        {f.suggestedFix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Complexity Explanation */}
      {subTab === 'explain' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Explain Complexity in Plain English
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive a clear educational breakdown explaining why the algorithm behaves this way asymptotically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  aria-label="Select Function to Explain"
                  value={selectedFunc}
                  onChange={(e) => setSelectedFunc(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  {analysis.functions.map(f => (
                    <option key={f.name} value={f.name}>
                      {f.name}() [{f.timeComplexity.asymptoticNotation}]
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchExplanation}
                  disabled={isExplainLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  {isExplainLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Explain</span>
                </button>
              </div>
            </div>

            {explainError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
                {explainError}
              </div>
            )}

            {explanationText && (
              <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {explanationText}
              </div>
            )}

            {!explanationText && !isExplainLoading && (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                Select a function and click "Explain" to generate an educational Big-O & metric explanation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Contextual Q&A Chat */}
      {subTab === 'chat' && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Thinking and grounding in static AST...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Suggested:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isChatLoading}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] hover:border-blue-500 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything about this C code and verified metrics..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isChatLoading}
              className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() || isChatLoading}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
