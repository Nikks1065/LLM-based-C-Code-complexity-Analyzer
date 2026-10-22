import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  GitBranch,
  Atom,
  Gauge,
  Clock,
  HardDrive,
  Layers,
  AlertCircle,
  Sparkles,
  GitCompare,
  Code2,
  LayoutDashboard,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { CodeEditor } from './components/CodeEditor.tsx';
import { OverviewSection } from './components/OverviewSection.tsx';
import { LOCSection } from './components/LOCSection.tsx';
import { CyclomaticSection } from './components/CyclomaticSection.tsx';
import { HalsteadSection } from './components/HalsteadSection.tsx';
import { MaintainabilitySection } from './components/MaintainabilitySection.tsx';
import { TimeComplexitySection } from './components/TimeComplexitySection.tsx';
import { SpaceComplexitySection } from './components/SpaceComplexitySection.tsx';
import { FunctionTableSection } from './components/FunctionTableSection.tsx';
import { FindingsSection } from './components/FindingsSection.tsx';
import { AISection } from './components/AISection.tsx';
import { RefactorComparisonSection } from './components/RefactorComparisonSection.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { SAMPLE_PRESETS } from './data/samplePresets.ts';
import { CompleteAnalysisResult } from './types/analyzer.ts';
import { analyzeCCode } from './analyzer/index.ts';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bubble_sort');
  const [fileName, setFileName] = useState<string>('bubble_sort.c');
  const [code, setCode] = useState<string>(SAMPLE_PRESETS[0].code);
  const [analysis, setAnalysis] = useState<CompleteAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'editor' | 'analysis'>('analysis');

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Run analysis (both client-side fallback and server API)
  const runAnalysis = useCallback(async (source = code, fName = fileName) => {
    setIsAnalyzing(true);
    try {
      // First attempt server endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: source, fileName: fName })
      });

      if (response.ok) {
        const data: CompleteAnalysisResult = await response.json();
        setAnalysis(data);
      } else {
        // Fallback to local deterministic analyzer
        const localData = analyzeCCode(source, fName);
        setAnalysis(localData);
      }
    } catch {
      // Offline or network error fallback
      const localData = analyzeCCode(source, fName);
      setAnalysis(localData);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, fileName]);

  // Initial load analysis
  useEffect(() => {
    runAnalysis(SAMPLE_PRESETS[0].code, 'bubble_sort.c');
  }, [runAnalysis]);

  // Preset switch handler
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      const isPreset = SAMPLE_PRESETS.some(p => p.code === code);
      if (isPreset) {
        setCode('');
      }
      setFileName('custom.c');
      setMobileView('editor');
      return;
    }
    const preset = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCode(preset.code);
      setFileName(`${preset.id}.c`);
      runAnalysis(preset.code, `${preset.id}.c`);
    }
  };

  // Clear / Write own code handler
  const handleClearCode = () => {
    setCode('');
    setFileName('custom.c');
    setSelectedPresetId('custom');
    setMobileView('editor');
  };

  // Reset handler
  const handleReset = () => {
    handleSelectPreset('bubble_sort');
  };

  // File upload handler
  const handleFileUpload = (content: string, name: string) => {
    setCode(content);
    setFileName(name);
    setSelectedPresetId('custom');
    runAnalysis(content, name);
  };

  // Navigate to line in editor
  const handleNavigateToLine = (lineNumber: number) => {
    setActiveLine(lineNumber);
    setMobileView('editor');
  };

  // Accept refactoring
  const handleAcceptRefactoring = (newCode: string) => {
    setCode(newCode);
    setFileName('refactored.c');
    runAnalysis(newCode, 'refactored.c');
    setActiveTab('overview');
  };

  // Global keyboard shortcut (Ctrl+Enter or Cmd+Enter to run analysis)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runAnalysis();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runAnalysis]);

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'loc', label: 'LOC', icon: FileText, badge: analysis?.programLOC.totalPhysical },
    { id: 'cyclomatic', label: 'Cyclomatic (CC)', icon: GitBranch, badge: analysis?.programCyclomatic.maxComplexity },
    { id: 'halstead', label: 'Halstead', icon: Atom },
    { id: 'maintainability', label: 'Maintainability', icon: Gauge, badge: analysis?.programMaintainability.normalizedScore },
    { id: 'time-complexity', label: 'Time Big-O', icon: Clock, badge: analysis?.programTimeComplexity.overallBigO },
    { id: 'space-complexity', label: 'Space Big-O', icon: HardDrive, badge: analysis?.programSpaceComplexity.overallBigO },
    { id: 'functions', label: 'Functions', icon: Layers, badge: analysis?.functions.length },
    { id: 'findings', label: 'Findings', icon: AlertCircle, badge: analysis?.findings.length, alert: (analysis?.findings.length || 0) > 0 },
    { id: 'ai-section', label: 'AI Review & Q&A', icon: Sparkles, isAi: true, badge: 'Gemini AI' },
    { id: 'ai-refactor', label: 'AI Refactoring', icon: GitCompare, isAi: true, badge: 'Diff' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* App Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        selectedPresetId={selectedPresetId}
        onAnalyze={() => runAnalysis()}
        onReset={handleReset}
        onClearCode={handleClearCode}
        onSelectTab={setActiveTab}
        isAnalyzing={isAnalyzing}
        onOpenExport={() => setIsExportOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Mobile Editor / Analysis Switcher */}
      <div className="lg:hidden flex items-center justify-center p-2 bg-slate-200 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 gap-2">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
            mobileView === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          Source Editor ({fileName})
        </button>
        <button
          onClick={() => setMobileView('analysis')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
            mobileView === 'analysis' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          Analysis Panels
        </button>
      </div>

      {/* Main Workspace: Split View */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Code Editor */}
        <div className={`lg:col-span-5 h-[calc(100vh-120px)] sticky top-20 ${mobileView === 'editor' ? 'block' : 'hidden lg:block'}`}>
          <CodeEditor
            code={code}
            onChange={(val) => {
              setCode(val);
              setSelectedPresetId('custom');
            }}
            onClear={handleClearCode}
            activeLine={activeLine}
            diagnostics={analysis?.diagnostics}
            decisionPoints={analysis?.functions.flatMap(f => f.cyclomatic.decisionPoints)}
            allocations={analysis?.functions.flatMap(f => f.spaceComplexity.allocations)}
            fileName={fileName}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Right Column: Tab Navigation & Detailed Analysis Views */}
        <div className={`lg:col-span-7 flex flex-col space-y-4 ${mobileView === 'analysis' ? 'block' : 'hidden lg:block'}`}>
          {/* Scrollable Tab Navigation Bar */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm overflow-x-auto flex items-center gap-1 scrollbar-none sticky top-20 z-30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAi = (tab as any).isAi;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? isAi
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : isAi
                      ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isAi && !isActive ? 'text-indigo-500' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isAi
                          ? 'bg-indigo-500/20 text-indigo-400 font-sans font-semibold'
                          : tab.alert
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="min-h-[500px]">
            {analysis ? (
              <>
                {activeTab === 'overview' && (
                  <OverviewSection
                    analysis={analysis}
                    onSelectTab={(t) => setActiveTab(t)}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'loc' && (
                  <LOCSection
                    loc={analysis.programLOC}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'cyclomatic' && (
                  <CyclomaticSection
                    functions={analysis.functions}
                    programSummary={analysis.programCyclomatic}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'halstead' && (
                  <HalsteadSection
                    halstead={analysis.programHalstead}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'maintainability' && (
                  <MaintainabilitySection
                    maintainability={analysis.programMaintainability}
                  />
                )}

                {activeTab === 'time-complexity' && (
                  <TimeComplexitySection
                    functions={analysis.functions}
                    programTime={analysis.programTimeComplexity}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'space-complexity' && (
                  <SpaceComplexitySection
                    functions={analysis.functions}
                    programSpace={analysis.programSpaceComplexity}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'functions' && (
                  <FunctionTableSection
                    functions={analysis.functions}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'findings' && (
                  <FindingsSection
                    findings={analysis.findings}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'ai-section' && (
                  <AISection
                    sourceCode={code}
                    analysis={analysis}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}

                {activeTab === 'ai-refactor' && (
                  <RefactorComparisonSection
                    sourceCode={code}
                    analysis={analysis}
                    onAcceptRefactoring={handleAcceptRefactoring}
                    onNavigateToLine={handleNavigateToLine}
                  />
                )}
              </>
            ) : (
              <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Code2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Ready to Analyze C Source Code
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Click the <strong>Analyze Code</strong> button above or press <strong>Ctrl+Enter</strong> to run deterministic static parsing.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Export Report Modal */}
      {analysis && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={analysis}
          sourceCode={code}
        />
      )}
    </div>
  );
}
