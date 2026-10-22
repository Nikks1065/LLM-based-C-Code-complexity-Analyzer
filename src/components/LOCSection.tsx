import React, { useState } from 'react';
import { FileText, CheckCircle2, Filter, Info, ArrowUpRight } from 'lucide-react';
import { LOCMetrics, LineCategory } from '../types/analyzer.ts';

interface LOCSectionProps {
  loc: LOCMetrics;
  onNavigateToLine: (line: number) => void;
}

export const LOCSection: React.FC<LOCSectionProps> = ({ loc, onNavigateToLine }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLines = selectedCategory === 'all'
    ? loc.lines
    : loc.lines.filter(l => l.category === selectedCategory);

  // Category counts
  const total = loc.totalPhysical || 1;
  const pCode = ((loc.codeOnly / total) * 100).toFixed(1);
  const pComment = ((loc.commentOnly / total) * 100).toFixed(1);
  const pMixed = ((loc.codeAndComment / total) * 100).toFixed(1);
  const pBlank = ((loc.blank / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Title & Definition Banner */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Lines of Code (LOC) Detailed Counting Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic categorization according to IEEE Standard 1045 for software productivity metrics.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Counting Conventions & Partitioning Principle:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            {loc.countingRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Visual Composition Bar */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Source Code Line Composition
        </h3>
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
          <div style={{ width: `${pCode}%` }} title={`Code-Only: ${pCode}%`} className="bg-blue-500 transition-all" />
          <div style={{ width: `${pMixed}%` }} title={`Code & Comment: ${pMixed}%`} className="bg-indigo-500 transition-all" />
          <div style={{ width: `${pComment}%` }} title={`Comment-Only: ${pComment}%`} className="bg-emerald-500 transition-all" />
          <div style={{ width: `${pBlank}%` }} title={`Blank: ${pBlank}%`} className="bg-slate-400 transition-all" />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Code-Only</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {loc.codeOnly} <span className="text-xs font-normal text-slate-500">({pCode}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Code + Comment</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {loc.codeAndComment} <span className="text-xs font-normal text-slate-500">({pMixed}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Comment-Only</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {loc.commentOnly} <span className="text-xs font-normal text-slate-500">({pComment}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Blank Lines</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {loc.blank} <span className="text-xs font-normal text-slate-500">({pBlank}%)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Total Physical Lines: </span>
            <span className="font-bold text-slate-900 dark:text-white">{loc.totalPhysical}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Non-Empty Lines (Code + Comments): </span>
            <span className="font-bold text-slate-900 dark:text-white">{loc.nonEmpty}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Comment Ratio (Documentation Density): </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{loc.commentRatio}%</span>
          </div>
        </div>
      </div>

      {/* Line-by-Line Attribution Explorer */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Line Attribution Explorer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any line to navigate directly to it in the code editor.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['all', 'code', 'comment', 'code_and_comment', 'blank'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat === 'all' ? 'All' :
                 cat === 'code' ? 'Code' :
                 cat === 'comment' ? 'Comment' :
                 cat === 'code_and_comment' ? 'Mixed' : 'Blank'}
              </button>
            ))}
          </div>
        </div>

        {/* Lines Table */}
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3 w-16 text-right">Line #</th>
                <th className="py-2 px-3 w-32">Classification</th>
                <th className="py-2 px-4">Raw Content</th>
                <th className="py-2 px-3 w-16 text-center">Jump</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-mono">
              {filteredLines.map((line) => {
                const badge =
                  line.category === 'code' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                  line.category === 'comment' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  line.category === 'code_and_comment' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                  'bg-slate-500/10 text-slate-500';

                return (
                  <tr
                    key={line.lineNumber}
                    onClick={() => onNavigateToLine(line.lineNumber)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 px-3 text-right text-slate-400 select-none">
                      {line.lineNumber}
                    </td>
                    <td className="py-1.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge}`}>
                        {line.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-1.5 px-4 text-slate-800 dark:text-slate-200 truncate max-w-md">
                      {line.content || <span className="text-slate-400 italic font-sans">(blank line)</span>}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 inline-block transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
