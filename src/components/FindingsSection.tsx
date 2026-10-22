import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Lightbulb
} from 'lucide-react';
import { QualityFinding } from '../types/analyzer.ts';

interface FindingsSectionProps {
  findings: QualityFinding[];
  onNavigateToLine: (line: number) => void;
}

export const FindingsSection: React.FC<FindingsSectionProps> = ({
  findings,
  onNavigateToLine
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyConfirmed, setOnlyConfirmed] = useState<boolean>(false);

  // Available categories
  const categories = Array.from(new Set(findings.map(f => f.category)));

  const filtered = findings.filter(f => {
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (onlyConfirmed && !f.isConfirmed) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Quality Findings & Evidence Explorer ({findings.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic code smells, memory safety hazards, algorithmic bottlenecks, and maintainability concerns.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyConfirmed}
              onChange={(e) => setOnlyConfirmed(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Show Only Confirmed Static Violations</span>
          </label>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          {/* Severity filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-semibold mr-1">Severity:</span>
            {['all', 'High', 'Medium', 'Low', 'Info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-semibold mr-1">Category:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Findings List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Findings Match Filter Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            All code checks passed or filtered out. Try resetting the severity/category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((finding) => {
            const sevColor =
              finding.severity === 'High' ? 'text-rose-500 bg-rose-500/10 border-rose-500/30' :
              finding.severity === 'Medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' :
              'text-blue-500 bg-blue-500/10 border-blue-500/30';

            return (
              <div
                key={finding.id}
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${sevColor}`}>
                      {finding.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                      {finding.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      finding.isConfirmed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {finding.isConfirmed ? 'Confirmed Static Check' : 'Potential Issue'}
                    </span>
                  </div>

                  {finding.lineNumbers.length > 0 && (
                    <button
                      onClick={() => onNavigateToLine(finding.lineNumbers[0])}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group"
                    >
                      <span>Line {finding.lineNumbers.join(', Line ')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {finding.title}
                </h3>

                {finding.codeSnippet && (
                  <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-amber-300 border border-slate-800 overflow-x-auto">
                    {finding.codeSnippet}
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {finding.explanation}
                </p>

                {/* Suggested Fix */}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                    <span>Suggested Fix:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {finding.suggestedFix}
                  </p>
                </div>

                {finding.limitations && (
                  <div className="text-[11px] text-slate-400 italic">
                    Limitation: {finding.limitations}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
