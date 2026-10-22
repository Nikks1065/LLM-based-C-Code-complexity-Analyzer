import React, { useState } from 'react';
import { Atom, Search, ArrowUpRight, Calculator, BookOpen } from 'lucide-react';
import { HalsteadMetrics } from '../types/analyzer.ts';

interface HalsteadSectionProps {
  halstead: HalsteadMetrics;
  onNavigateToLine: (line: number) => void;
}

export const HalsteadSection: React.FC<HalsteadSectionProps> = ({
  halstead,
  onNavigateToLine
}) => {
  const [operatorSearch, setOperatorSearch] = useState('');
  const [operandSearch, setOperandSearch] = useState('');

  const filteredOperators = halstead.operatorTable.filter(op =>
    op.token.toLowerCase().includes(operatorSearch.toLowerCase()) ||
    op.classificationReason.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  const filteredOperands = halstead.operandTable.filter(op =>
    op.token.toLowerCase().includes(operandSearch.toLowerCase()) ||
    op.classificationReason.toLowerCase().includes(operandSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview & Academic Citation Banner */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Halstead Software Science Metrics Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Information-theoretic complexity based on token streams (Halstead, 1977; Elements of Software Science).
            </p>
          </div>
        </div>

        {/* 4 Base Counters */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
            <span className="text-purple-700 dark:text-purple-300 font-semibold">Distinct Operators (n₁)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {halstead.distinctOperators}
            </div>
            <span className="text-[11px] text-slate-500">Unique language operators</span>
          </div>

          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <span className="text-indigo-700 dark:text-indigo-300 font-semibold">Distinct Operands (n₂)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {halstead.distinctOperands}
            </div>
            <span className="text-[11px] text-slate-500">Unique variables & constants</span>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <span className="text-blue-700 dark:text-blue-300 font-semibold">Total Operators (N₁)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {halstead.totalOperators}
            </div>
            <span className="text-[11px] text-slate-500">Total operator tokens</span>
          </div>

          <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold">Total Operands (N₂)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {halstead.totalOperands}
            </div>
            <span className="text-[11px] text-slate-500">Total operand tokens</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Mathematical Derivations */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Formulas, Substitutions, and Intermediate Derivations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block">Program Vocabulary (n):</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{halstead.derivations.vocabulary}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block">Program Length (N):</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{halstead.derivations.length}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block">Halstead Volume (V):</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{halstead.derivations.volume}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block">Program Difficulty (D):</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{halstead.derivations.difficulty}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block">Implementation Effort (E):</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{halstead.derivations.effort}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block">Mental Coding Time (T):</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{halstead.derivations.time}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs">
          <span className="text-slate-400 font-sans font-semibold text-[11px] block">Estimated Delivered Faults (B):</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">{halstead.derivations.bugs}</span>
        </div>
      </div>

      {/* Operator and Operand Frequency Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operators Table */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Operators Table (n₁ = {halstead.distinctOperators}, N₁ = {halstead.totalOperators})
              </h4>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search operators..."
                value={operatorSearch}
                onChange={(e) => setOperatorSearch(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th className="py-2 px-3">Operator</th>
                  <th className="py-2 px-3 text-right">Count</th>
                  <th className="py-2 px-3">First Line</th>
                  <th className="py-2 px-4">Classification Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                {filteredOperators.map((op) => (
                  <tr
                    key={op.token}
                    onClick={() => op.lineNumbers[0] && onNavigateToLine(op.lineNumbers[0])}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 px-3 font-bold text-purple-600 dark:text-purple-400">
                      <code className="bg-purple-500/10 px-1.5 py-0.5 rounded">{op.token}</code>
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {op.count}
                    </td>
                    <td className="py-1.5 px-3 text-slate-500 flex items-center gap-1 group-hover:text-blue-500">
                      <span>L{op.lineNumbers[0] || 1}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="py-1.5 px-4 text-slate-500 font-sans text-[11px] truncate max-w-xs">
                      {op.classificationReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operands Table */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Operands Table (n₂ = {halstead.distinctOperands}, N₂ = {halstead.totalOperands})
              </h4>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search operands..."
                value={operandSearch}
                onChange={(e) => setOperandSearch(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th className="py-2 px-3">Operand</th>
                  <th className="py-2 px-3 text-right">Count</th>
                  <th className="py-2 px-3">First Line</th>
                  <th className="py-2 px-4">Classification Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                {filteredOperands.map((op) => (
                  <tr
                    key={op.token}
                    onClick={() => op.lineNumbers[0] && onNavigateToLine(op.lineNumbers[0])}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      <code className="bg-indigo-500/10 px-1.5 py-0.5 rounded">{op.token}</code>
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {op.count}
                    </td>
                    <td className="py-1.5 px-3 text-slate-500 flex items-center gap-1 group-hover:text-blue-500">
                      <span>L{op.lineNumbers[0] || 1}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="py-1.5 px-4 text-slate-500 font-sans text-[11px] truncate max-w-xs">
                      {op.classificationReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
