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
