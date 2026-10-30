/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode,
  Search,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import { FileComplexity } from '../types/repomind';

interface CodeExplorerViewProps {
  files: { path: string; content: string }[];
  fileComplexities: FileComplexity[];
  onAskAiAboutFile: (path: string, codeSnippet?: string) => void;
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({
  files,
  fileComplexities,
  onAskAiAboutFile,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(files[0]?.path || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedFile = files.find(f => f.path === selectedPath) || files[0];
  const selectedComplexity = fileComplexities.find(fc => fc.filePath === selectedPath);

  const filteredFiles = files.filter(f =>
    f.path.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = selectedFile?.content.split(/\r?\n/) || [];

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden bg-slate-950">
      <div className="w-full lg:w-72 shrink-0 border-r border-slate-800 bg-slate-900/40 flex flex-col h-64 lg:h-full">
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter files..."
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>{filteredFiles.length} files</span>
            <span>Click to inspect</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
          {filteredFiles.map((file) => {
            const isSelected = file.path === selectedPath;
            const complexity = fileComplexities.find(c => c.filePath === file.path);
            const fileName = file.path.split('/').pop() || file.path;
            const dirName = file.path.substring(0, file.path.lastIndexOf('/'));

            return (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileCode className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">
                    {dirName && <span className="text-slate-500 text-[10px]">{dirName}/</span>}
                    {fileName}
                  </span>
                </div>
                {complexity && (
                  <span
                    className={`shrink-0 text-[10px] px-1 rounded ${
                      complexity.cyclomaticComplexity > 10
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    CC {complexity.cyclomaticComplexity}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-white">
              {selectedPath}
            </span>
            {selectedComplexity && (
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-500/30 uppercase">
                {selectedComplexity.language}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAiAboutFile(selectedPath, selectedFile?.content.slice(0, 1000))}
              className="flex items-center gap-1.5 rounded bg-indigo-600/20 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors border border-indigo-500/30"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Ask AI about file
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {selectedComplexity && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 border-b border-slate-800/80 bg-slate-900/30 px-4 py-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">LOC / SLOC</span>
              <span className="font-mono font-semibold text-slate-200">{selectedComplexity.loc} / {selectedComplexity.sloc}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Cyclomatic V(G)</span>
              <span className={`font-mono font-semibold ${selectedComplexity.cyclomaticComplexity > 10 ? 'text-rose-400' : 'text-indigo-400'}`}>
                {selectedComplexity.cyclomaticComplexity}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Maintainability</span>
              <span className="font-mono font-semibold text-emerald-400">{selectedComplexity.maintainabilityIndex}/100</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Est. Time Big-O</span>
              <span className="font-mono font-semibold text-amber-300">{selectedComplexity.estimatedTimeComplexity}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Est. Space Big-O</span>
              <span className="font-mono font-semibold text-cyan-300">{selectedComplexity.estimatedSpaceComplexity}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Functions</span>
              <span className="font-mono font-semibold text-slate-200">{selectedComplexity.functions.length}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs leading-relaxed">
          <div className="flex min-w-full">
            <div className="shrink-0 select-none border-r border-slate-800/80 bg-slate-950/80 py-3 text-right text-slate-600 font-mono pr-3 pl-3">
              {lines.map((_, i) => (
                <div key={i} className="leading-5 text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-x-auto py-3 pl-4 pr-6">
              {lines.map((line, i) => (
                <div key={i} className="leading-5 whitespace-pre text-slate-200 hover:bg-slate-900/60">
                  {line || ' '}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
