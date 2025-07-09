export interface PipelineState {
  step: number;
  layerId: number | null;
  code: string;
  timestamp: number;
  description: string;
  success?: boolean;
  error?: string;
  executionTime?: number;
  changeCount?: number;
}

export interface PipelineResult {
  finalCode: string;
  states: PipelineState[];
  metadata: LayerMetadata[];
  summary: {
    totalSteps: number;
    successfulLayers: number;
    failedLayers: number;
    totalExecutionTime: number;
    totalChanges: number;
  };
}

export interface LayerMetadata {
  layerId: number;
  success: boolean;
  executionTime: number;
  changeCount: number;
  error?: string;
  improvements?: string[];
}

export interface LayerResult {
  layerId: number;
  success: boolean;
  code: string;
  executionTime: number;
  changeCount: number;
  error?: string;
  errorCategory?: string;
  suggestion?: string;
  recoveryOptions?: string[];
  revertReason?: string;
  improvements?: string[];
}

export interface ExecutionOptions {
  verbose?: boolean;
  dryRun?: boolean;
  selectedLayers?: number[];
  enablePatternLearning?: boolean;
  collectMetrics?: boolean;
}

export interface LayerExecutionResult {
  finalCode: string;
  results: LayerResult[];
  states: string[];
  totalExecutionTime: number;
  successfulLayers: number;
}

export interface AnalysisResult {
  detectedIssues: string[];
  recommendedLayers: number[];
}

export interface RecoverySuggestion {
  type: string;
  title: string;
  description: string;
  actions: string[];
}

// Enhanced types for new features
export interface LearnedPattern {
  id: string;
  name: string;
  type: 'regex' | 'structural' | 'context';
  description: string;
  pattern: RegExp | string;
  replacement: string | Function;
  confidence: number;
  frequency: number;
  successfulApplications: number;
  failedApplications: number;
  layerId: number;
  firstSeen: number;
  lastSeen: number;
  examples: string[];
  context?: {
    filePath?: string;
    projectType?: string;
  };
}

export interface PatternRule {
  type: 'regex' | 'structural' | 'context';
  name: string;
  description: string;
  pattern: RegExp | string;
  replacement: string | Function;
  confidence: number;
}

export interface TransformationExample {
  id: string;
  before: string;
  after: string;
  layerId: number;
  timestamp: number;
  context?: {
    filePath?: string;
    projectType?: string;
  };
  patterns: PatternRule[];
}

export interface ErrorRecoveryStrategy {
  name: string;
  suggestion: string;
  recoveryOptions: string[];
  automated: boolean;
  retryable: boolean;
  recoveryFunction?: (code: string, error: any) => Promise<string>;
}

export interface ErrorInfo {
  category: string;
  message: string;
  suggestion: string;
  recoveryOptions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  automated?: boolean;
  retryable?: boolean;
}
