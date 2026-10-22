/**
 * Master C Static Analysis Engine
 * Coordinates parsing, deterministic metrics computation, and findings synthesis.
 */

import type { CompleteAnalysisResult, FunctionAnalysis } from '../types/analyzer.ts';
import { parseC } from './cParser.ts';
import { analyzeLOC } from './locAnalyzer.ts';
import { analyzeCyclomaticComplexity } from './cyclomaticAnalyzer.ts';
import { analyzeHalstead } from './halsteadAnalyzer.ts';
import { analyzeMaintainability } from './maintainabilityAnalyzer.ts';
import { analyzeTimeComplexity } from './timeComplexityAnalyzer.ts';
import { analyzeSpaceComplexity } from './spaceComplexityAnalyzer.ts';
import { analyzeQualityFindings } from './qualityFindingsAnalyzer.ts';

export function analyzeCCode(sourceCode: string, fileName = 'main.c'): CompleteAnalysisResult {
  const trimmed = sourceCode.trim();
  const rawLines = sourceCode.split(/\r?\n/);
  const totalLines = rawLines.length;
  const characterCount = sourceCode.length;
  const byteSize = new TextEncoder().encode(sourceCode).length;

  // 1. Program-level LOC Analysis
  const programLOC = analyzeLOC(sourceCode, 1, totalLines);

  // 2. Parse C Program to AST
  const parsedProgram = parseC(sourceCode);

  // 3. Program-level Halstead Analysis
  const programHalstead = analyzeHalstead(parsedProgram.allTokens);

  // 4. Function-Level Analyses
  const funcAnalysesList: {
    func: (typeof parsedProgram.functions)[0];
    cc: ReturnType<typeof analyzeCyclomaticComplexity>;
    time: ReturnType<typeof analyzeTimeComplexity>;
    space: ReturnType<typeof analyzeSpaceComplexity>;
    locCount: number;
  }[] = [];

  const functionAnalyses: FunctionAnalysis[] = [];

  for (let idx = 0; idx < parsedProgram.functions.length; idx++) {
    const fn = parsedProgram.functions[idx];
    const fnLOC = analyzeLOC(sourceCode, fn.startLine, fn.endLine);
    const fnCC = analyzeCyclomaticComplexity(fn, idx);
    const fnHalstead = analyzeHalstead(fn.tokens);
    const fnMI = analyzeMaintainability(fnHalstead.volume, fnCC.score, fnLOC.nonEmpty, fnLOC.commentRatio);
    const fnTime = analyzeTimeComplexity(fn);
    const fnSpace = analyzeSpaceComplexity(fn, fnTime);

    funcAnalysesList.push({
      func: fn,
      cc: fnCC,
      time: fnTime,
      space: fnSpace,
      locCount: fnLOC.totalPhysical
    });

    functionAnalyses.push({
      name: fn.name,
      returnType: fn.returnType,
      parameters: fn.parameters,
      startLine: fn.startLine,
      endLine: fn.endLine,
      loc: fnLOC,
      cyclomatic: fnCC,
      halstead: fnHalstead,
      maintainability: fnMI,
      timeComplexity: fnTime,
      spaceComplexity: fnSpace,
      localVariables: fn.localVariables.map(v => ({ name: v.name, type: v.type, line: v.line })),
      calls: fn.functionCalls.map(c => c.name)
    });
  }

  // 5. Aggregate Program-level Cyclomatic Complexity
  let sumComplexity = 0;
  let maxComplexity = 0;
  let highestFunction = 'N/A';

  if (functionAnalyses.length > 0) {
    for (const f of functionAnalyses) {
      sumComplexity += f.cyclomatic.score;
      if (f.cyclomatic.score > maxComplexity) {
        maxComplexity = f.cyclomatic.score;
        highestFunction = f.name;
      }
    }
  } else {
    // If no explicit functions found (e.g. top-level statements or macros only)
    sumComplexity = 1;
    maxComplexity = 1;
  }

  const averageComplexity = functionAnalyses.length > 0
    ? Number((sumComplexity / functionAnalyses.length).toFixed(2))
    : 1;

  let overallRisk = 'Low Risk';
  if (maxComplexity > 50) overallRisk = 'High Risk (Untestable Hotspots)';
  else if (maxComplexity > 20) overallRisk = 'Substantial Risk';
  else if (maxComplexity > 10) overallRisk = 'Moderate Risk';

  // 6. Program-level Maintainability Index
  const programMaintainability = analyzeMaintainability(
    programHalstead.volume,
    maxComplexity || 1,
    programLOC.nonEmpty || 1,
    programLOC.commentRatio
  );

  // 7. Overall Program Big-O Time & Space
  // The overall time complexity of the program is bounded by its most complex function (or main)
  const complexityHierarchy: Record<string, number> = {
    'O(1)': 1,
    'O(log n)': 2,
    'O(n)': 3,
    'O(n log n)': 4,
    'O(n^2)': 5,
    'O(n^3)': 6,
    'O(2^n)': 7
  };

  let maxTimeComplexity = 'O(1)';
  let maxTimeWeight = 0;
  let maxTimeFunc = '';

  let maxSpaceComplexity = 'O(1)';
  let maxSpaceWeight = 0;
  let maxSpaceFunc = '';

  for (const f of functionAnalyses) {
    const tWeight = complexityHierarchy[f.timeComplexity.asymptoticNotation] || 3;
    if (tWeight > maxTimeWeight) {
      maxTimeWeight = tWeight;
      maxTimeComplexity = f.timeComplexity.asymptoticNotation;
      maxTimeFunc = f.name;
    }

    const sWeight = complexityHierarchy[f.spaceComplexity.asymptoticNotation] || 1;
    if (sWeight > maxSpaceWeight) {
      maxSpaceWeight = sWeight;
      maxSpaceComplexity = f.spaceComplexity.asymptoticNotation;
      maxSpaceFunc = f.name;
    }
  }

  // 8. Quality Findings
  const findings = analyzeQualityFindings(parsedProgram, funcAnalysesList);

  return {
    sourceCode,
    fileDetails: {
      fileName,
      totalLines,
      characterCount,
      byteSize,
      parsedAt: new Date().toISOString()
    },
    diagnostics: parsedProgram.diagnostics,
    programLOC,
    programCyclomatic: {
      sumComplexity,
      averageComplexity,
      maxComplexity,
      highestComplexityFunction: highestFunction,
      overallRisk
    },
    programHalstead,
    programMaintainability,
    programTimeComplexity: {
      overallBigO: maxTimeComplexity,
      explanation: maxTimeFunc
        ? `Program-level time complexity is bounded by function '${maxTimeFunc}' (${maxTimeComplexity}).`
        : `Default constant-time baseline.`
    },
    programSpaceComplexity: {
      overallBigO: maxSpaceComplexity,
      explanation: maxSpaceFunc
        ? `Program-level auxiliary space is dominated by '${maxSpaceFunc}' (${maxSpaceComplexity}).`
        : `Default constant auxiliary space.`
    },
    functions: functionAnalyses,
    findings
  };
}
