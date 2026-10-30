/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileCode2,
  GitBranch,
  Star,
  GitFork,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { RepositoryAnalysis } from '../types/repomind';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  analysis: RepositoryAnalysis | null;
  onNavigate: (tab: NavTab) => void;
  onSelectSampleRepo: (repoFullName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analysis,
  onNavigate,
  onSelectSampleRepo,
}) => {
  if (!analysis) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          <Layers className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Repository Analyzed Yet</h2>
        <p className="max-w-md text-sm text-slate-400 mb-6">
          Enter a public GitHub repository URL or choose a pre-indexed sample project to explore architecture, calculate complexity, and chat with the codebase.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => onSelectSampleRepo('nikhilnitt/code-complexity-analyzer')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
          >
            <Zap className="h-4 w-4" />
            Analyze code-complexity-analyzer
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Enter Custom GitHub URL
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const { repo, totalFiles, totalLOC, overallMaintainability, avgCyclomaticComplexity, languageStats, topComplexFiles, codeReviewFindings } = analysis;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                {repo.primaryLanguage}
              </span>
              <span className="text-xs text-slate-400">License: {repo.license || 'MIT'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{repo.fullName}</h1>
            <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">{repo.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
            >
              Ask AI About Repo
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Browse Code
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            <span>Branch: <strong className="text-slate-200">{repo.selectedBranch || repo.defaultBranch}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <span>Stars: <strong className="text-slate-200">{repo.stars.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-slate-400" />
            <span>Forks: <strong className="text-slate-200">{repo.forks.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Updated: <strong className="text-slate-200">{new Date(repo.updatedAt).toLocaleDateString()}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Codebase Scale</span>
            <FileCode2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLOC.toLocaleString()} <span className="text-xs font-normal text-slate-400">LOC</span></div>
          <p className="mt-1 text-xs text-slate-400">{totalFiles} source files parsed & indexed</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Maintainability Index</span>
            <span className={`h-2.5 w-2.5 rounded-full ${overallMaintainability >= 75 ? 'bg-emerald-400' : overallMaintainability >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} />
          </div>
          <div className="text-2xl font-bold text-white">{overallMaintainability}<span className="text-xs font-normal text-slate-400">/100</span></div>
          <p className="mt-1 text-xs text-slate-400">
            Rating: <strong className={overallMaintainability >= 75 ? 'text-emerald-400' : 'text-amber-400'}>{overallMaintainability >= 75 ? 'High (Clean)' : 'Moderate'}</strong>
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Avg Cyclomatic Complexity</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgCyclomaticComplexity} <span className="text-xs font-normal text-slate-400">V(G)</span></div>
          <p className="mt-1 text-xs text-slate-400">
            {avgCyclomaticComplexity <= 5 ? 'Linear, simple paths' : 'Higher branching logic'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Review Findings</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{codeReviewFindings.length} <span className="text-xs font-normal text-slate-400">items</span></div>
          <p className="mt-1 text-xs text-slate-400">
            {codeReviewFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length} high priority warnings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Language Distribution</h3>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800 mb-4">
            {Object.entries(languageStats).map(([lang, stat], i) => {
              const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
              return (
                <div
                  key={lang}
                  style={{ width: `${Math.max(5, stat.percentage)}%` }}
                  className={`${colors[i % colors.length]} transition-all`}
                  title={`${lang}: ${stat.percentage}% (${stat.loc} LOC)`}
                />
              );
            })}
          </div>

          <div className="space-y-2">
            {Object.entries(languageStats).map(([lang, stat]) => (
              <div key={lang} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                <span className="font-medium text-slate-300 capitalize">{lang}</span>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>{stat.files} files</span>
                  <span>{stat.loc} LOC</span>
                  <span className="font-semibold text-indigo-400 w-10 text-right">{stat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Top Complexity Hotspots</h3>
            <button
              onClick={() => onNavigate('complexity')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Full Analysis &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {topComplexFiles.map((f) => (
              <div
                key={f.filePath}
                onClick={() => onNavigate('complexity')}
                className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                    {f.language}
                  </span>
                  <span className="font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                    {f.filePath}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400">{f.loc} LOC</span>
                  <span className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${f.cyclomaticComplexity > 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                    CC {f.cyclomaticComplexity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
