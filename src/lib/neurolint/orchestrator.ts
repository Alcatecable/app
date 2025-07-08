import { LayerExecutionResult, ExecutionOptions, LayerResult } from './types';
import { TransformationValidator } from './validation';
import { LayerDependencyManager } from './dependency-manager';
import { SmartLayerSelector } from './smart-selector';
import { TransformationPipeline } from './pipeline';
import { ErrorRecoverySystem } from './error-recovery';
import { LAYER_CONFIGS } from './constants';
import { logger } from './logger';
import { metrics } from './metrics';

/**
 * Enterprise-grade NeuroLint orchestration system
 * Provides robust, scalable, and observable code transformation
 */
export class NeuroLintOrchestrator {
  private static readonly MAX_RETRIES = 3;
  private static readonly TIMEOUT_MS = 30000; // 30 seconds

  /**
   * Main entry point for code transformation with enterprise features
   */
  static async transform(
    code: string,
    requestedLayers?: number[],
    options: ExecutionOptions = {}
  ): Promise<LayerExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    logger.info('Starting NeuroLint transformation', {
      executionId,
      operation: 'transform',
      metadata: {
        codeLength: code.length,
        requestedLayers,
        options
      }
    });

    try {
      // Input validation
      this.validateInput(code, requestedLayers, options);

      // Create execution context with timeout
      const result = await Promise.race([
        this.executeTransformationWithRetry(code, requestedLayers, options, executionId),
        this.createTimeoutPromise()
      ]);

      const duration = Date.now() - startTime;
      
      // Record metrics
      metrics.recordPipelineExecution(
        result.results.map(r => r.layerId),
        duration,
        result.successfulLayers,
        result.results.reduce((sum, r) => sum + r.changeCount, 0)
      );

      logger.performance('Transformation completed', duration, {
        executionId,
        metadata: {
          successfulLayers: result.successfulLayers,
          totalLayers: result.results.length
        }
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Transformation failed', error as Error, {
        executionId,
        metadata: { duration }
      });

      metrics.recordError('transformation_failure');

      // Return safe fallback result
      return {
        finalCode: code,
        results: [],
        states: [code],
        totalExecutionTime: duration,
        successfulLayers: 0
      };
    }
  }

  /**
   * Analyze code with comprehensive reporting
   */
  static analyze(code: string, filePath?: string) {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    logger.info('Starting code analysis', {
      executionId,
      operation: 'analyze',
      metadata: {
        codeLength: code.length,
        filePath
      }
    });

    try {
      const result = SmartLayerSelector.analyzeAndRecommend(code, filePath);
      
      logger.performance('Analysis completed', Date.now() - startTime, {
        executionId,
        metadata: {
          issuesFound: result.detectedIssues.length,
          recommendedLayers: result.recommendedLayers.length
        }
      });

      return result;

    } catch (error) {
      logger.error('Analysis failed', error as Error, { executionId });
      metrics.recordError('analysis_failure');
      throw error;
    }
  }

  /**
   * Execute transformation with retry logic
   */
  private static async executeTransformationWithRetry(
    code: string,
    requestedLayers: number[] | undefined,
    options: ExecutionOptions,
    executionId: string
  ): Promise<LayerExecutionResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        logger.debug(`Transformation attempt ${attempt}`, {
          executionId,
          metadata: { attempt, maxRetries: this.MAX_RETRIES }
        });

        return await this.executeLayers(code, requestedLayers, options, executionId);

      } catch (error) {
        lastError = error as Error;
        
        logger.warn(`Transformation attempt ${attempt} failed`, {
          executionId,
          metadata: { 
            attempt, 
            error: lastError.message,
            willRetry: attempt < this.MAX_RETRIES
          }
        });

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt - 1) * 1000);
        }
      }
    }

    throw lastError || new Error('All transformation attempts failed');
  }

  /**
   * Core layer execution with enhanced error handling
   */
  private static async executeLayers(
    code: string,
    requestedLayers: number[] | undefined,
    options: ExecutionOptions,
    executionId: string
  ): Promise<LayerExecutionResult> {
    // Determine layers to execute
    const layers = this.determineLayers(code, requestedLayers);
    
    // Validate and correct dependencies
    const { correctedLayers, warnings } = LayerDependencyManager.validateAndCorrectLayers(layers);
    
    // Log warnings
    warnings.forEach(warning => {
      logger.warn('Layer dependency warning', {
        executionId,
        metadata: { warning }
      });
    });

    let current = code;
    const results: LayerResult[] = [];
    const states: string[] = [code];

    for (const layerId of correctedLayers) {
      const layerTimer = metrics.startTimer('layer_execution');
      const previous = current;
      
      logger.debug(`Executing layer ${layerId}`, {
        executionId,
        layerId,
        operation: 'layer_execution'
      });

      try {
        // Execute layer with timeout
        const transformed = await Promise.race([
          this.executeLayer(layerId, current, options),
          this.createLayerTimeoutPromise(layerId)
        ]);

        // Validate transformation
        const validation = TransformationValidator.validateTransformation(previous, transformed);
        const layerDuration = metrics.endTimer(layerTimer);

        if (validation.shouldRevert) {
          logger.warn(`Reverting layer ${layerId}`, {
            executionId,
            layerId,
            metadata: { reason: validation.reason }
          });

          current = previous;
          const result: LayerResult = {
            layerId,
            success: false,
            code: previous,
            executionTime: layerDuration,
            changeCount: 0,
            revertReason: validation.reason
          };

          results.push(result);
          metrics.recordLayerExecution(layerId, false, layerDuration, 0);

        } else {
          current = transformed;
          states.push(current);
          
          const changeCount = this.calculateChanges(previous, transformed);
          const improvements = this.detectImprovements(previous, transformed);

          const result: LayerResult = {
            layerId,
            success: true,
            code: current,
            executionTime: layerDuration,
            changeCount,
            improvements
          };

          results.push(result);
          metrics.recordLayerExecution(layerId, true, layerDuration, changeCount);

          logger.info(`Layer ${layerId} completed successfully`, {
            executionId,
            layerId,
            metadata: {
              changeCount,
              improvements: improvements.length,
              duration: layerDuration
            }
          });
        }

      } catch (error) {
        const layerDuration = metrics.endTimer(layerTimer);
        
        logger.error(`Layer ${layerId} failed`, error as Error, {
          executionId,
          layerId
        });

        metrics.recordLayerExecution(layerId, false, layerDuration, 0);
        metrics.recordError('layer_execution', layerId);

        results.push({
          layerId,
          success: false,
          code: previous,
          executionTime: layerDuration,
          changeCount: 0,
          error: (error as Error).message
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
   * Input validation with detailed error messages
   */
  private static validateInput(
    code: string,
    requestedLayers?: number[],
    options?: ExecutionOptions
  ): void {
    if (!code || typeof code !== 'string') {
      throw new Error('Code input is required and must be a string');
    }

    if (code.length > 1000000) { // 1MB limit
      throw new Error('Code input exceeds maximum size limit (1MB)');
    }

    if (requestedLayers && !Array.isArray(requestedLayers)) {
      throw new Error('requestedLayers must be an array of numbers');
    }

    if (requestedLayers && requestedLayers.some(layer => !Number.isInteger(layer) || layer < 1 || layer > 6)) {
      throw new Error('Layer IDs must be integers between 1 and 6');
    }

    if (options && typeof options !== 'object') {
      throw new Error('Options must be an object');
    }
  }

  /**
   * Create timeout promise for overall transformation
   */
  private static createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Transformation timed out after ${this.TIMEOUT_MS}ms`));
      }, this.TIMEOUT_MS);
    });
  }

  /**
   * Create timeout promise for individual layer
   */
  private static createLayerTimeoutPromise(layerId: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Layer ${layerId} timed out after 10 seconds`));
      }, 10000);
    });
  }

  /**
   * Utility methods
   */
  private static generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static determineLayers(code: string, requestedLayers?: number[]): number[] {
    if (requestedLayers && requestedLayers.length > 0) {
      return requestedLayers;
    }
    
    const recommendation = SmartLayerSelector.analyzeAndRecommend(code);
    return recommendation.recommendedLayers;
  }

  private static async executeLayer(layerId: number, code: string, options: ExecutionOptions): Promise<string> {
    const layerConfig = LAYER_CONFIGS[layerId];
    
    if (!layerConfig) {
      throw new Error(`Unknown layer: ${layerId}`);
    }

    let transformedCode = code;
    
    switch (layerId) {
      case 1:
        if (code.includes('"target": "es5"')) {
          transformedCode = code.replace('"target": "es5"', '"target": "ES2020"');
        }
        break;
        
      case 2:
        transformedCode = code
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        break;
        
      case 3:
        if (code.includes('.map(') && !code.includes('key=')) {
          transformedCode = code.replace(
            /\.map\s*\(\s*([^)]+)\s*=>\s*<([^>]+)>/g,
            '.map($1 => <$2 key={$1.id || Math.random()}>'
          );
        }
        break;
        
      case 4:
        if (code.includes('localStorage') && !code.includes('typeof window')) {
          transformedCode = code.replace(
            /localStorage\./g,
            'typeof window !== "undefined" && localStorage.'
          );
        }
        break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    return transformedCode;
  }

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

  private static detectImprovements(before: string, after: string): string[] {
    const improvements: string[] = [];
    
    if (before !== after) {
      improvements.push('Code transformation applied');
    }
    
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
