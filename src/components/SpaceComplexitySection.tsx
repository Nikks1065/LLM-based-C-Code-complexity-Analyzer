import React, { useState } from 'react';
import { HardDrive, AlertTriangle, CheckCircle2, ArrowUpRight, Database, Layers } from 'lucide-react';
import { SpaceComplexityMetrics, FunctionAnalysis } from '../types/analyzer.ts';

interface SpaceComplexitySectionProps {
  functions: FunctionAnalysis[];
  programSpace: {
    overallBigO: string;
    explanation: string;
  };
  onNavigateToLine: (line: number) => void;
}

export const SpaceComplexitySection: React.FC<SpaceComplexitySectionProps> = ({
  functions,
  programSpace,
  onNavigateToLine
}) => {
  const [selectedFuncIndex, setSelectedFuncIndex] = useState(0);

  // Automatically select the function with peak auxiliary space or allocations
  React.useEffect(() => {
    if (functions.length > 0) {
      const bestIdx = functions.reduce((best, f, idx) => {
        return f.spaceComplexity.allocations.length > functions[best].spaceComplexity.allocations.length ? idx : best;
      }, 0);
      setSelectedFuncIndex(bestIdx);
    }
  }, [functions]);

  const activeFunc = functions[selectedFuncIndex] || functions[0];
  const space: SpaceComplexityMetrics | undefined = activeFunc?.spaceComplexity;

  return (
    <div className="space-y-6">
      {/* Top Banner: Auxiliary Space Upper Bound */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Space Complexity & Memory Allocation Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                  {space?.asymptoticNotation || programSpace.overallBigO}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rigorous separation of Auxiliary Memory, Input Storage, Call Stack Frames, and Dynamic Heap Allocations.
              </p>
            </div>
          </div>

          {/* Function Selector */}
          {functions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Function:</span>
              <select
                aria-label="Select Function for Space Complexity Analysis"
                value={selectedFuncIndex}
                onChange={(e) => setSelectedFuncIndex(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {functions.map((f, i) => (
                  <option key={f.name} value={i}>
                    {f.name}() [{f.spaceComplexity.asymptoticNotation}]
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Storage Summary Cards */}
        {space && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Auxiliary Space</span>
              <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                {space.auxiliarySpace}
              </div>
              <span className="text-[11px] text-slate-500">Excludes input parameters</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Input Storage</span>
              <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {space.inputStorage.split(' ')[0]}
              </div>
              <span className="text-[11px] text-slate-500 truncate block">Passed parameters</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Call Stack Depth</span>
              <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {space.stackMemory.asymptoticStackSpace}
              </div>
              <span className="text-[11px] text-slate-500 truncate block">{space.stackMemory.maxDepth}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400 font-semibold">Heap Leak Risks</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {space.potentialLeaks.length > 0 ? (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {space.potentialLeaks.length}
                  </span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 0 Leaks
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">Missing free() sites</span>
            </div>
          </div>
        )}
      </div>

      {space && (
        <>
          {/* Potential Memory Leaks Warning Alert */}
          {space.potentialLeaks.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-200 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Potential Heap Memory Leaks Detected in '{activeFunc.name}'</span>
              </div>
              {space.potentialLeaks.map((leak, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 pt-1 border-t border-rose-200 dark:border-rose-900/50">
                  <p>{leak.message}</p>
                  <button
                    onClick={() => onNavigateToLine(leak.lineNumber)}
                    className="font-mono text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 whitespace-nowrap"
                  >
                    <span>L{leak.lineNumber}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Derivation Steps Box */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Space Complexity Derivation & Object Analysis
            </h3>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-1.5 leading-relaxed">
              {space.derivationSteps.map((step, idx) => (
                <div key={idx}>{step}</div>
              ))}
            </div>
          </div>

          {/* Memory Allocation Sites Table */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Identified Memory Allocation Sites ({space.allocations.length})
              </h4>
            </div>

            {space.allocations.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 italic">
                No local array or dynamic heap allocations identified. Function executes within standard activation frame.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Line #</th>
                      <th className="py-2.5 px-4">Size Expression</th>
                      <th className="py-2.5 px-3">Asymptotic Space</th>
                      <th className="py-2.5 px-3">Deallocated (free)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                    {space.allocations.map((alloc, idx) => (
                      <tr
                        key={idx}
                        onClick={() => onNavigateToLine(alloc.lineNumber)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-2 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            alloc.type === 'malloc' || alloc.type === 'calloc'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                          }`}>
                            {alloc.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 flex items-center gap-1 group-hover:text-blue-500">
                          <span>L{alloc.lineNumber}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                        <td className="py-2 px-4 text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">
                          {alloc.sizeExpr}
                        </td>
                        <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400 font-bold">
                          {alloc.asymptoticSpace}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          {alloc.hasFreeSite ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reclaimed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" /> Potential Leak
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
