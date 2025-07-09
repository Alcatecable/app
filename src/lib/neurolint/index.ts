
// Main exports for the NeuroLint orchestration system
export { NeuroLintOrchestrator } from './orchestrator';
export { SmartLayerSelector } from './smart-selector';
export { LayerDependencyManager } from './dependency-manager';
export { TransformationValidator } from './validation';
export { TransformationPipeline } from './pipeline';
export { ErrorRecoverySystem } from './error-recovery';
export { logger } from './logger';
export { metrics } from './metrics';

// Export types
export type {
  LayerConfig,
  TransformationResult,
  LayerResult,
  LayerExecutionResult,
  ValidationResult,
  DetectedIssue,
  LayerRecommendation,
  ImpactEstimate,
  ErrorInfo,
  ExecutionOptions,
  PipelineState,
  PipelineResult,
  LayerMetadata,
  RecoverySuggestion,
  ErrorRecoveryStrategy
} from './types';

export type {
  LogContext,
  LogEntry
} from './types';

export type {
  PerformanceMetrics
} from './types';

// Export constants
export {
  LAYER_EXECUTION_ORDER,
  LAYER_CONFIGS,
  LAYER_DEPENDENCIES,
  LAYER_INFO
} from './constants';
