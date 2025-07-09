
/**
 * NeuroLint Orchestrator
 * Main orchestration engine following the patterns from MUST READ Orchestration Implementation Patterns.MD
 */

import { LayerExecutionResult, TransformationResult, AnalysisResult, ValidationResult } from "./types";
import { NeuroLintAPIClient } from "./api-client";
import { TransformationValidator } from "./validation";
import { AdvancedPatternLearner } from "./pattern-learner/advanced-pattern-learner";
import { logger } from "./logger";
import { metrics } from "./metrics";

export class NeuroLintOrchestrator {
  private static patternLearner = new AdvancedPatternLearner();
  
  /**
   * Analyze code to detect issues and recommend layers
   * Following the Safe Layer Execution Pattern
   */
  static async analyze(code: string): Promise<AnalysisResult> {
    logger.info('Starting code analysis', { 
      layerId: 0,
      metadata: { codeLength: code.length }
    });
    
    try {
      const analysis = await NeuroLintAPIClient.analyzeCode(code);
      
      logger.info('Code analysis completed', {
        layerId: 0,
        metadata: { detectedIssues: analysis.detectedIssues.length }
      });
      
      return analysis;
    } catch (error) {
      logger.error('Code analysis failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Execute complete transformation pipeline with full state tracking
   * Implements the Safe Layer Execution Pattern with rollback capability
   */
  static async transform(
    code: string,
    enabledLayers: number[],
    options: { verbose: boolean; dryRun: boolean }
  ): Promise<TransformationResult> {
    const startTime = performance.now();
    let currentCode = code;
    let successfulLayers = 0;
    const results: LayerExecutionResult[] = [];
    const states: string[] = [code]; // Track all intermediate states for rollback

    logger.info('Starting transformation session', { 
      layerId: 0,
      enabledLayers: enabledLayers.join(','),
      changeCount: 0
    });
    metrics.recordLayerExecution(0, 0);

    // Validate and correct layer dependencies following Layer Dependency Management
    const correctedLayers = this.validateAndCorrectLayers(enabledLayers);
    if (correctedLayers.autoAdded.length > 0) {
      logger.info('Auto-added missing layer dependencies', {
        layerId: 0,
        metadata: { autoAddedLayers: correctedLayers.autoAdded }
      });
    }

    for (const layerId of correctedLayers.correctedLayers) {
      const layerStartTime = performance.now();
      const previousCode = currentCode;

      try {
        logger.info(`Executing layer ${layerId}...`);
        
        // Execute layer with API
        const layerResult = await NeuroLintAPIClient.executeLayer(layerId, currentCode, options);

        if (layerResult.success && layerResult.transformedCode) {
          // Validate transformation safety following Incremental Validation System
          const validation = TransformationValidator.validateTransformation(
            previousCode, 
            layerResult.transformedCode,
            layerId
          );

          if (validation.shouldRevert) {
            logger.error(`Reverting Layer ${layerId}: ${validation.reason}`);
            
            results.push({
              layerId,
              layerName: this.getLayerName(layerId),
              success: false,
              executionTime: performance.now() - layerStartTime,
              changeCount: 0,
              revertReason: validation.reason,
              error: `Transformation reverted: ${validation.reason}`
            });
            
            // Keep previous safe state
            currentCode = previousCode;
          } else {
            // Accept transformation
            currentCode = layerResult.transformedCode;
            states.push(currentCode);
            successfulLayers++;
            
            logger.info(
              `Layer ${layerId} applied successfully. Changes: ${layerResult.changeCount}`
            );
            metrics.recordLayerExecution(layerId, true, performance.now() - layerStartTime, layerResult.changeCount || 0);

            // Learn from successful transformation (for layers 1-6)
            if (layerId >= 1 && layerId <= 6 && layerResult.changeCount && layerResult.changeCount > 0) {
              try {
                await this.patternLearner.learnFromTransformation(
                  previousCode,
                  layerResult.transformedCode,
                  layerId,
                  { projectType: 'neurolint-transformation' }
                );
                logger.info(`Pattern learning completed for Layer ${layerId}`, {
                  layerId,
                  metadata: { transformedCode: true }
                });
              } catch (error) {
                logger.error(`Pattern learning failed for Layer ${layerId}`, error instanceof Error ? error : new Error(String(error)));
              }
            }

            results.push({
              layerId,
              layerName: this.getLayerName(layerId),
              success: true,
              executionTime: performance.now() - layerStartTime,
              changeCount: layerResult.changeCount || 0,
              improvements: layerResult.improvements || [],
            });
          }
        } else {
          // Layer execution failed
          logger.error(`Layer ${layerId} failed`, new Error(layerResult.error || 'Layer execution failed'));
          
          results.push({
            layerId,
            layerName: this.getLayerName(layerId),
            success: false,
            executionTime: performance.now() - layerStartTime,
            changeCount: 0,
            error: layerResult.error || 'Layer execution failed',
          });
        }
      } catch (error: any) {
        logger.error(`Layer ${layerId} execution failed`, error instanceof Error ? error : new Error(String(error)));
        metrics.recordLayerExecution(layerId, 0);
        
        results.push({
          layerId,
          layerName: this.getLayerName(layerId),
          success: false,
          executionTime: performance.now() - layerStartTime,
          changeCount: 0,
          error: error.message || 'Unknown error',
        });
      }
    }

    const totalExecutionTime = performance.now() - startTime;
    logger.info('Transformation session completed', {
      layerId: 0,
      metadata: { 
        codeChangeSize: currentCode.length - code.length,
        successfulLayers
      }
    });

    return {
      originalCode: code,
      finalCode: currentCode,
      results,
      successfulLayers,
      totalExecutionTime,
      states
    };
  }

  /**
   * Execute a single layer transformation
   */
  static async executeLayer(layerId: number, code: string, options: any): Promise<string> {
    try {
      const result = await NeuroLintAPIClient.executeLayer(layerId, code, options);
      
      if (result.success && result.transformedCode) {
        return result.transformedCode;
      } else {
        throw new Error(result.error || `Layer ${layerId} execution failed`);
      }
    } catch (error) {
      logger.error(`Layer ${layerId} execution failed`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Validate layer dependencies and auto-correct selection
   * Implements Layer Dependency Management pattern
   */
  private static validateAndCorrectLayers(requestedLayers: number[]): {
    correctedLayers: number[];
    warnings: string[];
    autoAdded: number[];
  } {
    const DEPENDENCIES = {
      1: [], // Configuration has no dependencies
      2: [1], // Pattern recognition depends on config foundation
      3: [1, 2], // Components depend on config + cleanup
      4: [1, 2, 3], // Hydration depends on all previous layers
      5: [1], // Next.js fixes depend on config
      6: [1], // Testing depends on config
      7: [1, 2, 3, 4, 5, 6], // Adaptive learning depends on all previous layers
    };

    const warnings: string[] = [];
    const autoAdded: number[] = [];
    let correctedLayers = [...requestedLayers];

    // Check dependencies for each requested layer
    for (const layerId of requestedLayers) {
      const dependencies = DEPENDENCIES[layerId as keyof typeof DEPENDENCIES] || [];
      const missingDeps = dependencies.filter(dep => !correctedLayers.includes(dep));

      if (missingDeps.length > 0) {
        correctedLayers.push(...missingDeps);
        autoAdded.push(...missingDeps);
        
        warnings.push(
          `Layer ${layerId} requires ${missingDeps.join(', ')}. Auto-added missing dependencies.`
        );
      }
    }

    // Remove duplicates and sort
    correctedLayers = [...new Set(correctedLayers)].sort((a, b) => a - b);

    return {
      correctedLayers,
      warnings,
      autoAdded
    };
  }

  /**
   * Get smart layer recommendations
   */
  static async getSmartRecommendations(code: string): Promise<{ recommendedLayers: number[]; reasoning: string[] }> {
    try {
      return await NeuroLintAPIClient.getSmartRecommendations(code);
    } catch (error) {
      logger.error('Smart recommendations failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * Maintains compatibility with existing UI components
   */
  static async processCode(
    code: string,
    options?: { selectedLayers?: number[]; enablePatternLearning?: boolean }
  ): Promise<TransformationResult> {
    const selectedLayers = options?.selectedLayers || [1, 2, 3, 4];
    
    return this.transform(code, selectedLayers, {
      verbose: true,
      dryRun: false
    });
  }

  /**
   * Validate transformation result
   */
  static async validateTransformation(
    originalCode: string,
    transformedCode: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      return await NeuroLintAPIClient.validateTransformation(originalCode, transformedCode);
    } catch (error) {
      logger.error('Transformation validation failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get layer name for display purposes
   */
  private static getLayerName(layerId: number): string {
    const layerNames = {
      1: 'Configuration',
      2: 'Pattern Recognition',
      3: 'Component Enhancement',
      4: 'Hydration & SSR',
      5: 'Next.js App Router',
      6: 'Testing & Validation',
      7: 'Adaptive Learning'
    };
    return layerNames[layerId as keyof typeof layerNames] || `Layer ${layerId}`;
  }
}
