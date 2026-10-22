import React from 'react';
import {
  FileText,
  GitBranch,
  Atom,
  Gauge,
  Clock,
  HardDrive,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CompleteAnalysisResult } from '../types/analyzer.ts';

interface OverviewSectionProps {
  analysis: CompleteAnalysisResult;
  onSelectTab: (tabId: string) => void;
  onNavigateToLine: (line: number) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  analysis,
  onSelectTab,
  onNavigateToLine
}) => {
  const {
    programLOC,
    programCyclomatic,
    programHalstead,
    programMaintainability,
    programTimeComplexity,
    programSpaceComplexity,
    findings,
    functions,
    fileDetails
  } = analysis;

  const highFindings = findings.filter(f => f.severity === 'High');
  const mediumFindings = findings.filter(f => f.severity === 'Medium');

  // Determine Maintainability badge color
  const miScore = programMaintainability.normalizedScore;
  const miColor = miScore >= 80 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                  miScore >= 65 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                  'text-rose-500 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="space-y-6">
      {/* Top Banner: File Summary & Parsing Status */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-xl p-5 shadow-sm text-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Static Analysis Engine
              </span>
              <span className="text-xs text-slate-400">
                Parsed {functions.length} C function{functions.length !== 1 ? 's' : ''} in {fileDetails.byteSize} bytes
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Analysis Overview: {fileDetails.fileName}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              All displayed metrics originate from deterministic parsing and mathematical formulas.
              Click any summary card to inspect step-by-step intermediate calculations, formula substitutions, and source code evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('ai-refactor')}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Refactoring</span>
            </button>
            <button
              onClick={() => onSelectTab('findings')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{findings.length} Findings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Gemini AI Integration Showcase */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-xl p-5 shadow-sm text-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Google Gemini AI Integration</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Grounded in Deterministic Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gemini AI works directly alongside the static analyzer to explain metrics, answer questions, and perform automated refactoring.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: AI Code Review */}
          <div
            onClick={() => onSelectTab('ai-section')}
            className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-400/50 hover:bg-slate-800/80 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                1. AI Code Review
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              Automated architectural review covering modularity, error-handling, edge cases, and safety.
            </p>
            <span className="text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
              Open AI Review &rarr;
            </span>
          </div>

          {/* Card 2: Interactive AI Chat */}
          <div
            onClick={() => onSelectTab('ai-section')}
            className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-400/50 hover:bg-slate-800/80 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                2. Interactive Q&A Assistant
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              Chat with Gemini about Big-O complexity, loop structures, and pointers in your C code.
            </p>
            <span className="text-[11px] font-semibold text-violet-400 group-hover:text-violet-300 flex items-center gap-1">
              Ask AI Questions &rarr;
            </span>
          </div>

          {/* Card 3: AI Refactoring */}
          <div
            onClick={() => onSelectTab('ai-refactor')}
            className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-400/50 hover:bg-slate-800/80 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                3. Intelligent AI Refactoring
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              Propose optimized C code with side-by-side diffs and real-time metric delta recalculations.
            </p>
            <span className="text-[11px] font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
              Launch Refactor Studio &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. Lines of Code */}
        <div
          onClick={() => onSelectTab('loc')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Lines of Code (LOC)
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {programLOC.totalPhysical}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">physical lines</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Non-Empty Code:</span>
              <span className="font-semibold">{programLOC.nonEmpty}</span>
            </div>
            <div className="flex justify-between">
              <span>Comment Density:</span>
              <span className="font-semibold">{programLOC.commentRatio}%</span>
            </div>
          </div>
        </div>

        {/* 2. Cyclomatic Complexity */}
        <div
          onClick={() => onSelectTab('cyclomatic')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              Cyclomatic (McCabe)
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {programCyclomatic.maxComplexity}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">peak score</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Average Complexity:</span>
              <span className="font-semibold">{programCyclomatic.averageComplexity}</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Classification:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{programCyclomatic.overallRisk}</span>
            </div>
          </div>
        </div>

        {/* 3. Maintainability Index */}
        <div
          onClick={() => onSelectTab('maintainability')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              Maintainability (MI)
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {programMaintainability.normalizedScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 text-xs">
            <div className={`px-2 py-0.5 rounded border text-center font-semibold text-[11px] ${miColor}`}>
              {programMaintainability.category}
            </div>
          </div>
        </div>

        {/* 4. Time Complexity */}
        <div
          onClick={() => onSelectTab('time-complexity')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Time Complexity
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {programTimeComplexity.overallBigO}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
            {programTimeComplexity.explanation}
          </div>
        </div>

        {/* 5. Space Complexity */}
        <div
          onClick={() => onSelectTab('space-complexity')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-500" />
              Space Complexity
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
              {programSpaceComplexity.overallBigO}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">auxiliary</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
            {programSpaceComplexity.explanation}
          </div>
        </div>

        {/* 6. Halstead Volume */}
        <div
          onClick={() => onSelectTab('halstead')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-purple-500" />
              Halstead Science
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {programHalstead.volume}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">bits volume</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Difficulty (D):</span>
              <span className="font-semibold">{programHalstead.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Bugs (B):</span>
              <span className="font-semibold">{programHalstead.estimatedBugs}</span>
            </div>
          </div>
        </div>

        {/* 7. Code Quality Findings */}
        <div
          onClick={() => onSelectTab('findings')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Quality Findings
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {findings.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">issues logged</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            {highFindings.length > 0 ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                {highFindings.length} High
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> 0 Critical
              </span>
            )}
            {mediumFindings.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                {mediumFindings.length} Medium
              </span>
            )}
          </div>
        </div>

        {/* 8. Function Summary */}
        <div
          onClick={() => onSelectTab('functions')}
          className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              Functions Detected
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {functions.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">units</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 truncate">
            {functions.map(f => f.name).join(', ') || 'No functions identified'}
          </div>
        </div>
      </div>

      {/* Function Highlights Table */}
      {functions.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Functions Profile Summary
            </h3>
            <button
              onClick={() => onSelectTab('functions')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Function</th>
                  <th className="py-2.5 px-3">Lines</th>
                  <th className="py-2.5 px-3">LOC</th>
                  <th className="py-2.5 px-3">Cyclomatic (M)</th>
                  <th className="py-2.5 px-3">Maintainability</th>
                  <th className="py-2.5 px-3">Time Complexity</th>
                  <th className="py-2.5 px-3">Space</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                {functions.map((fn) => (
                  <tr
                    key={fn.name}
                    onClick={() => onNavigateToLine(fn.startLine)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-blue-600 dark:text-blue-400 font-sans">
                      {fn.returnType} {fn.name}()
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      L{fn.startLine} - L{fn.endLine}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {fn.loc.totalPhysical}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {fn.cyclomatic.score}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        fn.maintainability.normalizedScore >= 80 ? 'text-emerald-500 bg-emerald-500/10' :
                        fn.maintainability.normalizedScore >= 65 ? 'text-amber-500 bg-amber-500/10' :
                        'text-rose-500 bg-rose-500/10'
                      }`}>
                        {fn.maintainability.normalizedScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                      {fn.timeComplexity.asymptoticNotation}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400">
                      {fn.spaceComplexity.asymptoticNotation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
