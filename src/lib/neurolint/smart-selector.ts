
/**
 * Smart Layer Selector
 * Uses real API analysis to recommend optimal layers
 */

import { NeuroLintOrchestrator } from "./orchestrator";
import { NeuroLintAPIClient } from "./api-client";
import { AnalysisResult } from "./types";
import { logger } from "./logger";

export class SmartLayerSelector {
  /**
   * Analyze code and recommend layers using real API
   */
  static async analyzeAndRecommend(code: string): Promise<AnalysisResult> {
    try {
      logger.info('Starting smart analysis', { 
        layerId: 0,
        metadata: { codeLength: code.length }
      });

      // Use the orchestrator's analyze method which calls the real API
      const analysis = await NeuroLintOrchestrator.analyze(code);
      
      logger.info('Smart analysis completed', {
        layerId: 0,
        metadata: { 
          recommendedLayers: analysis.recommendedLayers,
          confidence: analysis.confidence
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Smart analysis failed', error instanceof Error ? error : new Error(String(error)));
      
      // Fallback to basic local analysis
      return this.fallbackAnalysis(code);
    }
  }

  /**
   * Get layer recommendations (legacy method for backward compatibility)
   */
  static async recommendLayers(code: string): Promise<number[]> {
    try {
      const recommendations = await NeuroLintAPIClient.getSmartRecommendations(code);
      return recommendations.recommendedLayers;
    } catch (error) {
      logger.error('Layer recommendations failed', error instanceof Error ? error : new Error(String(error)));
      
      // Fallback to basic analysis
      const analysis = this.fallbackAnalysis(code);
      return analysis.recommendedLayers;
    }
  }

  /**
   * Instance method for compatibility with existing UI
   */
  async recommendLayers(code: string): Promise<{ recommendedLayers: number[] }> {
    const recommendedLayers = await SmartLayerSelector.recommendLayers(code);
    return { recommendedLayers };
  }

  /**
   * Fallback analysis when API is unavailable
   * Implements basic pattern detection based on the CLI scripts
   */
  private static fallbackAnalysis(code: string): AnalysisResult {
    const detectedIssues = [];
    let confidence = 0.7;

    // Layer 1: Configuration issues
    if (code.includes('tsconfig') || code.includes('next.config') || code.includes('package.json')) {
      detectedIssues.push({
        severity: 'medium',
        pattern: 'Configuration files',
        description: 'Configuration files may need optimization',
        fixedByLayer: 1,
        type: 'config'
      });
    }

    // Layer 2: Pattern recognition issues
    if (code.includes('&quot;') || code.includes('&#x27;') || code.includes('&amp;')) {
      detectedIssues.push({
        severity: 'high',
        pattern: 'HTML entity corruption',
        description: 'HTML entities found that should be converted to proper characters',
        fixedByLayer: 2,
        type: 'corruption',
        count: (code.match(/&quot;|&#x27;|&amp;/g) || []).length
      });
    }

    // Check for console.log statements
    if (code.includes('console.log')) {
      detectedIssues.push({
        severity: 'low',
        pattern: 'Console statements',
        description: 'Console.log statements should be replaced with proper logging',
        fixedByLayer: 2,
        type: 'pattern'
      });
    }

    // Layer 3: Component issues
    if (code.includes('.map(') && !code.includes('key=')) {
      detectedIssues.push({
        severity: 'medium',
        pattern: 'Missing key props',
        description: 'React map functions missing key props',
        fixedByLayer: 3,
        type: 'react'
      });
    }

    // Check for Button components without variants
    if (code.includes('<Button') && !code.includes('variant=')) {
      detectedIssues.push({
        severity: 'low',
        pattern: 'Button without variant',
        description: 'Button components should have explicit variant props',
        fixedByLayer: 3,
        type: 'component'
      });
    }

    // Layer 4: Hydration issues
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      detectedIssues.push({
        severity: 'critical',
        pattern: 'Hydration unsafe code',
        description: 'Browser APIs accessed without SSR guards',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }

    if (code.includes('window.') && !code.includes('typeof window')) {
      detectedIssues.push({
        severity: 'critical',
        pattern: 'Window access without guards',
        description: 'Window object accessed without SSR guards',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }

    if (code.includes('document.') && !code.includes('typeof document')) {
      detectedIssues.push({
        severity: 'high',
        pattern: 'Document access without guards',
        description: 'Document object accessed without SSR guards',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }

    // Layer 5: Next.js issues
    if (/import\s*{\s*$|import\s*{\s*\n\s*import/m.test(code)) {
      detectedIssues.push({
        severity: 'critical',
        pattern: 'Corrupted imports',
        description: 'Malformed import statements detected',
        fixedByLayer: 5,
        type: 'corruption'
      });
    }

    // Check for misplaced 'use client'
    const lines = code.split('\n');
    const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
    if (useClientIndex > 0) {
      for (let i = 0; i < useClientIndex; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('//') && !line.startsWith('/*')) {
          detectedIssues.push({
            severity: 'critical',
            pattern: 'Misplaced use client',
            description: '"use client" directive not at top of file',
            fixedByLayer: 5,
            type: 'nextjs'
          });
          break;
        }
      }
    }

    // Layer 6: Testing and validation issues
    if ((code.includes('PDF') || code.includes('upload') || code.includes('API')) && 
        !code.includes('ErrorBoundary') && !code.includes('try')) {
      detectedIssues.push({
        severity: 'medium',
        pattern: 'Missing error handling',
        description: 'Risky operations without error boundaries',
        fixedByLayer: 6,
        type: 'reliability'
      });
    }

    if (code.includes('<button') && !code.includes('aria-label')) {
      detectedIssues.push({
        severity: 'medium',
        pattern: 'Missing accessibility',
        description: 'Interactive elements missing accessibility attributes',
        fixedByLayer: 6,
        type: 'accessibility'
      });
    }

    // Generate recommended layers from detected issues
    const recommendedLayers = [...new Set(detectedIssues.map(issue => issue.fixedByLayer))];
    
    // Ensure layer 1 is always included as foundation
    if (!recommendedLayers.includes(1) && recommendedLayers.length > 0) {
      recommendedLayers.unshift(1);
    }

    // Sort layers in execution order
    recommendedLayers.sort((a, b) => a - b);

    return {
      confidence,
      estimatedImpact: {
        level: detectedIssues.length > 3 ? 'high' : detectedIssues.length > 1 ? 'medium' : 'low',
        estimatedFixTime: detectedIssues.length > 3 ? '2-3 minutes' : detectedIssues.length > 1 ? '1-2 minutes' : '30 seconds'
      },
      detectedIssues,
      recommendedLayers,
      reasoning: this.generateReasoning(recommendedLayers, detectedIssues)
    };
  }

  /**
   * Generate reasoning for layer recommendations
   */
  private static generateReasoning(layers: number[], issues: any[]): string[] {
    const reasoning: string[] = [];
    
    if (layers.includes(1)) {
      reasoning.push('Configuration layer recommended for foundation setup');
    }
    
    if (layers.includes(2)) {
      const htmlEntityIssues = issues.filter(i => i.type === 'corruption');
      if (htmlEntityIssues.length > 0) {
        reasoning.push(`Pattern cleanup needed for ${htmlEntityIssues.length} corruption issues`);
      } else {
        reasoning.push('Pattern cleanup recommended for code quality');
      }
    }
    
    if (layers.includes(3)) {
      const componentIssues = issues.filter(i => i.type === 'react' || i.type === 'component');
      if (componentIssues.length > 0) {
        reasoning.push(`Component enhancements needed for ${componentIssues.length} React issues`);
      } else {
        reasoning.push('Component enhancements recommended for React best practices');
      }
    }
    
    if (layers.includes(4)) {
      const hydrationIssues = issues.filter(i => i.type === 'hydration');
      if (hydrationIssues.length > 0) {
        reasoning.push(`Hydration fixes critical for ${hydrationIssues.length} SSR safety issues`);
      } else {
        reasoning.push('Hydration fixes recommended for SSR compatibility');
      }
    }
    
    if (layers.includes(5)) {
      const nextjsIssues = issues.filter(i => i.type === 'nextjs' || i.type === 'corruption');
      if (nextjsIssues.length > 0) {
        reasoning.push(`Next.js App Router fixes needed for ${nextjsIssues.length} compliance issues`);
      } else {
        reasoning.push('Next.js App Router compliance recommended');
      }
    }
    
    if (layers.includes(6)) {
      const qualityIssues = issues.filter(i => i.type === 'reliability' || i.type === 'accessibility');
      if (qualityIssues.length > 0) {
        reasoning.push(`Testing and validation improvements needed for ${qualityIssues.length} quality issues`);
      } else {
        reasoning.push('Testing and validation improvements recommended');
      }
    }
    
    return reasoning;
  }
}
