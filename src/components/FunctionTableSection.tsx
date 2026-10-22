import React, { useState } from 'react';
import { Layers, Search, ArrowUpDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { FunctionAnalysis } from '../types/analyzer.ts';

interface FunctionTableSectionProps {
  functions: FunctionAnalysis[];
  onNavigateToLine: (line: number) => void;
}

type SortField = 'name' | 'loc' | 'cc' | 'mi' | 'volume';

export const FunctionTableSection: React.FC<FunctionTableSectionProps> = ({
  functions,
  onNavigateToLine
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('cc');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = functions.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.returnType.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortField === 'loc') comparison = a.loc.totalPhysical - b.loc.totalPhysical;
    else if (sortField === 'cc') comparison = a.cyclomatic.score - b.cyclomatic.score;
    else if (sortField === 'mi') comparison = a.maintainability.normalizedScore - b.maintainability.normalizedScore;
    else if (sortField === 'volume') comparison = a.halstead.volume - b.halstead.volume;

    return sortAsc ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            Function-Level Metrics & Architecture Inventory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparative analysis of all {functions.length} C function{functions.length !== 1 ? 's' : ''} in the parsed source.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search function by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Main Sortable Table */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-500" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Function</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Span</th>
                <th className="py-3 px-3 cursor-pointer hover:text-blue-500" onClick={() => toggleSort('loc')}>
                  <div className="flex items-center gap-1">
                    <span>LOC</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-blue-500" onClick={() => toggleSort('cc')}>
                  <div className="flex items-center gap-1">
                    <span>Cyclomatic (M)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-blue-500" onClick={() => toggleSort('mi')}>
                  <div className="flex items-center gap-1">
                    <span>Maintainability</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Time Big-O</th>
                <th className="py-3 px-3">Space Big-O</th>
                <th className="py-3 px-3 cursor-pointer hover:text-blue-500" onClick={() => toggleSort('volume')}>
                  <div className="flex items-center gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Jump</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
              {sorted.map((fn) => {
                const mi = fn.maintainability.normalizedScore;
                const miBadge =
                  mi >= 85 ? 'text-emerald-500 bg-emerald-500/10' :
                  mi >= 65 ? 'text-amber-500 bg-amber-500/10' :
                  'text-rose-500 bg-rose-500/10';

                return (
                  <tr
                    key={fn.name}
                    onClick={() => onNavigateToLine(fn.startLine)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-sans font-bold text-blue-600 dark:text-blue-400">
                      <div>{fn.returnType} {fn.name}()</div>
                      <div className="text-[11px] text-slate-400 font-mono font-normal">
                        ({fn.parameters.map(p => `${p.type} ${p.name}`).join(', ') || 'void'})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      L{fn.startLine} - L{fn.endLine}
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white font-bold">
                      {fn.loc.totalPhysical}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">({fn.loc.nonEmpty} code)</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        fn.cyclomatic.score > 15 ? 'bg-rose-500/10 text-rose-500' :
                        fn.cyclomatic.score > 10 ? 'bg-amber-500/10 text-amber-500' :
                        'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        M = {fn.cyclomatic.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${miBadge}`}>
                        {mi}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                      {fn.timeComplexity.asymptoticNotation}
                    </td>
                    <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400">
                      {fn.spaceComplexity.asymptoticNotation}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {fn.halstead.volume}b
                    </td>
                    <td className="py-3 px-3 text-center">
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 inline-block transition-colors" />
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
