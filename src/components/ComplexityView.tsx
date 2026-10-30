/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Gauge,
  AlertTriangle,
  Code2,
  Clock,
  HardDrive,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FileComplexity } from '../types/repomind';

interface ComplexityViewProps {
  fileComplexities: FileComplexity[];
  onOpenFileInExplorer: (path: string) => void;
}

export const ComplexityView: React.FC<ComplexityViewProps> = ({
  fileComplexities,
  onOpenFileInExplorer,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileComplexity | null>(fileComplexities[0] || null);
  const [filterSmellsOnly, setFilterSmellsOnly] = useState(false);
  const [expandedFunc, setExpandedFunc] = useState<string | null>(null);

  const totalSmells = fileComplexities.reduce((acc, f) => acc + f.codeSmells.length, 0);
  const totalHighCC = fileComplexities.filter(f => f.cyclomaticComplexity > 10).length;

  const filteredList = filterSmellsOnly
    ? fileComplexities.filter(f => f.codeSmells.length > 0 || f.cyclomaticComplexity > 10)
    : fileComplexities;

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Gauge className="h-4 w-4" />
          Code Complexity & Quality Engine
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Static AST Metrics & Algorithmic Bounds
        </h1>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed max-w-3xl">
          Derived from the original GenAI Code Complexity Analyzer core, upgraded with multi-language AST heuristics, function-level cognitive scoring, SEI maintainability ratings, and Big-O runtime estimation.
        </p>
      </div>

      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Scientific Methodology Distinction</span>
            <p className="text-slate-400 leading-relaxed">
              <strong>Statistically & Parser-Calculated:</strong> Lines of Code (LOC), SLOC, CLOC, Cyclomatic Complexity <code className="text-indigo-300">V(G) = 1 + decisions</code>, Halstead Volume, and SEI Maintainability Index.
              <br />
              <strong>Algorithmic Static Heuristics:</strong> Time Complexity <code className="text-amber-300">O(1), O(N), O(N^2)</code> and Space Complexity bounds calculated via AST loop nesting depth, recursion tree branches, and dynamic allocation patterns.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Total Analyzed Files</span>
          <div className="text-2xl font-bold text-white mt-1">{fileComplexities.length}</div>
          <span className="text-[11px] text-slate-500">Source modules scanned</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">High Complexity Files</span>
          <div className={`text-2xl font-bold mt-1 ${totalHighCC > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalHighCC}
          </div>
          <span className="text-[11px] text-slate-500">Cyclomatic V(G) &gt; 10</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Identified Code Smells</span>
          <div className={`text-2xl font-bold mt-1 ${totalSmells > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {totalSmells}
          </div>
          <span className="text-[11px] text-slate-500">Nesting, god funcs, params</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Parser Confidence</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">94%</div>
          <span className="text-[11px] text-slate-500">Deterministic token matching</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">File Complexity Ranks</h3>
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={filterSmellsOnly}
                onChange={(e) => setFilterSmellsOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>High Risk Only</span>
            </label>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredList.map((fc) => {
              const isSelected = selectedFile?.filePath === fc.filePath;
              return (
                <div
                  key={fc.filePath}
                  onClick={() => setSelectedFile(fc)}
                  className={`rounded-lg border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-sm'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-medium text-slate-200 truncate pr-2">
                      {fc.filePath}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        fc.cyclomaticComplexity > 10
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      CC {fc.cyclomaticComplexity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{fc.loc} LOC</span>
                      <span>&bull;</span>
                      <span className={fc.maintainabilityRating === 'High' ? 'text-emerald-400' : 'text-amber-400'}>
                        MI: {fc.maintainabilityIndex}
                      </span>
                    </div>
                    <span className="font-mono text-amber-300 font-semibold">{fc.estimatedTimeComplexity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {selectedFile ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] text-indigo-300 uppercase font-semibold">
                      {selectedFile.language}
                    </span>
                    <h2 className="text-base font-bold text-white font-mono">{selectedFile.filePath}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    SLOC: {selectedFile.sloc} | Comments: {selectedFile.cloc} | Blank Lines: {selectedFile.blankLines}
                  </p>
                </div>

                <button
                  onClick={() => onOpenFileInExplorer(selectedFile.filePath)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                >
                  View Code &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>Estimated Time Complexity</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-amber-400">
                    {selectedFile.estimatedTimeComplexity}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedFile.timeComplexityReasoning}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <HardDrive className="h-4 w-4 text-cyan-400" />
                    <span>Auxiliary Space Complexity</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-cyan-400">
                    {selectedFile.estimatedSpaceComplexity}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedFile.spaceComplexityReasoning}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                  Function-Level Complexity ({selectedFile.functions.length} functions detected)
                </h3>

                {selectedFile.functions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 border border-slate-800 rounded-lg">
                    No top-level functions isolated in this module. Evaluated at file scope.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedFile.functions.map((fn) => {
                      const isExpanded = expandedFunc === fn.name;
                      return (
                        <div
                          key={fn.name}
                          className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-3 text-xs space-y-2"
                        >
                          <div
                            onClick={() => setExpandedFunc(isExpanded ? null : fn.name)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2 font-mono">
                              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                              <span className="font-semibold text-slate-200">{fn.name}()</span>
                              <span className="text-[11px] text-slate-500">L{fn.lineStart}-L{fn.lineEnd}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-bold ${fn.cyclomaticComplexity > 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                                CC {fn.cyclomaticComplexity}
                              </span>
                              <span className="font-mono text-amber-300 font-semibold">{fn.timeComplexityEstimate}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                              <div>LOC: <strong className="text-slate-200">{fn.loc}</strong></div>
                              <div>Params: <strong className="text-slate-200">{fn.paramsCount}</strong></div>
                              <div>Cognitive Score: <strong className="text-slate-200">{fn.cognitiveComplexity}</strong></div>
                              <div>Space: <strong className="text-slate-200">{fn.spaceComplexityEstimate}</strong></div>

                              {fn.warnings.length > 0 && (
                                <div className="col-span-full pt-1.5 text-rose-400">
                                  {fn.warnings.map((w, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <AlertTriangle className="h-3 w-3 shrink-0" />
                                      <span>{w}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedFile.codeSmells.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                    Flagged Code Smells ({selectedFile.codeSmells.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedFile.codeSmells.map((smell) => (
                      <div
                        key={smell.id}
                        className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                            {smell.type}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">Line {smell.line}</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                          {smell.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400 text-xs">
              Select a file from the left to inspect its deep static metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
