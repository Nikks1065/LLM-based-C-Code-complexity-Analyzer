/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GitBranch,
  Star,
  GitFork,
  Search,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
  Terminal,
} from 'lucide-react';
import { RepoMetadata } from '../types/repomind';

interface NavbarProps {
  repo: RepoMetadata | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenGitModal: () => void;
  onSelectSampleRepo: (repoFullName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  repo,
  searchQuery,
  onSearchChange,
  onOpenSearch,
  isDark,
  onToggleTheme,
  onOpenGitModal,
  onSelectSampleRepo,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg">RepoMind</span>
              <span className="hidden sm:inline-block rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                AI + AST
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium">Understand. Explore. Analyze. Build.</p>
          </div>
        </div>

        {repo && (
          <div className="hidden lg:flex items-center gap-3 border-l border-slate-800 pl-4">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <span>{repo.fullName}</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-indigo-400" />
                {repo.selectedBranch || repo.defaultBranch}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400" />
                {repo.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3 text-slate-400" />
                {repo.forks.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenSearch();
            }}
            placeholder="Semantic search (e.g. 'auth handler', 'compute complexity')..."
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950/70 py-1.5 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <kbd className="absolute right-2.5 top-2.5 rounded border border-slate-700 bg-slate-800 px-1.5 text-[10px] text-slate-400">
            ↵
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <select
          aria-label="Load Sample Repository"
          onChange={(e) => {
            if (e.target.value) onSelectSampleRepo(e.target.value);
          }}
          defaultValue=""
          className="rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors focus:border-indigo-500 focus:outline-none"
        >
          <option value="" disabled>
            ⚡ Load Sample Repo
          </option>
          <option value="nikhilnitt/code-complexity-analyzer">code-complexity-analyzer</option>
          <option value="expressjs/express">expressjs/express</option>
        </select>

        <button
          onClick={onOpenGitModal}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-all shadow-sm"
          title="Git Push & Integration Instructions"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Git Integration</span>
        </button>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle Color Theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};
