
import { Rule } from "./rules";

export interface LayerConfig {
  id: number;
  name: string;
  description: string;
  rules: Rule[];
}

export interface LayerExecutionResult {
  layerId: number;
  layerName?: string;
  success: boolean;
  executionTime: number;
  changeCount: number;
  error?: string;
  improvements?: string[];
  originalCode?: string;
  modifiedCode?: string;
}

// Extended result type for orchestrator
export interface TransformationResult {
  originalCode: string;
  finalCode: string;
  results: LayerExecutionResult[];
  successfulLayers: number;
  totalExecutionTime: number;
  states?: any[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  success: boolean;
  duration: number;
  executionTime: number;
  error?: string;
  details?: any;
}

export interface LayerTestResult {
  layerId: number;
  layerName?: string;
  success: boolean;
  executionTime: number;
  changeCount: number;
  error?: string;
  improvements?: string[];
}

export interface TestSuite {
  unitTestResults: TestResult[];
  integrationResults: TestResult[];
  layerResults: LayerTestResult[];
  performanceResults: PerformanceMetrics;
  edgeCaseResults: TestResult[];
  loadTestResults: TestResult[];
}

export interface PerformanceMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  maxMemoryUsage: number;
  cpuUsage: number;
  errors: string[];
  loadTestsPassed?: boolean;
}

export interface AnalysisResult {
  confidence: number;
  estimatedImpact: ImpactAssessment;
  detectedIssues: DetectedIssue[];
  recommendedLayers: number[];
  reasoning: string[];
}

export interface ImpactAssessment {
  level: string;
  estimatedFixTime: string;
}

export interface DetectedIssue {
  severity: string;
  pattern: string;
  description: string;
  fixedByLayer: number;
}

// Error recovery types
export interface ErrorInfo {
  code: string;
  message: string;
  layer: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

export interface RecoverySuggestion {
  action: string;
  description: string;
  priority: number;
  estimatedEffectiveness: number;
}

export interface LayerResult {
  layerId: number;
  success: boolean;
  error?: string;
  executionTime: number;
  changeCount: number;
  transformedCode?: string;
}

export interface ErrorRecoveryStrategy {
  name: string;
  canHandle: (error: ErrorInfo) => boolean;
  recover: (error: ErrorInfo, context: any) => Promise<RecoverySuggestion[]>;
}

// Additional missing types
export interface ValidationResult {
  isValid: boolean;
  shouldRevert: boolean;
  errors: string[];
  warnings: string[];
}

export interface LayerRecommendation {
  layerId: number;
  confidence: number;
  reasoning: string;
}

export interface ImpactEstimate {
  level: 'low' | 'medium' | 'high';
  timeEstimate: string;
  riskLevel: number;
}

export interface ExecutionOptions {
  verbose: boolean;
  dryRun: boolean;
  timeout?: number;
}

export interface PipelineState {
  currentLayer: number;
  completed: boolean;
  errors: ErrorInfo[];
}

export interface PipelineResult {
  success: boolean;
  results: LayerResult[];
  totalTime: number;
}

export interface LayerMetadata {
  id: number;
  name: string;
  version: string;
  dependencies: number[];
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: LogContext;
}

export interface LogContext {
  [key: string]: any;
  layerId?: number;
  changeCount?: number;
  error?: string;
  ruleCount?: number;
  attempt?: number;
  originalError?: string;
  category?: string;
  exampleId?: string;
  patternId?: string;
  removedPatterns?: number;
}
