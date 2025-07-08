
// Core types for the NeuroLint orchestration system
export interface LayerConfig {
  id: number;
  name: string;
  description: string;
  supportsAST: boolean;
  critical: boolean;
  regexTransform?: (code: string) => Promise<string>;
}

export interface TransformationResult {
  success: boolean;
  code: string;
  originalCode: string;
  error?: string;
  executionTime: number;
  changeCount: number;
}

export interface LayerResult {
  layerId: number;
  success: boolean;
  code: string;
  executionTime: number;
  changeCount: number;
  improvements?: string[];
  revertReason?: string;
  error?: string;
}

export interface LayerExecutionResult {
  finalCode: string;
  results: LayerResult[];
  states: string[];
  totalExecutionTime: number;
  successfulLayers: number;
}

export interface ValidationResult {
  shouldRevert: boolean;
  reason?: string;
}

export interface DetectedIssue {
  type: 'config' | 'pattern' | 'component' | 'hydration';
  severity: 'low' | 'medium' | 'high';
  description: string;
  fixedByLayer: number;
  pattern: string;
  count?: number;
}

export interface LayerRecommendation {
  recommendedLayers: number[];
  detectedIssues: DetectedIssue[];
  reasoning: string[];
  confidence: number;
  estimatedImpact: ImpactEstimate;
}

export interface ImpactEstimate {
  level: 'low' | 'medium' | 'high';
  description: string;
  estimatedFixTime: string;
}

export interface ErrorInfo {
  category: 'syntax' | 'parsing' | 'filesystem' | 'config' | 'pattern' | 'component' | 'hydration' | 'unknown';
  message: string;
  suggestion: string;
  recoveryOptions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface ExecutionOptions {
  dryRun?: boolean;
  verbose?: boolean;
  useCache?: boolean;
  skipUnnecessary?: boolean;
  preProcess?: boolean;
  postProcess?: boolean;
}

export interface PipelineState {
  step: number;
  layerId: number | null;
  code: string;
  timestamp: number;
  description: string;
  success?: boolean;
  executionTime?: number;
  changeCount?: number;
  error?: string;
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
  improvements: string[];
}

export interface RecoverySuggestion {
  type: string;
  title: string;
  description: string;
  actions: string[];
}
