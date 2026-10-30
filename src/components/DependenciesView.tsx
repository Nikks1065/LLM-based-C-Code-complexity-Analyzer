/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Boxes,
  Package,
  Search,
} from 'lucide-react';
import { DependencyItem } from '../types/repomind';

interface DependenciesViewProps {
  dependencies: DependencyItem[];
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({ dependencies }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = dependencies.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['all', 'framework', 'ui', 'database', 'security', 'testing', 'tooling', 'utility'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Boxes className="h-4 w-4" />
          Manifest & Dependency Analysis
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Package Dependencies & Risk Audit
        </h1>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed max-w-3xl">
          Parsed from project manifest files (<code>package.json</code>, <code>requirements.txt</code>). Identifies runtime versus dev tooling and framework ecosystems.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dependencies..."
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
            No dependencies matched your filter.
          </div>
        ) : (
          filtered.map((dep) => (
            <div
              key={dep.name}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-400" />
                  <span className="font-mono text-xs font-bold text-white truncate max-w-[160px]">
                    {dep.name}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {dep.version}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="capitalize">{dep.type} dependency</span>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20 uppercase font-mono">
                  {dep.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
