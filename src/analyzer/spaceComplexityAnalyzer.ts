/**
 * Deterministic Space Complexity Engine
 * Analyzes Auxiliary Space, Input Storage, Stack Memory Frames,
 * Dynamic Allocations (malloc/calloc/realloc), and checks for memory leaks.
 */

import type { ASTFunction } from './cParser.ts';
import type { SpaceComplexityMetrics, MemoryAllocationSite, BigOTimeMetrics } from '../types/analyzer.ts';

export function analyzeSpaceComplexity(func: ASTFunction, timeAnalysis: BigOTimeMetrics): SpaceComplexityMetrics {
  const allocations: MemoryAllocationSite[] = [];
  const potentialLeaks: { lineNumber: number; variableName?: string; message: string }[] = [];
  const derivationSteps: string[] = [];

  // 1. Analyze stack memory from recursion depth
  let stackMaxDepth = 'O(1)';
  let asymptoticStackSpace = 'O(1)';
  let stackExplanation = 'Non-recursive routine: call stack depth is bounded by a single activation frame of constant size.';

  if (timeAnalysis.isRecursive) {
    if (timeAnalysis.recursionType === 'divide_and_conquer') {
      stackMaxDepth = 'log₂(n) stack frames';
      asymptoticStackSpace = 'O(log n)';
      stackExplanation = 'Divide-and-conquer recursion halves problem size at each frame; maximum call stack depth reaches log₂(n) activation records.';
    } else if (timeAnalysis.recursionType === 'branching' || timeAnalysis.recursionType === 'linear') {
      stackMaxDepth = 'n stack frames';
      asymptoticStackSpace = 'O(n)';
      stackExplanation = 'Linear or branching recursion generates a maximum call chain depth proportional to input n, consuming O(n) auxiliary stack memory.';
    }
  }

  // 2. Identify local variables (scalars vs fixed arrays vs VLAs)
  let hasLinearVLA = false;
  for (const v of func.localVariables) {
    if (v.isArray) {
      const sz = v.arraySize || '';
      const isDynamicSize = /[a-zA-Z_]/.test(sz);
      allocations.push({
        type: isDynamicSize ? 'vla' : 'fixed_array',
        lineNumber: v.line,
        variableName: v.name,
        sizeExpression: `${v.type} ${v.name}[${sz}]`,
        sizeExpr: `${v.type} ${v.name}[${sz}]`,
        asymptoticSpace: isDynamicSize ? 'O(n)' : 'O(1)',
        hasFreeSite: true, // stack-allocated, auto-reclaimed
        codeSnippet: `${v.type} ${v.name}[${sz}];`
      });

      if (isDynamicSize) hasLinearVLA = true;
    } else {
      allocations.push({
        type: 'scalar',
        lineNumber: v.line,
        variableName: v.name,
        sizeExpression: `sizeof(${v.type})`,
        sizeExpr: `sizeof(${v.type})`,
        asymptoticSpace: 'O(1)',
        hasFreeSite: true,
        codeSnippet: `${v.type} ${v.name};`
      });
    }
  }

  // 3. Identify dynamic heap allocations (malloc, calloc, realloc)
  let hasLinearHeapAllocation = false;
  for (const alloc of func.allocations) {
    const sizeExpr = alloc.sizeExpr;
    const isDynamicSize = /[a-zA-Z_]/.test(sizeExpr);
    const asymptotic = isDynamicSize ? 'O(n)' : 'O(1)';

    if (isDynamicSize) hasLinearHeapAllocation = true;

    // Check if there is a matching free
    const matchingFree = func.frees.find(f => {
      if (alloc.varName) return f.varName.includes(alloc.varName);
      return true; // if not tracked, assume free exists if any free is present
    });

    const hasFree = !!matchingFree || func.frees.length > 0;

    allocations.push({
      type: alloc.type,
      lineNumber: alloc.line,
      variableName: alloc.varName,
      sizeExpression: `${alloc.type}(${sizeExpr})`,
      sizeExpr: `${alloc.type}(${sizeExpr})`,
      asymptoticSpace: asymptotic,
      hasFreeSite: hasFree,
      freeLineNumber: matchingFree?.line,
      codeSnippet: `${alloc.type}(${sizeExpr});`
    });

    if (!hasFree && func.name !== 'create' && !func.returnType.includes('*')) {
      potentialLeaks.push({
        lineNumber: alloc.line,
        variableName: alloc.varName,
        message: `Dynamic allocation via '${alloc.type}' at line ${alloc.line} has no detectable 'free()' deallocation within '${func.name}'. Risk of heap memory leak if pointer is not returned.`
      });
    }
  }

  // 4. Input Storage
  let inputStorage = 'O(1)';
  const pointerParams = func.parameters.filter(p => p.type.includes('*') || p.type.includes('[]'));
  if (pointerParams.length > 0) {
    inputStorage = 'O(n) [Caller-allocated buffer passed by pointer]';
  } else if (func.parameters.length > 0) {
    inputStorage = 'O(1) [Scalar primitive values passed by value]';
  } else {
    inputStorage = 'O(1) [Void parameters]';
  }

  // 5. Synthesize Auxiliary Space
  let auxiliarySpace = 'O(1)';
  let totalSpace = 'O(1)';

  if (hasLinearHeapAllocation || hasLinearVLA) {
    auxiliarySpace = 'O(n)';
  } else if (asymptoticStackSpace === 'O(n)') {
    auxiliarySpace = 'O(n)';
  } else if (asymptoticStackSpace === 'O(log n)') {
    auxiliarySpace = 'O(log n)';
  } else {
    auxiliarySpace = 'O(1)';
  }

  if (auxiliarySpace === 'O(n)' || inputStorage.includes('O(n)')) {
    totalSpace = 'O(n)';
  } else if (auxiliarySpace === 'O(log n)') {
    totalSpace = 'O(log n)';
  } else {
    totalSpace = 'O(1)';
  }

  derivationSteps.push(`1. Input Storage Evaluation: ${inputStorage}`);
  derivationSteps.push(`2. Local Variables: ${func.localVariables.length} scalar/array declarations in stack frame (${allocations.filter(a => a.type === 'scalar' || a.type === 'fixed_array').length} fixed-size: O(1) space).`);
  if (hasLinearVLA) {
    derivationSteps.push(`3. Variable-Length Array (VLA) detected on stack: O(n) auxiliary stack allocation.`);
  }
  if (allocations.filter(a => a.type === 'malloc' || a.type === 'calloc').length > 0) {
    derivationSteps.push(`4. Dynamic Heap Allocations: ${allocations.filter(a => a.type === 'malloc' || a.type === 'calloc').length} calls detected. Asymptotic heap usage: ${hasLinearHeapAllocation ? 'O(n)' : 'O(1)'}.`);
  }
  derivationSteps.push(`5. Call Stack Frame Depth: ${stackExplanation}`);
  derivationSteps.push(`6. Resulting Auxiliary Space Bound: S_aux(n) = ${auxiliarySpace}`);

  return {
    asymptoticNotation: auxiliarySpace,
    auxiliarySpace,
    inputStorage,
    totalSpace,
    stackMemory: {
      maxDepth: stackMaxDepth,
      asymptoticStackSpace,
      explanation: stackExplanation
    },
    allocations,
    potentialLeaks,
    derivationSteps,
    confidence: 'High'
  };
}
