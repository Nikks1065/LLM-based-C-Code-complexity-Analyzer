/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Code,
} from 'lucide-react';
import { GeneratedDocs } from '../types/repomind';

interface DocumentationViewProps {
  docs: GeneratedDocs;
  repoFullName: string;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ docs, repoFullName }) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'architectureDoc' | 'apiDoc' | 'techStackSpec'>('readme');
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const currentContent = docs[activeTab] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${repoFullName.replace('/', '-')}-${activeTab}.md`;
    const blob = new Blob([currentContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'readme', label: 'README.md', icon: '📄' },
    { id: 'architectureDoc', label: 'Architecture Guide', icon: '🗺️' },
    { id: 'apiDoc', label: 'API Specifications', icon: '⚡' },
    { id: 'techStackSpec', label: 'Tech Stack Spec', icon: '📦' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="h-4 w-4" />
            Automatic Documentation Engine
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Grounded Project Documentation
          </h1>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            Synthesized directly from analyzed source code, manifests, and architecture graphs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Code className="h-3.5 w-3.5" />
            <span>{showRaw ? 'Rendered View' : 'Raw Markdown'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 min-h-[400px]">
        {showRaw ? (
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {currentContent}
          </pre>
        ) : (
          <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4">
            {currentContent.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                    {block.replace('# ', '')}
                  </h1>
                );
              }
              if (block.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-base font-bold text-indigo-300 mt-4">
                    {block.replace('## ', '')}
                  </h2>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-sm font-semibold text-slate-200 mt-3">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('```')) {
                const codeText = block.replace(/```[a-z]*\n?/g, '');
                return (
                  <pre key={idx} className="font-mono text-xs bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto">
                    {codeText}
                  </pre>
                );
              }
              if (block.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1 text-slate-300 italic bg-indigo-950/20 rounded-r">
                    {block.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {block}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
