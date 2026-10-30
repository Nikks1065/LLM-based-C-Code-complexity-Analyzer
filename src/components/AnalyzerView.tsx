/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SearchCode,
  Github,
  GitBranch,
  Shield,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { parseGitHubUrl } from '../utils/githubService';

interface AnalyzerViewProps {
  currentUrl: string;
  isAnalyzing: boolean;
  analysisProgress: string;
  onAnalyze: (url: string, branch?: string, token?: string) => void;
  onSelectSampleRepo: (repoFullName: string) => void;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  currentUrl,
  isAnalyzing,
  analysisProgress,
  onAnalyze,
  onSelectSampleRepo,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || 'https://github.com/nikhilnitt/code-complexity-analyzer');
  const [branch, setBranch] = useState('');
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const validation = parseGitHubUrl(inputUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.isValid) {
      onAnalyze(inputUrl, branch || undefined, token || undefined);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <SearchCode className="h-4 w-4" />
          Repository Ingestion & Indexing
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Analyze Any GitHub Repository
        </h1>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed">
          RepoMind connects directly to GitHub to parse file trees, run deep static AST complexity analysis, extract dependencies, and build a vector-indexed RAG assistant.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              GitHub Repository URL or Shorthand
            </label>
            <div className="relative">
              <Github className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://github.com/username/repository or username/repository"
                className={`w-full rounded-lg border py-2.5 pl-11 pr-4 text-sm font-mono text-slate-200 placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 ${
                  inputUrl && !validation.isValid
                    ? 'border-rose-500/80 bg-rose-950/20 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700/80 bg-slate-950/80 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
            </div>
            {inputUrl && !validation.isValid ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
                {validation.error}
              </p>
            ) : validation.isValid ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Valid target: <strong className="font-mono">{validation.owner}/{validation.repo}</strong>
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Branch <span className="text-slate-500 font-normal">(Optional, defaults to main/master)</span>
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. main, master, dev"
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  GitHub Token <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {showTokenInput ? 'Hide' : 'Add token for 5,000 req/hr'}
                </button>
              </div>
              {showTokenInput ? (
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_... personal access token"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2">
                  Public repos work without a token. Tokens are stored only in memory and never logged.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!validation.isValid || isAnalyzing}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white shadow-lg transition-all ${
                !validation.isValid || isAnalyzing
                  ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{analysisProgress || 'Indexing repository files...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Start Deep Repository Analysis & RAG Indexing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Instant Sample Repositories (Pre-Indexed & Zero-Latency)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onSelectSampleRepo('nikhilnitt/code-complexity-analyzer')}
            className="group rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4 hover:border-indigo-500 hover:bg-indigo-950/30 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-indigo-300">nikhilnitt/code-complexity-analyzer</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">YOUR REPO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              The existing GenAI-Based Code Complexity Analyzer codebase: AST metrics, cyclomatic score, Halstead volume, and Big-O heuristics.
            </p>
            <div className="flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
              Load & inspect transformed architecture <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </div>
          </div>

          <div
            onClick={() => onSelectSampleRepo('expressjs/express')}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-white">expressjs/express</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">65k stars</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Minimalist Node.js web framework. Perfect for testing routing architectures and middleware composition.
            </p>
            <div className="flex items-center text-xs font-medium text-slate-300 group-hover:text-white">
              Load repository <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
