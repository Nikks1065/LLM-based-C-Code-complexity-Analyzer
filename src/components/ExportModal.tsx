import React from 'react';
import { X, Download, FileText, Code2, Printer, Check } from 'lucide-react';
import { CompleteAnalysisResult } from '../types/analyzer.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: CompleteAnalysisResult;
  sourceCode: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  sourceCode
}) => {
  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${analysis.fileDetails.fileName}-analysis-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export C Source
  const handleExportSource = () => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(sourceCode);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', analysis.fileDetails.fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Print-Ready HTML / Trigger Browser Print
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>C Code Intelligence Analysis Report — ${analysis.fileDetails.fileName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 4px; }
    h2 { color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 28px; }
    h3 { color: #334155; margin-top: 20px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e2e8f0; color: #334155; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .card-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
    pre { background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: monospace; }
    .formula-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; margin: 12px 0; color: #1e40af; }
  </style>
</head>
<body>
  <h1>C Code Intelligence Analysis Report</h1>
  <p><strong>File:</strong> ${analysis.fileDetails.fileName} | <strong>Generated:</strong> ${new Date().toLocaleString()} | <strong>Engine:</strong> Deterministic Static Engine & Google Gemini AI</p>

  <div class="grid">
    <div class="card">
      <div class="card-title">Physical LOC</div>
      <div class="card-value">${analysis.programLOC.totalPhysical}</div>
    </div>
    <div class="card">
      <div class="card-title">Peak Cyclomatic</div>
      <div class="card-value">${analysis.programCyclomatic.maxComplexity}</div>
    </div>
    <div class="card">
      <div class="card-title">Maintainability</div>
      <div class="card-value">${analysis.programMaintainability.normalizedScore}/100</div>
    </div>
    <div class="card">
      <div class="card-title">Time Complexity</div>
      <div class="card-value">${analysis.programTimeComplexity.overallBigO}</div>
    </div>
  </div>

  <h2>1. Lines of Code (LOC) Decomposition</h2>
  <p>Physical: ${analysis.programLOC.totalPhysical} | Non-Empty: ${analysis.programLOC.nonEmpty} | Code-Only: ${analysis.programLOC.codeOnly} | Comment-Only: ${analysis.programLOC.commentOnly} | Mixed: ${analysis.programLOC.codeAndComment} | Blank: ${analysis.programLOC.blank} | Comment Ratio: ${analysis.programLOC.commentRatio}%</p>

  <h2>2. Cyclomatic Complexity (McCabe)</h2>
  <div class="formula-box">
    Graph Method: M = E - N + 2P<br/>
    Decision Method: M = π + 1<br/>
    Peak Score: ${analysis.programCyclomatic.maxComplexity} (${analysis.programCyclomatic.highestComplexityFunction}) | Average: ${analysis.programCyclomatic.averageComplexity}
  </div>

  <h2>3. Halstead Software Science Metrics</h2>
  <div class="formula-box">
    Vocabulary: ${analysis.programHalstead.programVocabulary} (n₁=${analysis.programHalstead.distinctOperators}, n₂=${analysis.programHalstead.distinctOperands})<br/>
    Length: ${analysis.programHalstead.programLength} (N₁=${analysis.programHalstead.totalOperators}, N₂=${analysis.programHalstead.totalOperands})<br/>
    Volume: ${analysis.programHalstead.volume} bits | Difficulty: ${analysis.programHalstead.difficulty} | Effort: ${analysis.programHalstead.effort}<br/>
    Estimated Time: ${analysis.programHalstead.timeSeconds}s | Delivered Bugs: ${analysis.programHalstead.estimatedBugs}
  </div>

  <h2>4. Function-Level Complexity Profile</h2>
  <table>
    <thead>
      <tr>
        <th>Function</th>
        <th>Lines</th>
        <th>LOC</th>
        <th>Cyclomatic (M)</th>
        <th>Maintainability</th>
        <th>Time Big-O</th>
        <th>Auxiliary Space</th>
      </tr>
    </thead>
    <tbody>
      ${analysis.functions.map(fn => `
        <tr>
          <td><strong>${fn.name}()</strong></td>
          <td>L${fn.startLine} - L${fn.endLine}</td>
          <td>${fn.loc.totalPhysical}</td>
          <td>${fn.cyclomatic.score}</td>
          <td>${fn.maintainability.normalizedScore}/100</td>
          <td>${fn.timeComplexity.asymptoticNotation}</td>
          <td>${fn.spaceComplexity.asymptoticNotation}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>5. Static Quality Findings (${analysis.findings.length})</h2>
  ${analysis.findings.map(f => `
    <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
      <div style="font-weight: bold; color: #0f172a;">${f.title} [${f.severity}]</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Line(s): ${f.lineNumbers.join(', ')} | Category: ${f.category}</div>
      <p style="font-size: 12px; margin: 6px 0;">${f.explanation}</p>
      <div style="font-size: 12px; color: #059669;"><strong>Suggested Fix:</strong> ${f.suggestedFix}</div>
    </div>
  `).join('')}

  <h2>6. Analyzed Source Code</h2>
  <pre><code>${sourceCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
</body>
</html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export Analysis & Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose format for documentation, archival, or evaluation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* 0. Comprehensive Academic Project Report (15-20 Pages) */}
          <a
            href="/project-report.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-xl border-2 border-amber-500/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 text-left flex items-start gap-3 transition-colors group block no-underline"
          >
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  Academic Project Report (15–20 Pages PDF/Doc)
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">NEW</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  Open & Print →
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Full Software Engineering Project Report complying strictly with academic standards: Times New Roman 12pt, 1.5 line spacing, 1-inch margins, Architecture & Data-Flow Diagrams, IEEE Citations, and Benchmark Analyses.
              </p>
            </div>
          </a>

          {/* 1. Print / PDF HTML */}
          <button
            onClick={handlePrintReport}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left flex items-start gap-3 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Print-Ready Formal HTML / PDF Report</span>
                <span className="text-[10px] uppercase font-bold text-blue-500 group-hover:translate-x-0.5 transition-transform">
                  Generate →
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Full academic/engineering audit containing all formula substitutions, CFG tables, Big-O derivations, and findings.
              </p>
            </div>
          </button>

          {/* 2. Structured JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-left flex items-start gap-3 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Structured JSON Artifact (.json)</span>
                <span className="text-[10px] uppercase font-bold text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                  Download →
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Complete machine-readable JSON schema containing raw counts, AST tokens, Halstead frequency tables, and findings.
              </p>
            </div>
          </button>

          {/* 3. Source C Code */}
          <button
            onClick={handleExportSource}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left flex items-start gap-3 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>C Source Code File (.c)</span>
                <span className="text-[10px] uppercase font-bold text-emerald-500 group-hover:translate-x-0.5 transition-transform">
                  Download →
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Download the current active source code file for local compilation with gcc or clang.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
