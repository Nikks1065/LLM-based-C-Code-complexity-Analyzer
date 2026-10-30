/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CodeReviewFinding } from '../types/repomind';

interface CodeReviewViewProps {
  findings: CodeReviewFinding[];
  onOpenFileInExplorer: (path: string) => void;
}

export const CodeReviewView: React.FC<CodeReviewViewProps> = ({
  findings,
  onOpenFileInExplorer,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4 text-rose-400" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldAlert className="h-4 w-4" />
          Intelligent Code Review & Bug Detection
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Automated Code Auditing & Risk Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed max-w-3xl">
          Surfaces logical edge cases, error-handling omissions, unhandled null states, cyclomatic bottlenecks, and maintainability concerns with actionable fixes.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          {['all', 'maintainability', 'error-handling', 'performance', 'security'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">No findings matched your filter criteria.</p>
            <p className="text-slate-500 mt-1">Code conforms to baseline threshold requirements.</p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3.5 transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {getSeverityIcon(finding.severity)}
                  <h3 className="text-sm font-bold text-white">{finding.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getSeverityBadge(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                    {finding.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    Confidence: <strong className="text-emerald-400">{Math.round(finding.confidence * 100)}%</strong>
                  </span>
                  <button
                    onClick={() => onOpenFileInExplorer(finding.filePath)}
                    className="flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300"
                  >
                    <span>{finding.filePath}{finding.lineStart ? `:${finding.lineStart}` : ''}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {finding.snippet && (
                <pre className="font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-slate-300 overflow-x-auto">
                  {finding.snippet}
                </pre>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Explanation</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{finding.explanation}</p>
                </div>

                <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Suggested Remediation
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{finding.suggestedFix}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
