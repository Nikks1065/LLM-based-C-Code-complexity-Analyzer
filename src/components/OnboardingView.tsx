/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  FileCode,
  Terminal,
} from 'lucide-react';
import { OnboardingGuideData } from '../types/repomind';

interface OnboardingViewProps {
  guide: OnboardingGuideData;
  onOpenFileInExplorer: (path: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  guide,
  onOpenFileInExplorer,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex],
    }));
  };

  const steps = [
    {
      title: '1. Project Purpose & High-Level Mission',
      content: guide.overview,
    },
    {
      title: '2. Technology Stack & Framework Choices',
      content: `Built primarily with: ${guide.techStack.join(', ')}. Leverages modern typed interfaces and decoupled modules.`,
    },
    {
      title: '3. Folder Structure & Architecture Layout',
      content: guide.folderStructureExplanation,
    },
    {
      title: '4. Local Setup & Boot Sequence',
      items: guide.setupInstructions,
    },
    {
      title: '5. Application Entry Points',
      items: guide.entryPoints,
      isFileLinks: true,
    },
    {
      title: '6. Core Domain Modules',
      modules: guide.coreModules,
    },
    {
      title: '7. Request & Execution Flow',
      content: guide.executionFlow,
    },
    {
      title: '8. API Communication Architecture',
      content: guide.apiCommunicationFlow,
    },
    {
      title: '9. Database & Storage Schemas',
      content: guide.databaseStructure,
    },
    {
      title: '10. Top Files to Read First & Suggested Learning Path',
      topFiles: guide.topFilesToReadFirst,
      learningPath: guide.suggestedLearningPath,
    },
  ];

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="h-4 w-4" />
            Developer Onboarding Assistant
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            10-Step Codebase Ramp-Up Guide
          </h1>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            Fast-track new engineers onto this repository with structured architectural milestones.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 min-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Ramp-up Progress</span>
            <span className="font-bold text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {completedCount} of {steps.length} milestones checked
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = !!completedSteps[idx];
          return (
            <div
              key={idx}
              className={`rounded-xl border p-5 transition-all ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStep(idx)}
                    className="shrink-0 text-slate-400 hover:text-white transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </button>
                  <h3 className={`text-sm font-bold ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                    {step.title}
                  </h3>
                </div>

                <button
                  onClick={() => toggleStep(idx)}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {isDone ? 'Mark unread' : 'Mark complete'}
                </button>
              </div>

              <div className="pl-8 text-xs text-slate-300 space-y-3">
                {step.content && (
                  <p className="leading-relaxed text-slate-300">{step.content}</p>
                )}

                {step.items && (
                  <div className="space-y-1.5 font-mono">
                    {step.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80"
                      >
                        <div className="flex items-center gap-2">
                          {step.isFileLinks ? (
                            <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                          ) : (
                            <Terminal className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          <span className="text-slate-200 text-xs">{item}</span>
                        </div>
                        {step.isFileLinks && (
                          <button
                            onClick={() => onOpenFileInExplorer(item)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-sans font-medium"
                          >
                            Inspect &rarr;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {step.modules && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {step.modules.map((mod, modIdx) => (
                      <div key={modIdx} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-1.5">
                        <span className="font-bold text-white text-xs">{mod.name}</span>
                        <p className="text-[11px] text-slate-400">{mod.description}</p>
                        <div className="space-y-1 pt-1">
                          {mod.files.map((mf) => (
                            <button
                              key={mf}
                              onClick={() => onOpenFileInExplorer(mf)}
                              className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-400 hover:text-indigo-300 truncate w-full text-left"
                            >
                              <FileCode className="h-3 w-3 shrink-0" />
                              <span className="truncate">{mf}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.topFiles && (
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block">
                      Recommended First Reads
                    </span>
                    <div className="space-y-1.5">
                      {step.topFiles.map((tf, tfIdx) => (
                        <div
                          key={tfIdx}
                          className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800"
                        >
                          <div>
                            <span className="font-mono text-xs font-semibold text-indigo-300 block">
                              {tf.path}
                            </span>
                            <span className="text-[11px] text-slate-400">{tf.reason}</span>
                          </div>
                          <button
                            onClick={() => onOpenFileInExplorer(tf.path)}
                            className="rounded bg-indigo-600/20 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors shrink-0"
                          >
                            Read File
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step.learningPath && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block mb-1.5">
                      Suggested Learning Roadmap
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                      {step.learningPath.map((item, lpIdx) => (
                        <li key={lpIdx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
