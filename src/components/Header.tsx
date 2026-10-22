import React from 'react';
import {
  Code2,
  Cpu,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  Sun,
  Moon,
  FolderOpen,
  Edit3,
  FileText
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets.ts';

interface HeaderProps {
  onSelectPreset: (presetId: string) => void;
  selectedPresetId: string;
  onAnalyze: () => void;
  onReset: () => void;
  onClearCode?: () => void;
  onSelectTab?: (tabId: string) => void;
  isAnalyzing: boolean;
  onOpenExport: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  selectedPresetId,
  onAnalyze,
  onReset,
  onClearCode,
  onSelectTab,
  isAnalyzing,
  onOpenExport,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                C Code Intelligence Analyzer
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Static Engine + AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              Deterministic Static Complexity Analysis & Intelligent Refactoring Assistant
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              aria-label="Select C Sample Preset"
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[170px] sm:max-w-[210px] truncate"
            >
              <option value="custom">Custom C Code</option>
              {SAMPLE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Write Custom Code Button */}
          {onClearCode && (
            <button
              onClick={onClearCode}
              title="Clear editor to type your own C code manually"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">Write Code</span>
            </button>
          )}

          {/* Gemini AI Quick Navigation */}
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('ai-section')}
              title="Open Gemini AI Code Review, Complexity Q&A, and Refactoring"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="hidden sm:inline">Gemini AI</span>
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            title="Reset to default code"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenExport}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

          {/* Academic Project Report (Full 15-20 page Document) */}
          <a
            href="/project-report.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Open comprehensive 15-20 page Academic Project Report (Print to PDF)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden lg:inline">Project Report (PDF/Doc)</span>
            <span className="inline lg:hidden">Report</span>
          </a>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle Dark/Light Mode"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Run Analysis CTA */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
