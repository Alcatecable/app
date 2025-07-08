import { LayerExecutionResult, ExecutionOptions, LayerResult } from './types';
import { TransformationValidator } from './validation';
import { LayerDependencyManager } from './dependency-manager';
import { SmartLayerSelector } from './smart-selector';
import { TransformationPipeline } from './pipeline';
import { ErrorRecoverySystem } from './error-recovery';
import { LAYER_CONFIGS } from './constants';

/**
 * Main NeuroLint orchestration system
 * Coordinates all layers with safe execution and comprehensive error handling
 */
export class NeuroLintOrchestrator {
  
  /**
   * Main entry point for code transformation
   */
  static async transform(
    code: string,
    requestedLayers?: number[],
    options: ExecutionOptions = {}
  ): Promise<LayerExecutionResult> {
    
    console.log('🚀 Starting NeuroLint transformation...');
    
    // Determine which layers to run
    const layers = this.determineLayers(code, requestedLayers);
    
    // Validate and correct layer dependencies
    const { correctedLayers, warnings } = LayerDependencyManager.validateAndCorrectLayers(layers);
    
    // Log warnings
    warnings.forEach(warning => console.warn('⚠️ ', warning));
    
    // Execute layers safely
    return await this.executeLayers(code, correctedLayers, options);
  }
  
  /**
   * Analyze code and get recommendations without executing
   */
  static analyze(code: string, filePath?: string) {
    return SmartLayerSelector.analyzeAndRecommend(code, filePath);
  }
  
  /**
   * Execute layers with automatic rollback on failure
   */
  private static async executeLayers(
    code: string,
    enabledLayers: number[],
    options: ExecutionOptions = {}
  ): Promise<LayerExecutionResult> {
    
    let current = code;
    const results: LayerResult[] = [];
    const states: string[] = [code];
    
    for (const layerId of enabledLayers) {
      const previous = current;
      const startTime = performance.now();
      
      if (options.verbose) {
        console.log(`🔧 Executing Layer ${layerId}: ${LAYER_CONFIGS[layerId]?.name}...`);
      }
      
      try {
        // Apply transformation
        const transformed = await this.executeLayer(layerId, current, options);
        
        // Validate transformation safety
        const validation = TransformationValidator.validateTransformation(previous, transformed);
        
        if (validation.shouldRevert) {
          console.warn(`⚠️  Reverting Layer ${layerId}: ${validation.reason}`);
          current = previous; // Rollback to safe state
          
          results.push({
            layerId,
            success: false,
            code: previous,
            executionTime: performance.now() - startTime,
            changeCount: 0,
            revertReason: validation.reason
          });
        } else {
          current = transformed; // Accept changes
          states.push(current);
          
          results.push({
            layerId,
            success: true,
            code: current,
            executionTime: performance.now() - startTime,
            changeCount: this.calculateChanges(previous, transformed),
            improvements: this.detectImprovements(previous, transformed)
          });
        }
        
      } catch (error) {
        console.error(`❌ Layer ${layerId} failed:`, error);
        
        results.push({
          layerId,
          success: false,
          code: previous, // Keep previous safe state
          executionTime: performance.now() - startTime,
          changeCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return {
      finalCode: current,
      results,
      states,
      totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
      successfulLayers: results.filter(r => r.success).length
    };
  }
  
  /**
   * Determine which layers to execute
   */
  private static determineLayers(code: string, requestedLayers?: number[]): number[] {
    if (requestedLayers && requestedLayers.length > 0) {
      return requestedLayers;
    }
    
    // Use smart selection if no layers specified
    const recommendation = SmartLayerSelector.analyzeAndRecommend(code);
    return recommendation.recommendedLayers;
  }
  
  /**
   * Execute a single layer (placeholder for actual layer execution)
   */
  private static async executeLayer(layerId: number, code: string, options: ExecutionOptions): Promise<string> {
    // This would integrate with the actual layer scripts in the root directory
    // For now, simulate layer execution
    const layerConfig = LAYER_CONFIGS[layerId];
    
    if (!layerConfig) {
      throw new Error(`Unknown layer: ${layerId}`);
    }
    
    // Simulate layer execution time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return code unchanged for now (actual layer execution would happen here)
    return code;
  }
  
  /**
   * Calculate changes between two code versions
   */
  private static calculateChanges(before: string, after: string): number {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    let changes = Math.abs(beforeLines.length - afterLines.length);
    
    const minLength = Math.min(beforeLines.length, afterLines.length);
    for (let i = 0; i < minLength; i++) {
      if (beforeLines[i] !== afterLines[i]) changes++;
    }
    
    return changes;
  }
  
  /**
   * Detect improvements made by transformation
   */
  private static detectImprovements(before: string, after: string): string[] {
    const improvements: string[] = [];
    
    if (before !== after) {
      improvements.push('Code transformation applied');
    }
    
    // Detect specific improvements
    if (before.includes('&quot;') && !after.includes('&quot;')) {
      improvements.push('HTML entities converted to proper quotes');
    }
    
    if (before.includes('console.log') && !after.includes('console.log')) {
      improvements.push('Console statements removed');
    }
    
    if (before.includes('.map(') && !before.includes('key=') && after.includes('key=')) {
      improvements.push('Missing key props added');
    }
    
    if (before.includes('localStorage') && !before.includes('typeof window') && after.includes('typeof window')) {
      improvements.push('SSR guards added for browser APIs');
    }
    
    return improvements;
  }
}
