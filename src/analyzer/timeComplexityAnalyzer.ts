/**
 * Deterministic Big-O Time Complexity Engine
 * Statically analyzes loop structures, recursion trees, divide-and-conquer recurrences,
 * dependent bounds, and early return branches.
 * Derives operation count model T(n), dominant term, and asymptotic Big-O bounds.
 */

import type { ASTFunction } from './cParser.ts';
import type { BigOTimeMetrics, LoopNestingInfo, BigODerivationStep } from '../types/analyzer.ts';

export function analyzeTimeComplexity(func: ASTFunction): BigOTimeMetrics {
  const reasoning: string[] = [];
  const derivationSteps: BigODerivationStep[] = [];
  const loops: LoopNestingInfo[] = [];

  // 1. Identify input size parameters
  const inputSizeCandidates: string[] = [];
  for (const p of func.parameters) {
    const pName = p.name.toLowerCase();
    if (['n', 'size', 'len', 'length', 'count', 'num', 'm', 'k', 'r', 'c', 'rows', 'cols', 'height', 'width'].some(prefix => pName.includes(prefix))) {
      inputSizeCandidates.push(p.name);
    } else if (p.type.includes('*') || p.type.includes('[]')) {
      inputSizeCandidates.push(p.name);
    }
  }

  // If no obvious parameter, look for array sizes or common loop bounds
  if (inputSizeCandidates.length === 0 && func.parameters.length > 0) {
    inputSizeCandidates.push(func.parameters[func.parameters.length - 1].name);
  }
  const primaryInputVar = inputSizeCandidates[0] || 'n';

  // 2. Scan AST for loop constructs and compute nesting depth
  let maxLoopNesting = 0;
  let hasLogarithmicLoop = false;
  let hasDependentInnerLoop = false;
  let hasLinearLoop = false;
  let hasEarlyReturnInLoop = false;

  for (const node of func.body) {
    if (node.type === 'ForStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
      const startLine = node.line;
      const endLine = node.endLine;
      const stepType = node.stepType || 'linear';

      if (stepType === 'logarithmic') hasLogarithmicLoop = true;
      else if (stepType === 'linear') hasLinearLoop = true;

      // Check inner loops inside this range
      let innerNesting = 1;
      for (const other of func.body) {
        if (other !== node && (other.type === 'ForStatement' || other.type === 'WhileStatement')) {
          if (other.line > startLine && other.endLine <= endLine) {
            innerNesting++;

            // Check if inner loop bound depends on outer loop variable
            if (node.loopVar && (other.condPart?.includes(node.loopVar) || other.initPart?.includes(node.loopVar))) {
              hasDependentInnerLoop = true;
            }
          }
        }
      }

      if (innerNesting > maxLoopNesting) {
        maxLoopNesting = innerNesting;
      }

      const estimatedIterations = stepType === 'logarithmic'
        ? `log₂(${primaryInputVar}) iterations`
        : `${primaryInputVar} iterations`;

      loops.push({
        loopType: node.type === 'ForStatement' ? 'for' : node.type === 'WhileStatement' ? 'while' : 'do_while',
        startLine,
        endLine,
        nestingDepth: innerNesting,
        loopVariable: node.loopVar,
        boundExpression: node.condPart,
        stepExpression: node.updatePart,
        stepType,
        estimatedIterations,
        codeSnippet: node.codeSnippet || `${node.type} (...)`
      });
    }
  }

  // 3. Scan for recursion
  const recursiveCalls = func.functionCalls.filter(c => c.name === func.name);
  const isRecursive = recursiveCalls.length > 0;
  let recursionType: 'linear' | 'divide_and_conquer' | 'branching' | 'none' = 'none';
  let recursionDetails = 'No self-recursive call sites identified in this function.';

  if (isRecursive) {
    if (recursiveCalls.length >= 2) {
      // Multiple recursive calls: could be branching (e.g. fib(n-1) + fib(n-2)) or divide-and-conquer (merge_sort)
      const argsText = recursiveCalls.map(c => c.args.join(' ')).join(' ');
      if (argsText.includes('/ 2') || argsText.includes('>> 1')) {
        recursionType = 'divide_and_conquer';
        recursionDetails = `Identified ${recursiveCalls.length} recursive invocations with halved inputs (T(n) = 2T(n/2) + O(n)), characteristic of Divide-and-Conquer.`;
      } else {
        recursionType = 'branching';
        recursionDetails = `Identified ${recursiveCalls.length} branching recursive calls (e.g. T(n) = T(n-1) + T(n-2) + O(1)), producing an exponential recursion tree.`;
      }
    } else {
      // Single recursive call: check if argument decreases by 1 or halves
      const callArgs = recursiveCalls[0].args.join(' ');
      if (callArgs.includes('/ 2') || callArgs.includes('>> 1') || callArgs.includes('mid')) {
        recursionType = 'divide_and_conquer';
        recursionDetails = `Single recursive call halving search interval (T(n) = T(n/2) + O(1)), characteristic of Binary Search recursion.`;
      } else {
        recursionType = 'linear';
        recursionDetails = `Single recursive call with decremented input (T(n) = T(n-1) + O(1)), generating a linear call stack of depth n.`;
      }
    }
  }

  // Check for early returns or breaks inside loop body
  // Can give distinction between Best Case O(1) and Worst Case O(n)
  if (loops.length > 0) {
    for (const t of func.tokens) {
      if ((t.value === 'return' || t.value === 'break') && t.line >= loops[0].startLine && t.line <= loops[0].endLine) {
        hasEarlyReturnInLoop = true;
        break;
      }
    }
  }

  // 4. Derive Big-O notation, dominant term, and operation model
  let asymptoticNotation = 'O(1)';
  let dominantTerm = '1';
  let operationCountModel = 'T(n) = c';
  let bestCase = 'O(1)';
  let worstCase = 'O(1)';
  let averageCase = 'O(1)';
  let confidence: 'High' | 'Medium' | 'Heuristic / Estimated' | 'Unable to determine reliably' = 'High';

  if (isRecursive) {
    if (recursionType === 'branching') {
      asymptoticNotation = 'O(2^n)';
      dominantTerm = '2^n';
      operationCountModel = 'T(n) = T(n-1) + T(n-2) + c ≈ c · 2^n';
      bestCase = 'O(1) [base cases n <= 1]';
      worstCase = 'O(2^n)';
      averageCase = 'O(2^n)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Recurrence Relation Formulation',
        mathematicalExpression: 'T(n) = T(n-1) + T(n-2) + c for n > 1; T(0) = T(1) = d',
        sourceLines: recursiveCalls.map(c => c.line)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Recursion Tree Height and Branching Factor',
        mathematicalExpression: 'Branching factor b = 2; Tree depth h = n. Number of leaf calls = 2^n.',
        sourceLines: recursiveCalls.map(c => c.line)
      });
      derivationSteps.push({
        stepNumber: 3,
        description: 'Asymptotic Summation',
        mathematicalExpression: 'Sum_{i=0}^n 2^i = 2^(n+1) - 1 = Θ(2^n) = O(2^n)',
        sourceLines: [func.startLine, func.endLine]
      });

      reasoning.push(`Identified dual unmemoized recursive call sites in '${func.name}'. Each invocation spawns 2 child branches until base conditions.`);
      reasoning.push(`The recurrence relation solves to exponential complexity O(2^n), characteristic of naive combinatorial/Fibonacci recursions.`);
    } else if (recursionType === 'divide_and_conquer') {
      if (recursiveCalls.length === 1) {
        asymptoticNotation = 'O(log n)';
        dominantTerm = 'log n';
        operationCountModel = 'T(n) = T(n/2) + c';
        bestCase = 'O(1) [target found at midpoint]';
        worstCase = 'O(log n)';
        averageCase = 'O(log n)';
        confidence = 'High';

        derivationSteps.push({
          stepNumber: 1,
          description: 'Recurrence Relation',
          mathematicalExpression: 'T(n) = T(n/2) + c (Problem size halved at each recursive step with O(1) work)',
          sourceLines: recursiveCalls.map(c => c.line)
        });
        derivationSteps.push({
          stepNumber: 2,
          description: 'Master Theorem Application',
          mathematicalExpression: 'a = 1, b = 2, f(n) = c = Θ(n^0). Case 2: c_crit = log_2(1) = 0. T(n) = Θ(n^0 log n) = O(log n)',
          sourceLines: [func.startLine, func.endLine]
        });
      } else {
        asymptoticNotation = 'O(n log n)';
        dominantTerm = 'n log n';
        operationCountModel = 'T(n) = 2T(n/2) + cn';
        bestCase = 'O(n log n)';
        worstCase = 'O(n log n)';
        averageCase = 'O(n log n)';
        confidence = 'High';

        derivationSteps.push({
          stepNumber: 1,
          description: 'Divide and Conquer Recurrence',
          mathematicalExpression: 'T(n) = 2T(n/2) + O(n) (Two subproblems of size n/2 merged in linear time O(n))',
          sourceLines: recursiveCalls.map(c => c.line)
        });
        derivationSteps.push({
          stepNumber: 2,
          description: 'Master Theorem Case 2',
          mathematicalExpression: 'a = 2, b = 2, k = 1. log_b(a) = log_2(2) = 1 = k. Hence T(n) = Θ(n^1 log n) = O(n log n)',
          sourceLines: [func.startLine, func.endLine]
        });
      }
    } else {
      // Linear recursion
      asymptoticNotation = 'O(n)';
      dominantTerm = 'n';
      operationCountModel = 'T(n) = T(n-1) + c = c · n';
      bestCase = 'O(1) [base case]';
      worstCase = 'O(n)';
      averageCase = 'O(n)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Linear Recurrence Relation',
        mathematicalExpression: 'T(n) = T(n-1) + c (Input decrements linearly by 1 with O(1) work per frame)',
        sourceLines: recursiveCalls.map(c => c.line)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Unrolling the Recurrence',
        mathematicalExpression: 'T(n) = T(n-2) + 2c = ... = T(0) + n · c = Θ(n) = O(n)',
        sourceLines: [func.startLine, func.endLine]
      });
    }
  } else if (maxLoopNesting >= 3) {
    asymptoticNotation = 'O(n^3)';
    dominantTerm = 'n^3';
    operationCountModel = 'T(n) = a · n^3 + b · n^2 + c · n + d';
    bestCase = hasEarlyReturnInLoop ? 'O(1)' : 'O(n^3)';
    worstCase = 'O(n^3)';
    averageCase = 'O(n^3)';
    confidence = 'High';

    derivationSteps.push({
      stepNumber: 1,
      description: 'Triple Nested Iteration Count',
      mathematicalExpression: 'Sum_{i=1}^n Sum_{j=1}^n Sum_{k=1}^n c = c · n · n · n = c · n^3',
      sourceLines: loops.map(l => l.startLine)
    });
    derivationSteps.push({
      stepNumber: 2,
      description: 'Asymptotic Dominance',
      mathematicalExpression: 'lim_{n -> inf} (a · n^3 + O(n^2)) / n^3 = a > 0 => T(n) = O(n^3)',
      sourceLines: [func.startLine, func.endLine]
    });
  } else if (maxLoopNesting === 2) {
    if (hasDependentInnerLoop) {
      asymptoticNotation = 'O(n^2)';
      dominantTerm = 'n^2';
      operationCountModel = 'T(n) = n(n + 1)/2 · c ≈ (c/2)n^2 + (c/2)n';
      bestCase = hasEarlyReturnInLoop ? 'O(1)' : 'O(n^2)';
      worstCase = 'O(n^2)';
      averageCase = 'O(n^2)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Dependent Inner Loop Bound Analysis',
        mathematicalExpression: 'Outer loop iterates i from 0 to n-1. Inner loop runs (n - i) or i times.',
        sourceLines: loops.map(l => l.startLine)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Arithmetic Progression Summation',
        mathematicalExpression: 'Sum_{i=0}^{n-1} (n - i) = n + (n-1) + ... + 1 = n(n + 1)/2 = 0.5 n^2 + 0.5 n',
        sourceLines: loops.map(l => l.startLine)
      });
      derivationSteps.push({
        stepNumber: 3,
        description: 'Upper Bound Asymptotics',
        mathematicalExpression: 'Dominant term is 0.5 n^2. Lower-order term 0.5 n dropped. T(n) = Θ(n^2) = O(n^2)',
        sourceLines: [func.startLine, func.endLine]
      });
    } else if (hasLogarithmicLoop) {
      asymptoticNotation = 'O(n log n)';
      dominantTerm = 'n log n';
      operationCountModel = 'T(n) = c · n log2(n)';
      bestCase = hasEarlyReturnInLoop ? 'O(1)' : 'O(n log n)';
      worstCase = 'O(n log n)';
      averageCase = 'O(n log n)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Nested Linear and Logarithmic Loops',
        mathematicalExpression: 'Outer loop performs n iterations. Inner loop doubles/halves stepping log2(n) times.',
        sourceLines: loops.map(l => l.startLine)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Product Rule',
        mathematicalExpression: 'T(n) = n × log2(n) × c = O(n log n)',
        sourceLines: loops.map(l => l.startLine)
      });
    } else {
      asymptoticNotation = 'O(n^2)';
      dominantTerm = 'n^2';
      operationCountModel = 'T(n) = c · n^2 + d · n + e';
      bestCase = hasEarlyReturnInLoop ? 'O(1)' : 'O(n^2)';
      worstCase = 'O(n^2)';
      averageCase = 'O(n^2)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Independent Nested Loops Product',
        mathematicalExpression: 'Outer loop runs n times. Inner loop runs n times independently for each outer iteration.',
        sourceLines: loops.map(l => l.startLine)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Polynomial Dominance',
        mathematicalExpression: 'Sum_{i=1}^n Sum_{j=1}^n c = c · n · n = c · n^2 = O(n^2)',
        sourceLines: loops.map(l => l.startLine)
      });
    }
  } else if (maxLoopNesting === 1) {
    if (hasLogarithmicLoop) {
      asymptoticNotation = 'O(log n)';
      dominantTerm = 'log n';
      operationCountModel = 'T(n) = c · log2(n) + d';
      bestCase = hasEarlyReturnInLoop ? 'O(1)' : 'O(log n)';
      worstCase = 'O(log n)';
      averageCase = 'O(log n)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Logarithmic Step Detection',
        mathematicalExpression: 'Loop variable multiplies or divides by factor k (e.g. i *= 2, i /= 2) per iteration.',
        sourceLines: loops.map(l => l.startLine)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Iteration Count Calculation',
        mathematicalExpression: 'k^iterations = n => iterations = log_k(n) = (log2 n) / (log2 k) = O(log n)',
        sourceLines: loops.map(l => l.startLine)
      });
    } else {
      asymptoticNotation = 'O(n)';
      dominantTerm = 'n';
      operationCountModel = 'T(n) = a · n + b';
      bestCase = hasEarlyReturnInLoop ? 'O(1) [early break/return on first match]' : 'O(n)';
      worstCase = 'O(n)';
      averageCase = 'O(n)';
      confidence = 'High';

      derivationSteps.push({
        stepNumber: 1,
        description: 'Single Linear Loop Iteration',
        mathematicalExpression: `Loop executes from 0 to ${primaryInputVar} with constant step increment (+1 or -1).`,
        sourceLines: loops.map(l => l.startLine)
      });
      derivationSteps.push({
        stepNumber: 2,
        description: 'Linear Operation Model',
        mathematicalExpression: `T(n) = c · ${primaryInputVar} + d = Θ(n) = O(n)`,
        sourceLines: loops.map(l => l.startLine)
      });
    }
  } else {
    // Zero loops and non-recursive
    asymptoticNotation = 'O(1)';
    dominantTerm = '1';
    operationCountModel = 'T(n) = c (constant)';
    bestCase = 'O(1)';
    worstCase = 'O(1)';
    averageCase = 'O(1)';
    confidence = 'High';

    derivationSteps.push({
      stepNumber: 1,
      description: 'Sequential Non-Iterative Instructions',
      mathematicalExpression: 'Function contains no loop constructs and no self-recursive invocations.',
      sourceLines: [func.startLine, func.endLine]
    });
    derivationSteps.push({
      stepNumber: 2,
      description: 'Bounded Operation Count',
      mathematicalExpression: 'Execution path length is upper-bounded by a fixed constant c independent of input size n. T(n) = O(1).',
      sourceLines: [func.startLine, func.endLine]
    });
  }

  // 5. Generate growth chart data points for visualization (n = 1, 2, 4, 8, 16, 32, 64, 128)
  const growthDataPoints = [1, 2, 4, 8, 16, 32, 64, 128].map(nVal => {
    let ops = 1;
    if (asymptoticNotation === 'O(1)') ops = 2;
    else if (asymptoticNotation === 'O(log n)') ops = Math.max(1, Math.round(Math.log2(nVal)));
    else if (asymptoticNotation === 'O(n)') ops = nVal;
    else if (asymptoticNotation === 'O(n log n)') ops = Math.round(nVal * Math.log2(nVal || 1));
    else if (asymptoticNotation === 'O(n^2)') ops = nVal * nVal;
    else if (asymptoticNotation === 'O(n^3)') ops = Math.min(100000, nVal * nVal * nVal);
    else if (asymptoticNotation === 'O(2^n)') ops = Math.min(100000, Math.pow(2, Math.min(16, nVal)));

    return {
      n: nVal,
      operations: ops,
      baselineO1: 1,
      baselineOlogn: Math.max(1, Math.round(Math.log2(nVal))),
      baselineOn: nVal,
      baselineOnlogn: Math.round(nVal * Math.log2(nVal || 1)),
      baselineOn2: Math.min(10000, nVal * nVal)
    };
  });

  const limitations = [
    'Static Upper Bound: Does not evaluate runtime hardware cache hits, branch prediction, or OS context switching.',
    'Arbitrary Loop Termination: Halting problem bounds; loops with dynamic pointer convergence (e.g. while (ptr != NULL)) assume linear traversal.',
    'External Functions: Functions called outside the compiled unit (e.g. libc qsort or printf) are treated as known primitives.'
  ];

  return {
    asymptoticNotation,
    bestCase,
    averageCase,
    worstCase,
    dominantTerm,
    operationCountModel,
    identifiedInputVariables: inputSizeCandidates,
    loops,
    isRecursive,
    recursionType: isRecursive ? recursionType : undefined,
    recursionDetails: isRecursive ? recursionDetails : undefined,
    confidence,
    reasoning,
    derivationSteps,
    limitations,
    growthDataPoints
  };
}
