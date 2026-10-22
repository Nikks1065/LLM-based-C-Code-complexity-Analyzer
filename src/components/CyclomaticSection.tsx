import React, { useState } from 'react';
import { GitBranch, Info, CheckCircle2, ArrowUpRight, Network } from 'lucide-react';
import { CyclomaticMetrics, FunctionAnalysis } from '../types/analyzer.ts';

interface CyclomaticSectionProps {
  functions: FunctionAnalysis[];
  programSummary: {
    sumComplexity: number;
    averageComplexity: number;
    maxComplexity: number;
    highestComplexityFunction: string;
    overallRisk: string;
  };
  onNavigateToLine: (line: number) => void;
}

export const CyclomaticSection: React.FC<CyclomaticSectionProps> = ({
  functions,
  programSummary,
  onNavigateToLine
}) => {
  const [selectedFuncIndex, setSelectedFuncIndex] = useState(0);

  // Automatically select the function with peak Cyclomatic Complexity
  React.useEffect(() => {
    if (functions.length > 0) {
      const bestIdx = functions.reduce((best, f, idx) => {
        return f.cyclomatic.score > functions[best].cyclomatic.score ? idx : best;
      }, 0);
      setSelectedFuncIndex(bestIdx);
    }
  }, [functions]);

  const activeFunc = functions[selectedFuncIndex] || functions[0];
  const cc: CyclomaticMetrics | undefined = activeFunc?.cyclomatic;

  return (
    <div className="space-y-6">
      {/* Formula & Method Banner */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              McCabe Cyclomatic Complexity Analysis Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measures the number of linearly independent paths through the program's source code.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">
              Method 1: Control Flow Graph (CFG)
            </h3>
            <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              M = E - N + 2P
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Where <strong>E</strong> is the number of edges (control flow transfers), <strong>N</strong> is the number of nodes (basic blocks), and <strong>P</strong> is the number of connected components (P = 1 for a single subroutine).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-1">
              Method 2: Decision-Count Theorem
            </h3>
            <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
              M = π + 1
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Where <strong>π</strong> is the count of decision predicate points: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">if</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">for</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">while</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">case</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">&&</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">||</code>, and <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">? :</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Program Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Peak Complexity (M)</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {programSummary.maxComplexity}
          </div>
          <span className="text-[11px] text-indigo-500 font-mono truncate block mt-0.5">
            in {programSummary.highestComplexityFunction}()
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Average Complexity</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {programSummary.averageComplexity}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            across {functions.length} functions
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Cumulative Complexity</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {programSummary.sumComplexity}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            total program basis paths
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400">Overall Risk Level</span>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {programSummary.overallRisk}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            McCabe risk threshold
          </span>
        </div>
      </div>

      {/* Function Deep Dive Selector */}
      {functions.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Function-Level Control Flow Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a function to inspect its step-by-step calculation and decision point inventory.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Function:</span>
              <select
                aria-label="Select Function for Cyclomatic Breakdown"
                value={selectedFuncIndex}
                onChange={(e) => setSelectedFuncIndex(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {functions.map((f, i) => (
                  <option key={f.name} value={i}>
                    {f.name}() [M = {f.cyclomatic.score}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cc && (
            <div className="space-y-4">
              {/* Step by Step derivation box */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {cc.stepByStepCalculation}
              </div>

              {/* Interactive CFG Visual Graph */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="font-bold flex items-center gap-1.5 text-slate-300">
                    <Network className="w-4 h-4 text-cyan-400" />
                    Synthesized Control Flow Graph (CFG)
                  </span>
                  <span>
                    Nodes (N) = {cc.nodesCount} | Edges (E) = {cc.edgesCount} | M = {cc.score}
                  </span>
                </div>

                {/* SVG Visual Flow Diagram */}
                <div className="overflow-x-auto py-4 flex items-center justify-center">
                  <svg
                    width={Math.max(600, cc.cfg.nodes.length * 110 + 60)}
                    height="180"
                    className="select-none"
                  >
                    <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                      </marker>
                    </defs>

                    {/* Nodes and Edges */}
                    {cc.cfg.nodes.map((node, idx) => {
                      const cx = 60 + idx * 110;
                      const cy = node.type === 'decision' ? 70 :
                                 node.type === 'statement' ? 130 : 90;
                      const isEntry = node.type === 'entry';
                      const isExit = node.type === 'exit';
                      const isDecision = node.type === 'decision';

                      return (
                        <g key={node.id} className="cursor-pointer" onClick={() => node.lineNumber && onNavigateToLine(node.lineNumber)}>
                          {/* Node Shape */}
                          {isDecision ? (
                            <polygon
                              points={`${cx},${cy - 20} ${cx + 35},${cy} ${cx},${cy + 20} ${cx - 35},${cy}`}
                              fill="#0f172a"
                              stroke="#06b6d4"
                              strokeWidth="2"
                            />
                          ) : (
                            <rect
                              x={cx - 40}
                              y={cy - 18}
                              width="80"
                              height="36"
                              rx="6"
                              fill="#0f172a"
                              stroke={isEntry ? '#10b981' : isExit ? '#f43f5e' : '#64748b'}
                              strokeWidth="2"
                            />
                          )}

                          {/* Node Label */}
                          <text
                            x={cx}
                            y={cy + 4}
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {node.label.length > 12 ? node.label.slice(0, 11) + '…' : node.label}
                          </text>

                          {/* Connecting arrow to next node if sequential */}
                          {idx < cc.cfg.nodes.length - 1 && (
                            <line
                              x1={cx + 42}
                              y1={cy}
                              x2={cx + 110 - 42}
                              y2={
                                cc.cfg.nodes[idx + 1].type === 'decision' ? 70 :
                                cc.cfg.nodes[idx + 1].type === 'statement' ? 130 : 90
                              }
                              stroke="#64748b"
                              strokeWidth="1.5"
                              markerEnd="url(#arrow)"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Decision Points Inventory Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Decision Points Inventory (π = {cc.decisionPointsCount})
                </h4>
                {cc.decisionPoints.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 italic">
                    No decision branching statements found in this function. It follows a purely linear sequential flow (M = 1).
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Construct</th>
                          <th className="py-2.5 px-3">Line #</th>
                          <th className="py-2.5 px-4">Code Snippet</th>
                          <th className="py-2.5 px-4">Explanation</th>
                          <th className="py-2.5 px-3 text-center">Basis Path</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                        {cc.decisionPoints.map((dec) => (
                          <tr
                            key={dec.id}
                            onClick={() => onNavigateToLine(dec.lineNumber)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                          >
                            <td className="py-2 px-3 font-sans">
                              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-[11px]">
                                {dec.type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 flex items-center gap-1 group-hover:text-blue-500">
                              <span>L{dec.lineNumber}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </td>
                            <td className="py-2 px-4 text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">
                              {dec.codeSnippet}
                            </td>
                            <td className="py-2 px-4 text-slate-600 dark:text-slate-400 font-sans text-xs">
                              {dec.description}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-cyan-600 dark:text-cyan-400">
                              +{dec.contribution}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
