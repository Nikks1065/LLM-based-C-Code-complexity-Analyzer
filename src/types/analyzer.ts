/**
 * Core type definitions for C Code Intelligence Analyzer
 */

export type LineCategory = 'blank' | 'comment' | 'code' | 'code_and_comment';

export interface LOCLineDetail {
  lineNumber: number;
  content: string;
  category: LineCategory;
  explanation: string;
}

export interface LOCMetrics {
  totalPhysical: number;
  codeOnly: number;
  commentOnly: number;
  codeAndComment: number;
  blank: number;
  nonEmpty: number;
  commentRatio: number; // percentage (0 - 100)
  lines: LOCLineDetail[];
  countingRules: string[];
}

export interface DecisionPoint {
  id: string;
  type: 'if' | 'for' | 'while' | 'do_while' | 'case' | 'logical_and' | 'logical_or' | 'ternary';
  lineNumber: number;
  codeSnippet: string;
  description: string;
  contribution: number; // usually +1
}

export interface CFGNode {
  id: string;
  label: string;
  type: 'entry' | 'decision' | 'statement' | 'join' | 'exit';
  lineNumber?: number;
  codeSnippet?: string;
}

export interface CFGEdge {
  from: string;
  to: string;
  label?: string; // 'true' | 'false' | 'loop' | 'fallthrough'
}

export interface CFGGraph {
  nodes: CFGNode[];
  edges: CFGEdge[];
  connectedComponents: number;
  cyclomaticComplexity: number;
}

export interface CyclomaticMetrics {
  formulaUsed: string; // M = E - N + 2P or M = π + 1
  edgesCount: number;
  nodesCount: number;
  connectedComponents: number;
  decisionPointsCount: number;
  score: number;
  riskLevel: 'Low (1-10)' | 'Moderate (11-20)' | 'High (21-50)' | 'Untestable (>50)';
  stepByStepCalculation: string;
  decisionPoints: DecisionPoint[];
  cfg: CFGGraph;
}

export interface TokenOccurrence {
  token: string;
  category: 'operator' | 'operand';
  count: number;
  lineNumbers: number[];
  classificationReason: string;
}

export interface HalsteadMetrics {
  distinctOperators: number; // n1
  distinctOperands: number; // n2
  totalOperators: number; // N1
  totalOperands: number; // N2
  programVocabulary: number; // n = n1 + n2
  programLength: number; // N = N1 + N2
  volume: number; // V = N * log2(n)
  difficulty: number; // D = (n1 / 2) * (N2 / n2)
  effort: number; // E = D * V
  timeSeconds: number; // T = E / 18
  estimatedBugs: number; // B = V / 3000
  operatorTable: TokenOccurrence[];
  operandTable: TokenOccurrence[];
  derivations: {
    vocabulary: string;
    length: string;
    volume: string;
    difficulty: string;
    effort: string;
    time: string;
    bugs: string;
  };
}

export interface MaintainabilityMetrics {
  formulaName: string;
  citation: string;
  rawScore: number;
  normalizedScore: number; // 0 - 100 scale
  category: 'High Maintainability' | 'Moderate Maintainability' | 'Low Maintainability';
  commentFactorIncluded: boolean;
  stepByStepSubstitution: string[];
  limitations: string[];
}

export interface LoopNestingInfo {
  loopType: 'for' | 'while' | 'do_while';
  startLine: number;
  endLine: number;
  nestingDepth: number;
  loopVariable?: string;
  boundExpression?: string;
  stepExpression?: string;
  stepType: 'linear' | 'logarithmic' | 'constant' | 'unknown';
  estimatedIterations: string;
  codeSnippet: string;
}

export interface BigODerivationStep {
  stepNumber: number;
  description: string;
  mathematicalExpression: string;
  sourceLines: number[];
}

export interface BigOTimeMetrics {
  asymptoticNotation: string; // e.g. "O(n^2)", "O(n log n)", "O(1)"
  bestCase: string;
  averageCase: string;
  worstCase: string;
  dominantTerm: string;
  operationCountModel: string; // T(n) = ...
  identifiedInputVariables: string[];
  loops: LoopNestingInfo[];
  isRecursive: boolean;
  recursionType?: 'linear' | 'divide_and_conquer' | 'branching' | 'none';
  recursionDetails?: string;
  confidence: 'High' | 'Medium' | 'Heuristic / Estimated' | 'Unable to determine reliably';
  reasoning: string[];
  derivationSteps: BigODerivationStep[];
  limitations: string[];
  growthDataPoints: { n: number; operations: number; baselineO1: number; baselineOlogn: number; baselineOn: number; baselineOnlogn: number; baselineOn2: number }[];
}

export interface MemoryAllocationSite {
  type: 'malloc' | 'calloc' | 'realloc' | 'vla' | 'fixed_array' | 'scalar';
  lineNumber: number;
  variableName?: string;
  sizeExpression: string;
  sizeExpr?: string;
  asymptoticSpace: string;
  hasFreeSite: boolean;
  freeLineNumber?: number;
  codeSnippet: string;
}

export interface SpaceComplexityMetrics {
  asymptoticNotation: string; // e.g. "O(1)", "O(n)"
  auxiliarySpace: string;
  inputStorage: string;
  totalSpace: string;
  stackMemory: {
    maxDepth: string;
    asymptoticStackSpace: string;
    explanation: string;
  };
  allocations: MemoryAllocationSite[];
  potentialLeaks: {
    lineNumber: number;
    variableName?: string;
    message: string;
  }[];
  derivationSteps: string[];
  confidence: 'High' | 'Medium' | 'Heuristic';
}

export interface FunctionAnalysis {
  name: string;
  returnType: string;
  parameters: { type: string; name: string }[];
  startLine: number;
  endLine: number;
  loc: LOCMetrics;
  cyclomatic: CyclomaticMetrics;
  halstead: HalsteadMetrics;
  maintainability: MaintainabilityMetrics;
  timeComplexity: BigOTimeMetrics;
  spaceComplexity: SpaceComplexityMetrics;
  localVariables: { name: string; type: string; line: number }[];
  calls: string[];
}

export interface QualityFinding {
  id: string;
  title: string;
  category: 'Performance' | 'Memory Safety' | 'Maintainability' | 'Correctness' | 'Style';
  severity: 'High' | 'Medium' | 'Low' | 'Info';
  isConfirmed: boolean;
  functionName?: string;
  lineNumbers: number[];
  codeSnippet: string;
  explanation: string;
  suggestedFix: string;
  limitations: string;
}

export interface ParserDiagnostic {
  severity: 'error' | 'warning' | 'info';
  line: number;
  column: number;
  message: string;
}

export interface CompleteAnalysisResult {
  sourceCode: string;
  fileDetails: {
    fileName: string;
    totalLines: number;
    characterCount: number;
    byteSize: number;
    parsedAt: string;
  };
  diagnostics: ParserDiagnostic[];
  programLOC: LOCMetrics;
  programCyclomatic: {
    sumComplexity: number;
    averageComplexity: number;
    maxComplexity: number;
    highestComplexityFunction: string;
    overallRisk: string;
  };
  programHalstead: HalsteadMetrics;
  programMaintainability: MaintainabilityMetrics;
  programTimeComplexity: {
    overallBigO: string;
    explanation: string;
  };
  programSpaceComplexity: {
    overallBigO: string;
    explanation: string;
  };
  functions: FunctionAnalysis[];
  findings: QualityFinding[];
}

export interface MetricDelta {
  metric: string;
  originalValue: string | number;
  refactoredValue: string | number;
  difference: string;
  improved: boolean | null; // true = improved, false = degraded, null = neutral
  explanation: string;
}

export interface RefactorComparison {
  originalCode: string;
  refactoredCode: string;
  deltas: MetricDelta[];
  originalAnalysis: CompleteAnalysisResult;
  refactoredAnalysis: CompleteAnalysisResult;
  changeSummary: string;
}

export interface AIReviewResponse {
  summary: string;
  architecturalOverview: string;
  findings: {
    title: string;
    category: 'Performance' | 'Memory Safety' | 'Maintainability' | 'Correctness' | 'Style';
    severity: 'High' | 'Medium' | 'Low' | 'Info';
    functionName: string;
    lines: number[];
    snippet: string;
    whyItIsAProblem: string;
    suggestedFix: string;
    evidenceAndLimitations: string;
  }[];
  overallAssessment: string;
}

export interface AIRefactorResponse {
  refactoredCode: string;
  summaryOfChanges: string[];
  expectedImpact: {
    timeComplexity: string;
    spaceComplexity: string;
    maintainability: string;
    readabilityTradeoffs: string;
  };
  testingRequirements: string[];
}
