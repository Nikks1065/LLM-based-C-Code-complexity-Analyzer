import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  GitCommit,
  Info,
  CheckCircle2,
  ArrowUpRight,
  HelpCircle,
  Layers
} from 'lucide-react';
import { BigOTimeMetrics, FunctionAnalysis } from '../types/analyzer.ts';

interface TimeComplexitySectionProps {
  functions: FunctionAnalysis[];
  programTime: {
    overallBigO: string;
    explanation: string;
  };
  onNavigateToLine: (line: number) => void;
}

export const TimeComplexitySection: React.FC<TimeComplexitySectionProps> = ({
  functions,
  programTime,
  onNavigateToLine
}) => {
  const [selectedFuncIndex, setSelectedFuncIndex] = useState(0);

  // Automatically select the function with peak complexity when analysis updates
  React.useEffect(() => {
    if (functions.length > 0) {
      const bestIdx = functions.reduce((best, f, idx) => {
        const ranks: Record<string, number> = {
          'O(2^n)': 7, 'O(n^3)': 6, 'O(n^2)': 5, 'O(n log n)': 4, 'O(n)': 3, 'O(log n)': 2, 'O(1)': 1
        };
        const currentRank = ranks[f.timeComplexity.asymptoticNotation] || 1;
        const bestRank = ranks[functions[best].timeComplexity.asymptoticNotation] || 1;
        return currentRank > bestRank ? idx : best;
      }, 0);
      setSelectedFuncIndex(bestIdx);
    }
  }, [functions]);

  const activeFunc = functions[selectedFuncIndex] || functions[0];
  const time: BigOTimeMetrics | undefined = activeFunc?.timeComplexity;

  return (
    <div className="space-y-6">
      {/* Top Banner: Asymptotic Upper Bound */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Static Big-O Algorithmic Time Complexity Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                  {time?.asymptoticNotation || programTime.overallBigO}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rigorous static loop bound derivation, recurrence modeling, and Master Theorem classification.
              </p>
            </div>
          </div>

          {/* Function Selector */}
          {functions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Function:</span>
              <select
                aria-label="Select Function for Big-O Analysis"
                value={selectedFuncIndex}
                onChange={(e) => setSelectedFuncIndex(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {functions.map((f, i) => (
                  <option key={f.name} value={i}>
                    {f.name}() [{f.timeComplexity.asymptoticNotation}]
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Case Cards */}
        {time && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Worst-Case Upper Bound</span>
              <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {time.worstCase}
              </div>
              <span className="text-[11px] text-slate-500">Asymptotic O-notation</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Best-Case Lower Bound</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {time.bestCase}
              </div>
              <span className="text-[11px] text-slate-500">Early termination path</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Dominant Term</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {time.dominantTerm}
              </div>
              <span className="text-[11px] text-slate-500">Leading order of growth</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Analysis Confidence</span>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{time.confidence}</span>
              </div>
              <span className="text-[11px] text-slate-500">Static AST verification</span>
            </div>
          </div>
        )}
      </div>

      {time && (
        <>
          {/* Operation Count Model T(n) */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-amber-500" />
              Operation-Count Mathematical Model T(n)
            </h3>
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 font-mono text-sm font-bold text-amber-900 dark:text-amber-200">
              {time.operationCountModel}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>
                <strong>Identified Input Variable(s): </strong>
                <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">
                  {time.identifiedInputVariables.join(', ') || 'n (symbolic scalar)'}
                </code>
              </div>
              {time.isRecursive && (
                <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                  <strong>Recursion Profile: </strong>
                  {time.recursionDetails}
                </div>
              )}
            </div>
          </div>

          {/* Interactive SVG Growth Curves Chart */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Operation Growth Curves vs Standard Baselines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visual comparison across problem sizes n = 1 to 128.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                  <span className="font-bold text-amber-500">{time.asymptoticNotation} (This Function)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-blue-400 inline-block" />
                  <span className="text-slate-400">O(n)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-purple-400 inline-block" />
                  <span className="text-slate-400">O(n log n)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-rose-400 inline-block" />
                  <span className="text-slate-400">O(n²)</span>
                </div>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="h-64 w-full bg-slate-950 rounded-xl p-4 flex flex-col justify-between border border-slate-800 select-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="40" y1="70" x2="680" y2="70" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="40" y1="120" x2="680" y2="120" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="40" y1="170" x2="680" y2="170" stroke="#475569" strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="32" y="24" fill="#64748b" fontSize="9" textAnchor="end">16k</text>
                <text x="32" y="74" fill="#64748b" fontSize="9" textAnchor="end">4k</text>
                <text x="32" y="124" fill="#64748b" fontSize="9" textAnchor="end">1k</text>
                <text x="32" y="174" fill="#64748b" fontSize="9" textAnchor="end">0</text>

                {/* X-Axis Coordinates: 8 points */}
                {time.growthDataPoints.map((pt, idx) => {
                  const x = 60 + idx * 85;
                  return (
                    <text key={pt.n} x={x} y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      n={pt.n}
                    </text>
                  );
                })}

                {/* Baseline: O(n) (Blue line) */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  points={time.growthDataPoints.map((pt, idx) => {
                    const x = 60 + idx * 85;
                    // logarithmic normalization for visualization
                    const y = 170 - Math.min(150, Math.log2(pt.baselineOn + 1) * 20);
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Baseline: O(n log n) (Purple line) */}
                <polyline
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  points={time.growthDataPoints.map((pt, idx) => {
                    const x = 60 + idx * 85;
                    const y = 170 - Math.min(150, Math.log2(pt.baselineOnlogn + 1) * 16);
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Baseline: O(n^2) (Rose line) */}
                <polyline
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  points={time.growthDataPoints.map((pt, idx) => {
                    const x = 60 + idx * 85;
                    const y = 170 - Math.min(150, Math.log2(pt.baselineOn2 + 1) * 12);
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Code's Actual Curve (Amber - Highlighted) */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  points={time.growthDataPoints.map((pt, idx) => {
                    const x = 60 + idx * 85;
                    const y = 170 - Math.min(150, Math.log2(pt.operations + 1) * 14);
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Dots on Code Curve */}
                {time.growthDataPoints.map((pt, idx) => {
                  const x = 60 + idx * 85;
                  const y = 170 - Math.min(150, Math.log2(pt.operations + 1) * 14);
                  return (
                    <g key={pt.n}>
                      <circle cx={x} cy={y} r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
                      <text x={x} y={y - 8} fill="#fef3c7" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {pt.operations}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Step-by-Step Derivation Proof */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mathematical Derivation Steps
            </h3>

            <div className="space-y-3">
              {time.derivationSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-[11px]">
                        {step.stepNumber}
                      </span>
                      <span>{step.description}</span>
                    </span>
                    {step.sourceLines.length > 0 && (
                      <button
                        onClick={() => onNavigateToLine(step.sourceLines[0])}
                        className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Evidence: L{step.sourceLines.join(', L')}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-950 font-mono text-amber-700 dark:text-amber-300 font-bold border border-slate-200 dark:border-slate-800/80">
                    {step.mathematicalExpression}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loop Nesting & Iteration Details */}
          {time.loops.length > 0 && (
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                Loop Nesting & Bound Structure ({time.loops.length} loops detected)
              </h3>

              <div className="space-y-2">
                {time.loops.map((loop, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigateToLine(loop.startLine)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-500/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px]">
                          Depth {loop.nestingDepth} ({loop.loopType})
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {loop.codeSnippet}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Variable: <code className="font-mono">{loop.loopVariable || 'implicit'}</code> | Step: <code className="font-mono">{loop.stepType}</code> | Est: <span className="font-semibold text-slate-700 dark:text-slate-300">{loop.estimatedIterations}</span>
                      </div>
                    </div>

                    <button className="text-blue-600 dark:text-blue-400 font-mono text-[11px] flex items-center gap-0.5 whitespace-nowrap">
                      <span>L{loop.startLine} - L{loop.endLine}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
