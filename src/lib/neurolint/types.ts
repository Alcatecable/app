
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
  code?: string;
  transformedCode?: string;
  revertReason?: string;
  errorCategory?: string;
  suggestion?: string;
  recoveryOptions?: string[];
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
  type?: string;
  count?: number;
}

// Error recovery types
export interface ErrorInfo {
  code: string;
  message: string;
  layer: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  category?: string;
  suggestion?: string;
  recoveryOptions?: string[];
  automated?: boolean;
  retryable?: boolean;
  confidence?: number;
}

export interface RecoverySuggestion {
  action: string;
  description: string;
  priority: number;
  estimatedEffectiveness: number;
  type?: string;
  title?: string;
  actions?: string[];
}

export interface LayerResult {
  layerId: number;
  success: boolean;
  error?: string;
  executionTime: number;
  changeCount: number;
  transformedCode?: string;
  code?: string;
}

export interface ErrorRecoveryStrategy {
  name: string;
  canHandle: (error: ErrorInfo) => boolean;
  recover: (error: ErrorInfo, context: any) => Promise<RecoverySuggestion[]>;
  suggestion?: string;
  recoveryOptions?: string[];
  automated?: boolean;
  retryable?: boolean;
  recoveryFunction?: (code: string, error: any) => Promise<string>;
}

// Additional missing types
export interface ValidationResult {
  isValid: boolean;
  shouldRevert: boolean;
  errors: string[];
  warnings: string[];
  reason?: string;
}

export interface LayerRecommendation {
  layerId: number;
  confidence: number;
  reasoning: string;
  recommendedLayers?: number[];
  detectedIssues?: DetectedIssue[];
  estimatedImpact?: ImpactEstimate;
}

export interface ImpactEstimate {
  level: 'low' | 'medium' | 'high';
  timeEstimate: string;
  riskLevel: number;
  description?: string;
  estimatedFixTime?: string;
}

export interface ExecutionOptions {
  verbose: boolean;
  dryRun: boolean;
  timeout?: number;
  useCache?: boolean;
  skipUnnecessary?: boolean;
  preProcess?: boolean;
  postProcess?: boolean;
}

export interface PipelineState {
  currentLayer: number;
  completed: boolean;
  errors: ErrorInfo[];
  step?: number;
  layerId?: number | null;
  code?: string;
  timestamp?: number;
  description?: string;
  success?: boolean;
  executionTime?: number;
  changeCount?: number;
}

export interface PipelineResult {
  success: boolean;
  results: LayerResult[];
  totalTime: number;
  finalCode?: string;
  states?: PipelineState[];
  metadata?: LayerMetadata[];
  summary?: {
    totalSteps: number;
    successfulLayers: number;
    failedLayers: number;
    totalExecutionTime: number;
    totalChanges: number;
  };
}

export interface LayerMetadata {
  id: number;
  name: string;
  version: string;
  dependencies: number[];
  layerId?: number;
  success?: boolean;
  executionTime?: number;
  changeCount?: number;
  error?: string;
  improvements?: string[];
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
