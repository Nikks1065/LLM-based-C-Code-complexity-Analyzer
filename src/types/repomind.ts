/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  defaultBranch: string;
  selectedBranch: string;
  branches: string[];
  primaryLanguage: string;
  languagesDistribution: Record<string, number>;
  license?: string;
  updatedAt: string;
  createdAt: string;
  sizeKB: number;
  isPrivate: boolean;
  htmlUrl: string;
}

export interface RepoFileNode {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  extension?: string;
  language?: string;
  sha?: string;
  url?: string;
  children?: RepoFileNode[];
  complexity?: FileComplexity;
}

export interface FunctionComplexity {
  name: string;
  lineStart: number;
  lineEnd: number;
  paramsCount: number;
  loc: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  timeComplexityEstimate: string;
  spaceComplexityEstimate: string;
  warnings: string[];
}

export interface CodeSmell {
  id: string;
  type: string;
  description: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
  codeSnippet?: string;
}

export interface FileComplexity {
  filePath: string;
  language: string;
  loc: number;
  sloc: number;
  cloc: number;
  blankLines: number;
  cyclomaticComplexity: number;
  averageFunctionComplexity: number;
  maintainabilityIndex: number;
  maintainabilityRating: 'High' | 'Moderate' | 'Low';
  estimatedTimeComplexity: string;
  estimatedSpaceComplexity: string;
  timeComplexityReasoning: string;
  spaceComplexityReasoning: string;
  functions: FunctionComplexity[];
  codeSmells: CodeSmell[];
  staticVsAiDetails: {
    staticMethod: string;
    parserDerived: boolean;
    aiAssisted: boolean;
    confidenceScore: number;
  };
}

export interface CodeReviewFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  snippet: string;
  explanation: string;
  suggestedFix: string;
  confidence: number;
  category: 'security' | 'bug' | 'performance' | 'maintainability' | 'error-handling';
}

export interface DependencyItem {
  name: string;
  version: string;
  type: 'runtime' | 'dev' | 'peer' | 'system';
  category: 'core' | 'framework' | 'ui' | 'database' | 'security' | 'testing' | 'tooling' | 'utility';
  isOutdated?: boolean;
  riskNotice?: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'api' | 'database' | 'config' | 'service' | 'doc';
  path: string;
  details?: string;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'calls' | 'imports' | 'connects' | 'renders';
}

export interface ArchitectureMapData {
  summary: string;
  frontendModules: string[];
  backendModules: string[];
  apiRoutes: string[];
  databaseFiles: string[];
  configFiles: string[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface OnboardingGuideData {
  overview: string;
  techStack: string[];
  folderStructureExplanation: string;
  setupInstructions: string[];
  entryPoints: string[];
  coreModules: { name: string; description: string; files: string[] }[];
  executionFlow: string;
  apiCommunicationFlow: string;
  databaseStructure: string;
  topFilesToReadFirst: { path: string; reason: string }[];
  suggestedLearningPath: string[];
}

export interface GeneratedDocs {
  readme: string;
  architectureDoc: string;
  apiDoc: string;
  techStackSpec: string;
}

export interface CodeChunk {
  id: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  symbolName?: string;
  tokenCount: number;
}

export interface SearchResult {
  chunk: CodeChunk;
  score: number;
  snippet: string;
  matchType: 'semantic' | 'keyword' | 'symbol';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: {
    filePath: string;
    startLine?: number;
    endLine?: number;
    snippet?: string;
  }[];
  suggestedQuestions?: string[];
}

export interface RepositoryAnalysis {
  repo: RepoMetadata;
  totalFiles: number;
  totalLOC: number;
  overallMaintainability: number;
  avgCyclomaticComplexity: number;
  fileComplexities: FileComplexity[];
  topComplexFiles: FileComplexity[];
  languageStats: Record<string, { files: number; loc: number; percentage: number }>;
  architecture: ArchitectureMapData;
  codeReviewFindings: CodeReviewFinding[];
  dependencies: DependencyItem[];
  onboardingGuide: OnboardingGuideData;
  documentation: GeneratedDocs;
  indexedChunksCount: number;
  analyzedAt: string;
}
