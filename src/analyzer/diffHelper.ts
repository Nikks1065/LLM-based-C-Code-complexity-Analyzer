/**
 * Refactoring Diff & Metric Comparison Helper
 * Evaluates metric deltas between original C code and refactored C code.
 */

import type { CompleteAnalysisResult, MetricDelta, RefactorComparison } from '../types/analyzer.ts';
import { analyzeCCode } from './index.ts';

export function compareRefactoredCode(
  originalCode: string,
  refactoredCode: string,
  fileName = 'refactored.c'
): RefactorComparison {
  const originalAnalysis = analyzeCCode(originalCode, 'original.c');
  const refactoredAnalysis = analyzeCCode(refactoredCode, fileName);

  const deltas: MetricDelta[] = [];

  // LOC delta
  const origLOC = originalAnalysis.programLOC.totalPhysical;
  const refacLOC = refactoredAnalysis.programLOC.totalPhysical;
  const locDiff = refacLOC - origLOC;
  deltas.push({
    metric: 'Physical Lines of Code (LOC)',
    originalValue: origLOC,
    refactoredValue: refacLOC,
    difference: locDiff > 0 ? `+${locDiff}` : `${locDiff}`,
    improved: locDiff < 0,
    explanation: locDiff < 0
      ? `Reduced source footprint by ${Math.abs(locDiff)} lines, pruning redundant boilerplate.`
      : locDiff > 0
      ? `Added ${locDiff} lines (e.g. documentation, safety checks, or modular sub-routines).`
      : `Line count remained identical.`
  });

  // Cyclomatic Complexity delta
  const origCC = originalAnalysis.programCyclomatic.maxComplexity;
  const refacCC = refactoredAnalysis.programCyclomatic.maxComplexity;
  const ccDiff = refacCC - origCC;
  deltas.push({
    metric: 'Max Cyclomatic Complexity (M)',
    originalValue: origCC,
    refactoredValue: refacCC,
    difference: ccDiff > 0 ? `+${ccDiff}` : `${ccDiff}`,
    improved: ccDiff < 0 ? true : ccDiff > 0 ? false : null,
    explanation: ccDiff < 0
      ? `Successfully simplified control flow! Reduced peak decision paths by ${Math.abs(ccDiff)}.`
      : ccDiff > 0
      ? `Peak branch complexity increased by ${ccDiff}.`
      : `Control flow branch count remained unchanged.`
  });

  // Maintainability Index delta
  const origMI = originalAnalysis.programMaintainability.normalizedScore;
  const refacMI = refactoredAnalysis.programMaintainability.normalizedScore;
  const miDiff = Number((refacMI - origMI).toFixed(2));
  deltas.push({
    metric: 'Maintainability Index (0-100)',
    originalValue: origMI,
    refactoredValue: refacMI,
    difference: miDiff > 0 ? `+${miDiff}` : `${miDiff}`,
    improved: miDiff > 0 ? true : miDiff < 0 ? false : null,
    explanation: miDiff > 0
      ? `Maintainability increased by ${miDiff} points into '${refactoredAnalysis.programMaintainability.category}'.`
      : miDiff < 0
      ? `Maintainability score shifted down by ${Math.abs(miDiff)} points.`
      : `Maintainability index held constant.`
  });

  // Halstead Volume delta
  const origVol = originalAnalysis.programHalstead.volume;
  const refacVol = refactoredAnalysis.programHalstead.volume;
  const volDiff = Number((refacVol - origVol).toFixed(2));
  deltas.push({
    metric: 'Halstead Volume (bits)',
    originalValue: `${origVol} bits`,
    refactoredValue: `${refacVol} bits`,
    difference: volDiff > 0 ? `+${volDiff}` : `${volDiff}`,
    improved: volDiff < 0 ? true : volDiff > 0 ? false : null,
    explanation: volDiff < 0
      ? `Information content reduced by ${Math.abs(volDiff)} bits, indicating cleaner token economy.`
      : `Volume changed by ${volDiff} bits.`
  });

  // Halstead Difficulty delta
  const origDiff = originalAnalysis.programHalstead.difficulty;
  const refacDiff = refactoredAnalysis.programHalstead.difficulty;
  const diffDelta = Number((refacDiff - origDiff).toFixed(2));
  deltas.push({
    metric: 'Halstead Difficulty (D)',
    originalValue: origDiff,
    refactoredValue: refacDiff,
    difference: diffDelta > 0 ? `+${diffDelta}` : `${diffDelta}`,
    improved: diffDelta < 0 ? true : diffDelta > 0 ? false : null,
    explanation: diffDelta < 0
      ? `Mental effort required to comprehend the algorithm decreased by ${Math.abs(diffDelta)}.`
      : `Mental difficulty shifted by ${diffDelta}.`
  });

  // Time Complexity delta
  const origTime = originalAnalysis.programTimeComplexity.overallBigO;
  const refacTime = refactoredAnalysis.programTimeComplexity.overallBigO;
  const timeImproved = isComplexityBetter(refacTime, origTime);
  deltas.push({
    metric: 'Time Complexity',
    originalValue: origTime,
    refactoredValue: refacTime,
    difference: `${origTime} → ${refacTime}`,
    improved: timeImproved,
    explanation: timeImproved === true
      ? `Algorithmic runtime improved from ${origTime} to ${refacTime}!`
      : timeImproved === false
      ? `Algorithmic runtime degraded from ${origTime} to ${refacTime}.`
      : `Asymptotic time complexity remained ${origTime}.`
  });

  // Space Complexity delta
  const origSpace = originalAnalysis.programSpaceComplexity.overallBigO;
  const refacSpace = refactoredAnalysis.programSpaceComplexity.overallBigO;
  const spaceImproved = isComplexityBetter(refacSpace, origSpace);
  deltas.push({
    metric: 'Space Complexity',
    originalValue: origSpace,
    refactoredValue: refacSpace,
    difference: `${origSpace} → ${refacSpace}`,
    improved: spaceImproved,
    explanation: spaceImproved === true
      ? `Auxiliary memory reduced from ${origSpace} to ${refacSpace}.`
      : `Auxiliary space remained ${origSpace}.`
  });

  // Findings delta
  const origFindings = originalAnalysis.findings.length;
  const refacFindings = refactoredAnalysis.findings.length;
  const findingsDiff = refacFindings - origFindings;
  deltas.push({
    metric: 'Identified Quality Findings',
    originalValue: origFindings,
    refactoredValue: refacFindings,
    difference: findingsDiff > 0 ? `+${findingsDiff}` : `${findingsDiff}`,
    improved: findingsDiff < 0,
    explanation: findingsDiff < 0
      ? `Resolved ${Math.abs(findingsDiff)} potential code smells/risks.`
      : findingsDiff === 0
      ? `Zero regression in static findings.`
      : `Introduced ${findingsDiff} new findings.`
  });

  const changeSummary = [
    `Original Code: ${origLOC} LOC | Peak CC: ${origCC} | MI: ${origMI} | Time: ${origTime} | Space: ${origSpace}`,
    `Refactored Code: ${refacLOC} LOC | Peak CC: ${refacCC} | MI: ${refacMI} | Time: ${refacTime} | Space: ${refacSpace}`,
    `Net Impact: ${deltas.filter(d => d.improved === true).length} metrics improved, ${deltas.filter(d => d.improved === false).length} degraded.`
  ].join('\n');

  return {
    originalCode,
    refactoredCode,
    deltas,
    originalAnalysis,
    refactoredAnalysis,
    changeSummary
  };
}

function isComplexityBetter(newComp: string, oldComp: string): boolean | null {
  const ranks: Record<string, number> = {
    'O(1)': 1,
    'O(log n)': 2,
    'O(n)': 3,
    'O(n log n)': 4,
    'O(n^2)': 5,
    'O(n^3)': 6,
    'O(2^n)': 7
  };

  const newR = ranks[newComp] || 4;
  const oldR = ranks[oldComp] || 4;
  if (newR < oldR) return true;
  if (newR > oldR) return false;
  return null;
}
