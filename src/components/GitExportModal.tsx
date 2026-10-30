/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Terminal,
  X,
  Copy,
  Check,
  Download,
  GitBranch,
} from 'lucide-react';
import { RepositoryAnalysis } from '../types/repomind';

interface GitExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: RepositoryAnalysis | null;
}

export const GitExportModal: React.FC<GitExportModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const repoName = analysis?.repo.repo || 'code-complexity-analyzer';

  const gitCommands = [
    {
      title: '1. Check current status & branch',
      cmd: `git status\ngit checkout -b feature/repomind-transformation`,
    },
    {
      title: '2. Stage all upgraded RepoMind files',
      cmd: `git add .`,
    },
    {
      title: '3. Commit with semantic description',
      cmd: `git commit -m "feat: transform GenAI Code Complexity Analyzer into RepoMind AI platform"`,
    },
    {
      title: '4. Push feature branch to GitHub',
      cmd: `git push -u origin feature/repomind-transformation`,
    },
  ];

  const handleCopy = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repomind-analysis-${repoName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Integration & Push Guide</h3>
              <p className="text-xs text-slate-400">Upgrade workflow for {repoName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-indigo-300">
            <GitBranch className="h-4 w-4" />
            <span>Target Feature Branch: <code>feature/repomind-transformation</code></span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Per the safety directive, existing Git history and default branch (<code>main</code>) are preserved. Changes are isolated to the feature branch for pull request review.
          </p>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Terminal Commands for Your Local Git Clone
          </span>

          {gitCommands.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">{item.title}</span>
                <button
                  onClick={() => handleCopy(item.cmd, i)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-xs text-indigo-300 bg-slate-900/80 p-2.5 rounded border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                {item.cmd}
              </pre>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-400">Export structured analysis report</span>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Analysis JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
