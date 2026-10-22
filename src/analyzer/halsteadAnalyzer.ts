/**
 * Halstead Software Science Metrics Analyzer
 * Token-stream-based extraction of operators (n1, N1) and operands (n2, N2).
 * Formulates Vocabulary, Length, Volume, Difficulty, Effort, Time, and Bugs
 * with step-by-step substitution and zero-division handling.
 */

import type { Token } from './cLexer.ts';
import type { HalsteadMetrics, TokenOccurrence } from '../types/analyzer.ts';

const OPERATOR_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'return', 'break', 'continue', 'goto', 'sizeof', 'typedef', 'struct',
  'union', 'enum', 'extern', 'static', 'const', 'volatile', 'inline'
]);

export function analyzeHalstead(tokens: Token[]): HalsteadMetrics {
  // Exclude comments, whitespace, and preprocessor directives
  const candidateTokens = tokens.filter(t =>
    t.type !== 'WHITESPACE' &&
    t.type !== 'COMMENT' &&
    t.type !== 'PREPROCESSOR'
  );

  const operatorMap = new Map<string, { count: number; lines: number[]; reason: string }>();
  const operandMap = new Map<string, { count: number; lines: number[]; reason: string }>();

  for (const t of candidateTokens) {
    if (t.type === 'OPERATOR') {
      const entry = operatorMap.get(t.value) || { count: 0, lines: [], reason: 'Mathematical, relational, or logical operator' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operatorMap.set(t.value, entry);
    } else if (t.type === 'DELIMITER') {
      const reason = t.value === ';' ? 'Statement terminator' :
                     t.value === ',' ? 'Argument/item separator' :
                     'Scope/grouping delimiter';
      const entry = operatorMap.get(t.value) || { count: 0, lines: [], reason };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operatorMap.set(t.value, entry);
    } else if (t.type === 'KEYWORD' && OPERATOR_KEYWORDS.has(t.value)) {
      const entry = operatorMap.get(t.value) || { count: 0, lines: [], reason: 'Control flow keyword acting as language operator' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operatorMap.set(t.value, entry);
    } else if (t.type === 'IDENTIFIER') {
      const entry = operandMap.get(t.value) || { count: 0, lines: [], reason: 'Program identifier (variable or function reference)' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operandMap.set(t.value, entry);
    } else if (t.type === 'NUMBER') {
      const entry = operandMap.get(t.value) || { count: 0, lines: [], reason: 'Numeric constant literal' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operandMap.set(t.value, entry);
    } else if (t.type === 'STRING') {
      const entry = operandMap.get(t.value) || { count: 0, lines: [], reason: 'String constant value' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operandMap.set(t.value, entry);
    } else if (t.type === 'CHAR') {
      const entry = operandMap.get(t.value) || { count: 0, lines: [], reason: 'Character literal constant' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operandMap.set(t.value, entry);
    } else if (t.type === 'TYPE') {
      const entry = operatorMap.get(t.value) || { count: 0, lines: [], reason: 'Type specifier operator' };
      entry.count++;
      if (!entry.lines.includes(t.line)) entry.lines.push(t.line);
      operatorMap.set(t.value, entry);
    }
  }

  const distinctOperators = operatorMap.size; // n1
  const distinctOperands = operandMap.size; // n2

  let totalOperators = 0; // N1
  for (const v of operatorMap.values()) totalOperators += v.count;

  let totalOperands = 0; // N2
  for (const v of operandMap.values()) totalOperands += v.count;

  // Halstead calculations
  const vocabulary = distinctOperators + distinctOperands; // n = n1 + n2
  const length = totalOperators + totalOperands; // N = N1 + N2

  // Volume: V = N * log2(n)
  let volume = 0;
  if (vocabulary > 0 && length > 0) {
    volume = length * (Math.log(vocabulary) / Math.LN2);
  }

  // Difficulty: D = (n1 / 2) * (N2 / n2)
  let difficulty = 0;
  if (distinctOperands > 0) {
    difficulty = (distinctOperators / 2) * (totalOperands / distinctOperands);
  }

  // Effort: E = D * V
  const effort = difficulty * volume;

  // Time: T = E / 18 seconds (Halstead Stroud number S = 18 mental discriminations/sec)
  const timeSeconds = effort / 18;

  // Bugs: B = V / 3000
  const estimatedBugs = volume / 3000;

  // Build sorted tables
  const operatorTable: TokenOccurrence[] = Array.from(operatorMap.entries())
    .map(([token, meta]) => ({
      token,
      category: 'operator' as const,
      count: meta.count,
      lineNumbers: meta.lines.sort((a, b) => a - b),
      classificationReason: meta.reason
    }))
    .sort((a, b) => b.count - a.count);

  const operandTable: TokenOccurrence[] = Array.from(operandMap.entries())
    .map(([token, meta]) => ({
      token,
      category: 'operand' as const,
      count: meta.count,
      lineNumbers: meta.lines.sort((a, b) => a - b),
      classificationReason: meta.reason
    }))
    .sort((a, b) => b.count - a.count);

  const derivations = {
    vocabulary: `n = n₁ + n₂ = ${distinctOperators} + ${distinctOperands} = ${vocabulary}`,
    length: `N = N₁ + N₂ = ${totalOperators} + ${totalOperands} = ${length}`,
    volume: vocabulary > 0
      ? `V = N × log₂(n) = ${length} × log₂(${vocabulary}) = ${length} × ${(Math.log(vocabulary) / Math.LN2).toFixed(4)} = ${volume.toFixed(2)} bits`
      : `V = 0 (vocabulary is 0)`,
    difficulty: distinctOperands > 0
      ? `D = (n₁ / 2) × (N₂ / n₂) = (${distinctOperators} / 2) × (${totalOperands} / ${distinctOperands}) = ${(distinctOperators / 2).toFixed(2)} × ${(totalOperands / distinctOperands).toFixed(4)} = ${difficulty.toFixed(2)}`
      : `D = 0 (zero distinct operands)`,
    effort: `E = D × V = ${difficulty.toFixed(2)} × ${volume.toFixed(2)} = ${effort.toFixed(2)} elementary mental discriminations`,
    time: `T = E / 18 = ${effort.toFixed(2)} / 18 = ${timeSeconds.toFixed(2)} seconds (${(timeSeconds / 60).toFixed(2)} minutes)`,
    bugs: `B = V / 3000 = ${volume.toFixed(2)} / 3000 = ${estimatedBugs.toFixed(3)} estimated delivered faults`
  };

  return {
    distinctOperators,
    distinctOperands,
    totalOperators,
    totalOperands,
    programVocabulary: vocabulary,
    programLength: length,
    volume: Number(volume.toFixed(2)),
    difficulty: Number(difficulty.toFixed(2)),
    effort: Number(effort.toFixed(2)),
    timeSeconds: Number(timeSeconds.toFixed(2)),
    estimatedBugs: Number(estimatedBugs.toFixed(3)),
    operatorTable,
    operandTable,
    derivations
  };
}
