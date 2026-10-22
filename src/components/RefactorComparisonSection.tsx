import React, { useState } from 'react';
import {
  Sparkles,
  GitCompare,
  Check,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  FileCode,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CompleteAnalysisResult, RefactorComparison, AIRefactorResponse } from '../types/analyzer.ts';

interface RefactorComparisonSectionProps {
  sourceCode: string;
  analysis: CompleteAnalysisResult;
  onAcceptRefactoring: (newCode: string) => void;
  onNavigateToLine: (line: number) => void;
}

export const RefactorComparisonSection: React.FC<RefactorComparisonSectionProps> = ({
  sourceCode,
  analysis,
  onAcceptRefactoring,
  onNavigateToLine
}) => {
  const [goal, setGoal] = useState('Optimize algorithmic complexity, simplify control branching, and eliminate potential memory leaks.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refactorProposal, setRefactorProposal] = useState<AIRefactorResponse | null>(null);
  const [comparison, setComparison] = useState<RefactorComparison | null>(null);
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const handleGenerateRefactoring = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Ask AI for refactoring proposal
      const aiRes = await fetch('/api/ai/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, analysis, userGoal: goal })
      });
      const aiData: AIRefactorResponse = await aiRes.json();
      if (!aiRes.ok) {
        throw new Error((aiData as any).error || 'Refactoring generation failed');
      }
      setRefactorProposal(aiData);

      // 2. Compute deterministic comparison deltas
      const compRes = await fetch('/api/refactor/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalCode: sourceCode,
          refactoredCode: aiData.refactoredCode,
          fileName: 'refactored.c'
        })
      });
      const compData: RefactorComparison = await compRes.json();
      if (!compRes.ok) {
        throw new Error((compData as any).error || 'Metric comparison calculation failed');
      }
      setComparison(compData);
    } catch (err: any) {
      setError(err.message || 'Error occurred during refactoring');
    } finally {
      setIsLoading(false);
    }
  };

  const originalLines = sourceCode.split('\n');
  const refactoredLines = comparison?.refactoredCode.split('\n') || [];

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Refactoring Prompt & Controls */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Intelligent C Refactoring & Before/After Comparison
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Propose optimized implementations, recalculate deterministic metrics, and verify measurable impact.
            </p>
          </div>
        </div>

        {/* Goal presets and custom input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Refactoring Objectives / User Prompt:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Optimize O(n^2) to O(n), eliminate memory leaks, reduce CC..."
            />
            <button
              onClick={handleGenerateRefactoring}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Refactoring & Recomputing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Propose Refactoring</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
            <span className="text-slate-400 font-semibold">Presets:</span>
            {[
              'Reduce Time Complexity to O(n)',
              'Prevent Memory Leaks & Add Safety Guards',
              'Reduce Cyclomatic Complexity & Extract Helpers',
              'Modernize C99 Types & Comment Documentation'
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setGoal(p)}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* When comparison is available */}
      {comparison && refactorProposal && (
        <div className="space-y-6">
          {/* Summary of Changes & Expected Impact */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  AI Refactoring Rationale & Tradeoffs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review the expected performance and architectural impact before applying.
                </p>
              </div>

              {/* Accept & Revert Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAcceptRefactoring(comparison.refactoredCode)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Apply Refactoring</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Summary of Changes:</h4>
                <ul className="list-disc pl-5 text-slate-600 dark:text-slate-300 space-y-1">
                  {refactorProposal.summaryOfChanges.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Expected Impact & Tradeoffs:</h4>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div><strong>Time Complexity: </strong> {refactorProposal.expectedImpact.timeComplexity}</div>
                  <div><strong>Space Complexity: </strong> {refactorProposal.expectedImpact.spaceComplexity}</div>
                  <div><strong>Maintainability: </strong> {refactorProposal.expectedImpact.maintainability}</div>
                  <div><strong>Readability: </strong> {refactorProposal.expectedImpact.readabilityTradeoffs}</div>
                </div>
              </div>
            </div>

            {refactorProposal.testingRequirements.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs">
                <strong className="text-blue-900 dark:text-blue-200">Recommended Equivalence Tests: </strong>
                <span className="text-slate-600 dark:text-slate-300">{refactorProposal.testingRequirements.join('; ')}</span>
              </div>
            )}
          </div>

          {/* Metric Deltas Table */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-indigo-500" />
                Verified Metric Deltas (Before vs After)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Metric</th>
                    <th className="py-2.5 px-3">Original</th>
                    <th className="py-2.5 px-3">Refactored</th>
                    <th className="py-2.5 px-3">Delta</th>
                    <th className="py-2.5 px-4">Engine Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                  {comparison.deltas.map((delta, idx) => {
                    const isImp = delta.improved === true;
                    const isDeg = delta.improved === false;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                          {delta.metric}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {delta.originalValue}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {delta.refactoredValue}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                            isImp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            isDeg ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                            'bg-slate-500/10 text-slate-500'
                          }`}>
                            {isImp ? <TrendingDown className="w-3 h-3" /> :
                             isDeg ? <TrendingUp className="w-3 h-3" /> :
                             <Minus className="w-3 h-3" />}
                            <span>{delta.difference}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-xs text-slate-600 dark:text-slate-300">
                          {delta.explanation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side-by-Side Code Diff Viewer */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-500" />
                Side-by-Side Source Code Comparison
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Left: Original | Right: Refactored</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950 text-slate-100 font-mono text-[12px] max-h-[500px] overflow-auto">
              {/* Original Code */}
              <div className="p-4">
                <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Original Source ({originalLines.length} lines)
                </div>
                <div className="space-y-0.5 whitespace-pre">
                  {originalLines.map((line, idx) => (
                    <div key={idx} className="flex">
                      <span className="w-8 text-right text-slate-600 select-none mr-3">{idx + 1}</span>
                      <span className="text-slate-300">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refactored Code */}
              <div className="p-4 bg-slate-950/90">
                <div className="text-[11px] font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                  Refactored Source ({refactoredLines.length} lines)
                </div>
                <div className="space-y-0.5 whitespace-pre">
                  {refactoredLines.map((line, idx) => (
                    <div key={idx} className="flex">
                      <span className="w-8 text-right text-slate-600 select-none mr-3">{idx + 1}</span>
                      <span className="text-slate-200">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
