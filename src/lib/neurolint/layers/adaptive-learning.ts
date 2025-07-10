/**
 * Layer 7: Pattern Recognition Engine
 * Advanced layer that recognizes patterns from successful transformations and applies stored patterns
 */

import { NeuroLintAPIClient } from '../api-client';
import { logger } from '../logger';
import { metrics } from '../metrics';

export const PatternRecognitionLayer = {
  id: 7,
  name: 'Pattern Recognition',
  
  async execute(code: string, options: Record<string, unknown>) {
    const startTime = performance.now();
    let transformedCode = code;
    let changeCount = 0;
    const improvements: string[] = [];
    
    try {
      logger.info('Starting Layer 7: Adaptive Pattern Learning', {
        layerId: 7,
        metadata: { codeLength: code.length }
      });

      // Apply learned patterns using API
      const result = await NeuroLintAPIClient.applyLearnedPatterns(code);
      
      transformedCode = result.transformedCode;
      changeCount = result.ruleCount;
      
      // Generate improvements list
      if (result.appliedRules.length > 0) {
        improvements.push(`Applied ${result.appliedRules.length} learned patterns`);
        improvements.push(...result.appliedRules.map(rule => `• ${rule}`));
      }
      
                    // Record metrics and get execution time
       const executionTime = performance.now() - startTime;
       metrics.recordLayerExecution(7, true, executionTime, changeCount);
       
       // Get pattern statistics from API
       const stats = await NeuroLintAPIClient.getLearnedPatterns();
       logger.info('Layer 7 pattern application completed', {
         layerId: 7,
         metadata: {
           rulesApplied: result.ruleCount,
           executionTime: result.executionTime,
           totalPatternsAvailable: stats.statistics.totalPatterns,
           highConfidencePatterns: stats.statistics.highConfidencePatterns
         }
       });

      return {
        transformedCode,
        changeCount,
        improvements,
        executionTime,
        metadata: {
          appliedRules: result.appliedRules,
          patternStats: stats.statistics,
          learningEnabled: true
        }
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      logger.error('Layer 7 execution failed', error instanceof Error ? error : new Error(String(error)));
      
      return {
        transformedCode: code, // Return original code on failure
        changeCount: 0,
        improvements: [],
        executionTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};