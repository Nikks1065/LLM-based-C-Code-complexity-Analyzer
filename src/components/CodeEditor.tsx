import React, { useRef, useEffect } from 'react';
import {
  Upload,
  Copy,
  Check,
  FileCode,
  AlertTriangle,
  Flame,
  Database,
  Trash2,
  Clipboard,
  Edit3,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { ParserDiagnostic, DecisionPoint, MemoryAllocationSite } from '../types/analyzer.ts';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  activeLine?: number | null;
  diagnostics?: ParserDiagnostic[];
  decisionPoints?: DecisionPoint[];
  allocations?: MemoryAllocationSite[];
  fileName?: string;
  onFileUpload: (content: string, name: string) => void;
  onClear?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  activeLine,
  diagnostics = [],
  decisionPoints = [],
  allocations = [],
  fileName = 'main.c',
  onFileUpload,
  onClear
}) => {
  const [copied, setCopied] = React.useState(false);
  const [pastedFeedback, setPastedFeedback] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lines = code.length === 0 ? [''] : code.split('\n');

  // Build maps of line markers
  const decisionLineMap = new Map<number, DecisionPoint[]>();
  decisionPoints.forEach(d => {
    const list = decisionLineMap.get(d.lineNumber) || [];
    list.push(d);
    decisionLineMap.set(d.lineNumber, list);
  });

  const allocLineMap = new Map<number, MemoryAllocationSite[]>();
  allocations.forEach(a => {
    const list = allocLineMap.get(a.lineNumber) || [];
    list.push(a);
    allocLineMap.set(a.lineNumber, list);
  });

  const diagnosticLineMap = new Map<number, ParserDiagnostic[]>();
  diagnostics.forEach(d => {
    const list = diagnosticLineMap.get(d.line) || [];
    list.push(d);
    diagnosticLineMap.set(d.line, list);
  });

  // Scroll to active line when it changes
  useEffect(() => {
    if (activeLine && activeLine > 0 && containerRef.current) {
      const lineElement = containerRef.current.querySelector(`[data-line="${activeLine}"]`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLine]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText);
        setPastedFeedback(true);
        setTimeout(() => setPastedFeedback(false), 2000);
      }
    } catch {
      // Fallback: focus textarea for user to Ctrl+V
      textareaRef.current?.focus();
    }
  };

  const handleClearCode = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
    textareaRef.current?.focus();
  };

  const insertTemplate = (templateCode: string) => {
    onChange(templateCode);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onFileUpload(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-xs font-mono gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-200">{fileName}</span>
          <span className="text-slate-500 font-sans">({lines.length} lines)</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Edit3 className="w-3 h-3" />
            <span>Editable (Type or Paste)</span>
          </span>
          {diagnostics.length > 0 && (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] font-sans">
              <AlertTriangle className="w-3 h-3" />
              {diagnostics.length} diagnostic{diagnostics.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="file"
            accept=".c,.h"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handlePaste}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-sans transition-colors text-xs"
            title="Paste code from clipboard"
          >
            {pastedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{pastedFeedback ? 'Pasted!' : 'Paste'}</span>
          </button>
          <button
            onClick={handleClearCode}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 flex items-center gap-1 font-sans transition-colors text-xs"
            title="Clear code and write your own custom C program"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear / New</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-sans transition-colors text-xs"
            title="Upload .c source file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload .c</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-sans transition-colors text-xs"
            title="Copy source code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto font-mono text-[13px] leading-5 select-text"
        style={{ tabSize: 4 }}
      >
        <div className="min-w-full flex">
          {/* Gutter Line Numbers & Markers */}
          <div className="sticky left-0 z-10 bg-slate-950/95 border-r border-slate-800/80 px-2 py-3 select-none text-right font-mono text-slate-500 text-[12px] min-w-[56px]">
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const hasDec = decisionLineMap.has(lineNum);
              const hasAlloc = allocLineMap.has(lineNum);
              const hasDiag = diagnosticLineMap.has(lineNum);
              const isTargetLine = activeLine === lineNum;

              return (
                <div
                  key={lineNum}
                  data-line={lineNum}
                  className={`h-5 flex items-center justify-end gap-1.5 transition-colors ${
                    isTargetLine ? 'text-amber-300 font-bold' : ''
                  }`}
                >
                  {hasDiag && (
                    <span title="Parser diagnostic on this line">
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                  )}
                  {hasDec && (
                    <span
                      title={`Decision Point: ${decisionLineMap.get(lineNum)?.map(d => d.type).join(', ')} (+1 CC)`}
                      className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"
                    />
                  )}
                  {hasAlloc && (
                    <span
                      title="Memory Allocation Site (malloc/calloc)"
                      className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                  )}
                  <span className="w-7 text-right">{lineNum}</span>
                </div>
              );
            })}
          </div>

          {/* Interactive Editable Code Surface */}
          <div
            onClick={() => textareaRef.current?.focus()}
            className="relative flex-1 py-3 px-3 cursor-text min-h-[400px]"
          >
            {/* Background line highlight for active line */}
            {activeLine && activeLine > 0 && activeLine <= lines.length && (
              <div
                className="absolute left-0 right-0 bg-blue-500/15 border-l-2 border-blue-400 pointer-events-none transition-all duration-300"
                style={{
                  top: `${12 + (activeLine - 1) * 20}px`,
                  height: '20px'
                }}
              />
            )}

            {code.trim() === '' && (
              <div className="mb-4 p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 text-slate-300">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-sm text-white">Write Your Own C Code Here</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  You can type directly into this window, paste code (Ctrl+V or Paste button), or load a starter template:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      insertTemplate(`#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>int main() Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      insertTemplate(`#include <stdio.h>\n\n// Recursive Fibonacci - O(2^n)\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}\n\nint main() {\n    printf("%d\\n", fib(10));\n    return 0;\n}\n`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Recursion Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      insertTemplate(`#include <stdio.h>\n#include <stdlib.h>\n\nvoid dynamicAllocation(int n) {\n    int* arr = (int*)malloc(n * sizeof(int));\n    if (arr == NULL) return;\n    for (int i = 0; i < n; i++) {\n        arr[i] = i * 2;\n    }\n    free(arr);\n}\n\nint main() {\n    dynamicAllocation(10);\n    return 0;\n}\n`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Dynamic Memory Template</span>
                  </button>
                </div>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChange(e.target.value)}
              placeholder="// Type or paste your C code here directly...&#10;// Example:&#10;#include <stdio.h>&#10;&#10;int main() {&#10;    return 0;&#10;}"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="w-full bg-transparent text-slate-100 font-mono text-[13px] leading-5 resize-none focus:outline-none border-none p-0 m-0 overflow-hidden whitespace-pre placeholder:text-slate-600"
              style={{
                minHeight: '260px',
                height: `${Math.max(260, lines.length * 20 + 40)}px`
              }}
            />
          </div>
        </div>
      </div>

      {/* Editor Footer Legend */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 font-sans">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Decision Point (CC +1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Heap Allocation (malloc)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Diagnostic / Warning</span>
          </div>
        </div>
        <div>
          <span>Press <strong>Analyze Code</strong> to recalculate metrics</span>
        </div>
      </div>
    </div>
  );
};
