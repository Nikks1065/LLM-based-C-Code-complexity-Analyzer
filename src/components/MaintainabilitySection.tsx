import React from 'react';
import { Gauge, Info, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MaintainabilityMetrics } from '../types/analyzer.ts';

interface MaintainabilitySectionProps {
  maintainability: MaintainabilityMetrics;
}

export const MaintainabilitySection: React.FC<MaintainabilitySectionProps> = ({ maintainability }) => {
  const score = maintainability.normalizedScore;

  const color =
    score >= 85 ? 'text-emerald-500' :
    score >= 65 ? 'text-amber-500' :
    'text-rose-500';

  const strokeColor =
    score >= 85 ? '#10b981' :
    score >= 65 ? '#f59e0b' :
    '#f43f5e';

  // SVG circular gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Overview & Academic Formula Banner */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Software Maintainability Index (MI)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Composite index combining Halstead Volume, Cyclomatic Complexity, Lines of Code, and Comment Density.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300">
          <div className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            MI = 171 - 5.2 × ln(V) - 0.23 × G - 16.2 × ln(LOC) + 50 × sin(√(2.4 × perCM))
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Normalized to a 0–100 scale: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">MI_norm = max(0, min(100, MI_raw × 100 / 171))</code>.
          </p>
          <div className="mt-2 text-[11px] text-slate-500 italic">
            Reference: {maintainability.citation}
          </div>
        </div>
      </div>

      {/* Main Score Gauge & Interpretation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge Visual */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="#e2e8f0"
                className="dark:stroke-slate-700"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold font-mono ${color}`}>
                {score}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              score >= 85 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
              score >= 65 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}>
              {maintainability.category}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Raw Score: {maintainability.rawScore} (Pre-normalized)
            </p>
          </div>
        </div>

        {/* Threshold Interpretation Guide */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Industry Benchmark Thresholds (Microsoft & SEI Standard)
          </h3>

          <div className="space-y-3 text-xs">
            <div className={`p-3.5 rounded-lg border transition-all ${
              score >= 85 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  85 – 100: High Maintainability (Green)
                </span>
                {score >= 85 && <span className="text-[11px] font-bold">Current Code Rating</span>}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Code is easily readable, testable, and maintainable. Low cognitive complexity and well-bounded vocabulary. Low technical debt.
              </p>
            </div>

            <div className={`p-3.5 rounded-lg border transition-all ${
              score >= 65 && score < 85 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  65 – 84: Moderate Maintainability (Yellow)
                </span>
                {score >= 65 && score < 85 && <span className="text-[11px] font-bold">Current Code Rating</span>}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Acceptable for specialized algorithmic kernels, but contains moderate branching or elevated LOC. Refactoring candidate if modifications are frequent.
              </p>
            </div>

            <div className={`p-3.5 rounded-lg border transition-all ${
              score < 65 ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  0 – 64: Low Maintainability / High Debt (Red)
                </span>
                {score < 65 && <span className="text-[11px] font-bold">Current Code Rating</span>}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                High risk of regression during code modifications. Severe nesting, oversized functions, or sparse documentation. Urgent refactoring recommended.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Substitution Log */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          Step-by-Step Mathematical Substitution
        </h3>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {maintainability.stepByStepSubstitution.join('\n')}
        </div>
      </div>

      {/* Documented Limitations */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-500" />
          Assumptions, Sensitivity, and Limitations of the SEI Formula
        </h3>
        <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          {maintainability.limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
