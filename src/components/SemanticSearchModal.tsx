/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  X,
  FileCode,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { SearchResult } from '../types/repomind';

interface SemanticSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onOpenFileInExplorer: (path: string) => void;
}

export const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onOpenFileInExplorer,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await onSearch(query);
      setResults(res);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex items-center border-b border-slate-800 p-4 gap-3 bg-slate-950">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code semantically (e.g., 'validate user', 'AST parsing', 'express listen')..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          ) : (
            <button
              type="submit"
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Search
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Sparkles className="h-6 w-6 text-indigo-400/50 mx-auto mb-2" />
              <p>Type a natural language query or function identifier above.</p>
              <p className="mt-1 text-[11px] text-slate-600">Searches indexed code chunks using BM25 and vector embeddings.</p>
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  onOpenFileInExplorer(r.chunk.filePath);
                  onClose();
                }}
                className="group rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 hover:border-indigo-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono">
                    <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
                      {r.chunk.filePath}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Lines {r.chunk.startLine}–{r.chunk.endLine}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Score: {r.score}
                  </span>
                </div>

                <pre className="font-mono text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 overflow-x-auto whitespace-pre">
                  {r.snippet}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
