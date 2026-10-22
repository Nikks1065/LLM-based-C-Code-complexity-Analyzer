/**
 * Maintainability Index (MI) Analyzer
 * Implements the canonical Software Engineering Institute (SEI) / Coleman & Oman formula
 * with normalized 0-100 scaling and optional comment-percentage adjustment.
 */

import type { MaintainabilityMetrics } from '../types/analyzer.ts';

export function analyzeMaintainability(
  halsteadVolume: number,
  cyclomaticComplexity: number,
  linesOfCode: number,
  commentRatio = 0
): MaintainabilityMetrics {
  // Ensure safe positive values for logarithmic terms
  const safeV = Math.max(1, halsteadVolume);
  const safeG = Math.max(1, cyclomaticComplexity);
  const safeLOC = Math.max(1, linesOfCode);

  const lnV = Math.log(safeV);
  const lnLOC = Math.log(safeLOC);

  // Original SEI / Coleman-Oman formula (without comments):
  // MI_raw = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
  const termV = 5.2 * lnV;
  const termG = 0.23 * safeG;
  const termLOC = 16.2 * lnLOC;

  const rawScore = 171 - termV - termG - termLOC;

  // Comment adjustment term: 50 * sin(sqrt(2.4 * perCM)) where perCM is fraction (0.0 - 0.99)
  const perCM = Math.min(0.99, Math.max(0, commentRatio / 100));
  const commentBonus = 50 * Math.sin(Math.sqrt(2.4 * perCM));
  const rawScoreWithComments = rawScore + commentBonus;

  // Normalized to 0-100 scale (Microsoft / Carnegie Mellon SEI standard):
  // MI_normalized = max(0, min(100, MI_raw * 100 / 171))
  const normalizedScore = Math.max(0, Math.min(100, (rawScoreWithComments * 100) / 171));

  let category: 'High Maintainability' | 'Moderate Maintainability' | 'Low Maintainability' = 'High Maintainability';
  if (normalizedScore < 65) {
    category = 'Low Maintainability';
  } else if (normalizedScore < 85) {
    category = 'Moderate Maintainability';
  }

  const stepByStepSubstitution = [
    'Formula: MI_raw = 171 - 5.2 × ln(V) - 0.23 × G - 16.2 × ln(LOC) + 50 × sin(√(2.4 × perCM))',
    `1. Input Parameters:`,
    `   - Halstead Volume (V) = ${safeV.toFixed(2)} (ln(V) = ${lnV.toFixed(4)})`,
    `   - Cyclomatic Complexity (G) = ${safeG}`,
    `   - Lines of Code (LOC) = ${safeLOC} (ln(LOC) = ${lnLOC.toFixed(4)})`,
    `   - Comment Ratio (perCM) = ${(perCM * 100).toFixed(1)}% (${perCM.toFixed(4)})`,
    `2. Term Calculations:`,
    `   - 5.2 × ln(V) = 5.2 × ${lnV.toFixed(4)} = ${termV.toFixed(4)}`,
    `   - 0.23 × G = 0.23 × ${safeG} = ${termG.toFixed(4)}`,
    `   - 16.2 × ln(LOC) = 16.2 × ${lnLOC.toFixed(4)} = ${termLOC.toFixed(4)}`,
    `   - Base MI = 171 - ${termV.toFixed(2)} - ${termG.toFixed(2)} - ${termLOC.toFixed(2)} = ${rawScore.toFixed(2)}`,
    `   - Comment Factor = 50 × sin(√(2.4 × ${perCM.toFixed(4)})) = +${commentBonus.toFixed(2)}`,
    `   - Raw Score (with comment bonus) = ${rawScoreWithComments.toFixed(2)}`,
    `3. Normalization (0-100 scale):`,
    `   - MI_norm = max(0, min(100, ${rawScoreWithComments.toFixed(2)} × 100 / 171)) = ${normalizedScore.toFixed(2)}`
  ];

  const limitations = [
    'Empirical Basis: Weights (171, 5.2, 0.23, 16.2) were fitted on historical C/Hewlett-Packard codebases (Oman & Hagemeister, 1992).',
    'Volume Sensitivity: For extremely large monolithic functions with high vocabulary, ln(V) heavily discounts maintainability.',
    'Comment Bias: Adding trivial or outdated comments artificially inflates the comment bonus without improving code comprehension.',
    'Structural Blindness: Does not capture coupling between modules, pointer aliasing, or architectural cohesion directly.'
  ];

  return {
    formulaName: 'Coleman-Oman / SEI Normalized Maintainability Index',
    citation: 'Oman, P., & Hagemeister, J. (1992). Metrics for assessing a software system’s maintainability. IEEE ICSM; Welker et al. (1997) SEI CMU.',
    rawScore: Number(rawScoreWithComments.toFixed(2)),
    normalizedScore: Number(normalizedScore.toFixed(2)),
    category,
    commentFactorIncluded: true,
    stepByStepSubstitution,
    limitations
  };
}
