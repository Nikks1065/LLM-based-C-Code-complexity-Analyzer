/**
 * Static Code Quality & Findings Engine
 * Scans AST and metric results for verifiable code smells, memory safety risks,
 * excessive complexity hotspots, and maintainability concerns.
 */

import type { ASTFunction, ParsedProgram } from './cParser.ts';
import type { QualityFinding, CyclomaticMetrics, BigOTimeMetrics, SpaceComplexityMetrics } from '../types/analyzer.ts';

export function analyzeQualityFindings(
  program: ParsedProgram,
  funcAnalyses: { func: ASTFunction; cc: CyclomaticMetrics; time: BigOTimeMetrics; space: SpaceComplexityMetrics; locCount: number }[]
): QualityFinding[] {
  const findings: QualityFinding[] = [];

  for (const { func, cc, time, space, locCount } of funcAnalyses) {
    // 1. High Cyclomatic Complexity Check
    if (cc.score > 15) {
      findings.push({
        id: `finding-cc-high-${func.name}`,
        title: `Excessive Cyclomatic Complexity in '${func.name}' (M = ${cc.score})`,
        category: 'Maintainability',
        severity: 'High',
        isConfirmed: true,
        functionName: func.name,
        lineNumbers: [func.startLine, ...cc.decisionPoints.slice(0, 5).map(d => d.lineNumber)],
        codeSnippet: cc.decisionPoints[0]?.codeSnippet || `${func.name}() definition`,
        explanation: `Function '${func.name}' has a McCabe complexity of ${cc.score}, containing ${cc.decisionPointsCount} decision branches. This exceeds the industry threshold of 10-15 and makes testing all execution paths difficult.`,
        suggestedFix: `Decompose '${func.name}' into smaller helper functions with distinct single responsibilities, or replace complex nested branching with lookup tables or strategy dispatch.`,
        limitations: `McCabe complexity measures structural decision count rather than cognitive readability alone.`
      });
    } else if (cc.score > 10) {
      findings.push({
        id: `finding-cc-mod-${func.name}`,
        title: `Moderate Cyclomatic Complexity in '${func.name}' (M = ${cc.score})`,
        category: 'Maintainability',
        severity: 'Medium',
        isConfirmed: true,
        functionName: func.name,
        lineNumbers: [func.startLine],
        codeSnippet: `${func.name}() definition`,
        explanation: `Function '${func.name}' has a complexity of ${cc.score}, requiring at least ${cc.score} distinct unit test test cases to achieve full basis path coverage.`,
        suggestedFix: `Consider extracting secondary branch conditions or loop validation into isolated utility predicates.`,
        limitations: `Complexity between 11-15 is often acceptable for algorithmic kernels or state machines.`
      });
    }

    // 2. Exponential Time Complexity
    if (time.asymptoticNotation === 'O(2^n)') {
      findings.push({
        id: `finding-exp-time-${func.name}`,
        title: `Exponential Time Complexity O(2^n) in '${func.name}'`,
        category: 'Performance',
        severity: 'High',
        isConfirmed: true,
        functionName: func.name,
        lineNumbers: [func.startLine, ...time.derivationSteps.flatMap(s => s.sourceLines)],
        codeSnippet: time.operationCountModel,
        explanation: `Function '${func.name}' executes in exponential time O(2^n) due to multiple branching recursive calls without memoization or caching. Even for modest inputs (e.g. n > 40), execution will stall or timeout.`,
        suggestedFix: `Refactor to an iterative dynamic programming approach with an array/lookup table, or maintain memoized intermediate results to reduce complexity to O(n).`,
        limitations: `Static inference assumes arguments decrement linearly without global memoization.`
      });
    }

    // 3. Memory Leaks from Malloc
    for (const leak of space.potentialLeaks) {
      findings.push({
        id: `finding-leak-${func.name}-${leak.lineNumber}`,
        title: `Potential Heap Memory Leak in '${func.name}'`,
        category: 'Memory Safety',
        severity: 'High',
        isConfirmed: false,
        functionName: func.name,
        lineNumbers: [leak.lineNumber],
        codeSnippet: `malloc/calloc at line ${leak.lineNumber}`,
        explanation: leak.message,
        suggestedFix: `Ensure each allocated pointer is freed using 'free(ptr);' along all exit paths, or document ownership transfer if caller is responsible.`,
        limitations: `Static analysis cannot track cross-function pointer transfers or external memory managers.`
      });
    }

    // 4. Long Function (LOC > 45)
    if (locCount > 45) {
      findings.push({
        id: `finding-long-func-${func.name}`,
        title: `Large Function Size in '${func.name}' (${locCount} Physical LOC)`,
        category: 'Maintainability',
        severity: 'Low',
        isConfirmed: true,
        functionName: func.name,
        lineNumbers: [func.startLine, func.endLine],
        codeSnippet: `${func.returnType} ${func.name}(...) { ... }`,
        explanation: `Function '${func.name}' spans ${locCount} lines of code. Functions longer than 40-50 lines tend to accumulate multiple responsibilities and become harder to refactor.`,
        suggestedFix: `Split the function into cohesive helper routines, isolating input parsing, core algorithm, and output formatting.`,
        limitations: `Length metric does not subtract comments or blank lines.`
      });
    }

    // 5. High Parameter Count (> 4 parameters)
    if (func.parameters.length > 4) {
      findings.push({
        id: `finding-params-${func.name}`,
        title: `High Parameter Count in '${func.name}' (${func.parameters.length} parameters)`,
        category: 'Style',
        severity: 'Low',
        isConfirmed: true,
        functionName: func.name,
        lineNumbers: [func.startLine],
        codeSnippet: func.parameters.map(p => `${p.type} ${p.name}`).join(', '),
        explanation: `Function '${func.name}' takes ${func.parameters.length} parameters. Having more than 4 parameters increases call-site argument transposition errors.`,
        suggestedFix: `Group related configuration parameters into a dedicated C struct (e.g. 'struct ${func.name}_config').`,
        limitations: `C low-level kernels or graphics routines sometimes require explicit multi-argument buffers.`
      });
    }

    // 6. Deep Loop Nesting (depth >= 3)
    const deepLoop = time.loops.find(l => l.nestingDepth >= 3);
    if (deepLoop) {
      findings.push({
        id: `finding-deep-loop-${func.name}-${deepLoop.startLine}`,
        title: `Deep Loop Nesting in '${func.name}' (Depth ${deepLoop.nestingDepth})`,
        category: 'Performance',
        severity: 'Medium',
        isConfirmed: true,
        functionName: func.name,
        lineNumbers: [deepLoop.startLine, deepLoop.endLine],
        codeSnippet: deepLoop.codeSnippet,
        explanation: `Nesting loops to a depth of 3 or more creates cubic time complexity O(n³) or worse and impedes compiler vectorization.`,
        suggestedFix: `Review if outer loops can be rearranged or transformed into cache-friendly block matrix algorithms or early-exit filters.`,
        limitations: `Some algorithmic domains (e.g. tensor operations) inherently require 3 nested dimensions.`
      });
    }
  }

  // 7. Check for switch missing default or switch fallthrough
  for (const t of program.allTokens) {
    if (t.value === 'switch' && t.type === 'KEYWORD') {
      // Look ahead in tokens until closing brace of switch
      let depth = 0;
      let hasSeenBrace = false;
      let hasDefault = false;
      const switchLine = t.line;

      for (let j = program.allTokens.indexOf(t) + 1; j < program.allTokens.length; j++) {
        const nextT = program.allTokens[j];
        if (nextT.value === '{') {
          hasSeenBrace = true;
          depth++;
        } else if (nextT.value === '}') {
          depth--;
          if (hasSeenBrace && depth === 0) break;
        } else if (nextT.value === 'default' && nextT.type === 'KEYWORD') {
          hasDefault = true;
        }
      }

      if (!hasDefault && hasSeenBrace) {
        findings.push({
          id: `finding-switch-nodefault-${switchLine}`,
          title: `Switch Statement Missing 'default' Clause at Line ${switchLine}`,
          category: 'Correctness',
          severity: 'Medium',
          isConfirmed: true,
          lineNumbers: [switchLine],
          codeSnippet: `switch (...) at line ${switchLine}`,
          explanation: `Switch statement does not specify a 'default' branch. Unhandled enum or integer inputs may silently bypass processing without diagnostics.`,
          suggestedFix: `Add a 'default:' branch with appropriate fallback handling or an error assertion (e.g. 'assert(0 && "Unhandled switch case");').`,
          limitations: `If all enum members are proven covered by the compiler, omitting default may be intentional.`
        });
      }
    }
  }

  return findings;
}
