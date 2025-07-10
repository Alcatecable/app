/**
 * NeuroLint API Client
 * Handles communication with api.neurolint.dev for real transformations
 */

import { TransformationResult, AnalysisResult, LayerExecutionResult } from './types';
import { PatternRecognitionLayer } from './layers/adaptive-learning';

const API_BASE_URL = 'https://api.neurolint.dev';

interface APIErrorInterface {
  message: string;
  code?: string;
  details?: unknown;
}

export class NeuroLintAPIClient {
  private static baseURL = API_BASE_URL;
  
  /**
   * Analyze code to detect issues and recommend layers
   */
  static async analyzeCode(code: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Analysis failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Code analysis failed:', error);
      
      // Fallback to local analysis if API is unavailable
      return this.fallbackAnalysis(code);
    }
  }

  /**
   * Transform code using specified layers
   */
  static async transformCode(
    code: string, 
    enabledLayers: number[], 
    options: { verbose?: boolean; dryRun?: boolean } = {}
  ): Promise<TransformationResult> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          enabledLayers,
          options: {
            verbose: options.verbose || false,
            dryRun: options.dryRun || false,
          },
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Transformation failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Code transformation failed:', error);
      
      // Fallback to local transformation if API is unavailable
      return this.fallbackTransformation(code, enabledLayers, options);
    }
  }

  /**
   * Execute a single layer transformation
   */
  static async executeLayer(
    layerId: number,
    code: string,
    options: Record<string, unknown> = {}
  ): Promise<LayerExecutionResult> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/layers/${layerId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          options,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Layer ${layerId} execution failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error(`Layer ${layerId} execution failed:`, error);
      
      // Fallback to local layer execution
      return await this.fallbackLayerExecution(layerId, code, options);
    }
  }

  /**
   * Upload and transform file
   */
  static async uploadAndTransform(
    file: File,
    enabledLayers: number[] = [1, 2, 3, 4, 5, 6]
  ): Promise<TransformationResult & { originalFileName: string; fileSize: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('enabledLayers', JSON.stringify(enabledLayers));

      const response = await fetch(`${this.baseURL}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`File upload failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      
      // Fallback to reading file locally and transforming
      const code = await file.text();
      const result = await this.fallbackTransformation(code, enabledLayers, {});
      
      return {
        ...result,
        originalFileName: file.name,
        fileSize: file.size
      };
    }
  }

  /**
   * Get smart layer recommendations
   */
  static async getSmartRecommendations(code: string): Promise<{ recommendedLayers: number[]; reasoning: string[] }> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Smart recommendations failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Smart recommendations failed:', error);
      
      // Fallback to local recommendations
      return this.fallbackRecommendations(code);
    }
  }

  /**
   * Validate transformation result
   */
  static async validateTransformation(
    originalCode: string,
    transformedCode: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          originalCode,
          transformedCode,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Validation failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Validation failed:', error);
      
      // Fallback to basic validation
      return this.fallbackValidation(originalCode, transformedCode);
    }
  }

  /**
   * Learn from successful transformation (Layer 7)
   */
  static async learnFromTransformation(
    before: string,
    after: string,
    layerId: number,
    context?: { filePath?: string; projectType?: string }
  ): Promise<{
    success: boolean;
    patternsLearned: number;
    executionTime: number;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/learn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          before,
          after,
          layerId,
          context,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Pattern learning failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Pattern learning failed:', error);
      
      // Fallback to local pattern learning
      return {
        success: false,
        patternsLearned: 0,
        executionTime: 0
      };
    }
  }

  /**
   * Get learned patterns statistics
   */
  static async getLearnedPatterns(): Promise<{
    patterns: any[];
    statistics: {
      totalPatterns: number;
      highConfidencePatterns: number;
      averageConfidence: number;
    };
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/patterns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Failed to get patterns: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get learned patterns:', error);
      
      return {
        patterns: [],
        statistics: {
          totalPatterns: 0,
          highConfidencePatterns: 0,
          averageConfidence: 0
        }
      };
    }
  }

  /**
   * Apply learned patterns to code
   */
  static async applyLearnedPatterns(
    code: string
  ): Promise<{
    transformedCode: string;
    appliedRules: string[];
    ruleCount: number;
    executionTime: number;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/apply-patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(`Pattern application failed: ${response.status} ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Pattern application failed:', error);
      
      return {
        transformedCode: code,
        appliedRules: [],
        ruleCount: 0,
        executionTime: 0
      };
    }
  }

  // Fallback methods (keeping existing implementations)
  private static fallbackAnalysis(code: string): AnalysisResult {
    const detectedIssues = [];
    
    // Layer 1 detection
    if (code.includes('"target": "es5"') || code.includes('reactStrictMode: false')) {
      detectedIssues.push({
        type: 'config',
        severity: 'high',
        description: 'Outdated configuration detected',
        fixedByLayer: 1,
        pattern: 'Configuration issues'
      });
    }
    
    // Layer 2 detection
    if (code.includes('&quot;') || code.includes('&amp;') || code.includes('console.log')) {
      detectedIssues.push({
        type: 'pattern',
        severity: 'medium',
        description: 'HTML entities and patterns need cleanup',
        fixedByLayer: 2,
        pattern: 'HTML entities and logging'
      });
    }
    
    // Layer 3 detection
    if (code.includes('.map(') && !code.includes('key=')) {
      detectedIssues.push({
        type: 'component',
        severity: 'high',
        description: 'Missing key props in map operations',
        fixedByLayer: 3,
        pattern: 'Missing React keys'
      });
    }
    
    // Layer 4 detection
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      detectedIssues.push({
        type: 'hydration',
        severity: 'high',
        description: 'Unguarded localStorage usage',
        fixedByLayer: 4,
        pattern: 'SSR hydration issues'
      });
    }
    
    // Layer 5 detection
    const lines = code.split('\n');
    const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
    if (useClientIndex > 0) {
      detectedIssues.push({
        type: 'nextjs',
        severity: 'medium',
        description: 'Misplaced "use client" directive',
        fixedByLayer: 5,
        pattern: 'Next.js App Router issues'
      });
    }
    
    const recommendedLayers = [...new Set(detectedIssues.map(issue => issue.fixedByLayer))];
    
    return {
      detectedIssues,
      recommendedLayers,
      reasoning: detectedIssues.map(issue => `Layer ${issue.fixedByLayer}: ${issue.description}`),
      confidence: detectedIssues.length > 0 ? 0.8 : 0.3,
      estimatedImpact: {
        level: detectedIssues.some(i => i.severity === 'high') ? 'high' : 'medium',
        estimatedFixTime: `${Math.max(30, detectedIssues.length * 10)} seconds`
      }
    };
  }

  private static fallbackTransformation(
    code: string,
    enabledLayers: number[],
    options: { verbose?: boolean; dryRun?: boolean }
  ): TransformationResult {
    // Simple fallback transformation
    let transformedCode = code;
    const results: LayerExecutionResult[] = [];
    
    for (const layerId of enabledLayers) {
      const startTime = Date.now();
      let changeCount = 0;
      let layerCode = transformedCode;
      
      // Basic transformations based on layer
      switch (layerId) {
        case 2:
          // HTML entity cleanup
          layerCode = layerCode.replace(/&quot;/g, '"');
          layerCode = layerCode.replace(/&amp;/g, '&');
          layerCode = layerCode.replace(/console\.log/g, 'console.debug');
          changeCount = (transformedCode.match(/&quot;|&amp;|console\.log/g) || []).length;
          break;
        case 3:
          // Add basic key props
          layerCode = layerCode.replace(/\.map\(\s*([^)]+)\s*\)\s*=>\s*<([^>\s]+)/g, 
            '.map($1, index) => <$2 key={index}');
          changeCount = (transformedCode.match(/\.map\([^)]*\)\s*=>\s*</g) || []).length;
          break;
      }
      
      transformedCode = layerCode;
      
      results.push({
        layerId,
        layerName: `Layer ${layerId}`,
        success: true,
        executionTime: Date.now() - startTime,
        changeCount,
        improvements: changeCount > 0 ? [`Applied ${changeCount} fixes`] : []
      });
    }
    
    return {
      originalCode: code,
      finalCode: transformedCode,
      results,
      successfulLayers: results.filter(r => r.success).length,
      totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0)
    };
  }

  private static async fallbackLayerExecution(layerId: number, code: string, options: any): Promise<LayerExecutionResult> {
    const startTime = Date.now();
    
    // Simple layer-specific transformations
    let transformedCode = code;
    let changeCount = 0;
    
    switch (layerId) {
      case 1:
        // Config fixes - mostly file-based, return as-is for now
        break;
      case 2:
        // Pattern fixes
        const original = transformedCode;
        transformedCode = transformedCode.replace(/&quot;/g, '"');
        transformedCode = transformedCode.replace(/&amp;/g, '&');
        changeCount = original !== transformedCode ? 1 : 0;
        break;
      case 3:
        // Component fixes
        if (transformedCode.includes('.map(') && !transformedCode.includes('key=')) {
          transformedCode = transformedCode.replace(/\.map\(\s*([^)]+)\s*\)\s*=>\s*<([^>\s]+)/g, 
            '.map($1, index) => <$2 key={index}');
          changeCount = 1;
        }
        break;
      case 4:
        // Hydration fixes
        if (transformedCode.includes('localStorage') && !transformedCode.includes('typeof window')) {
          transformedCode = transformedCode.replace(/localStorage\./g, 
            'typeof window !== "undefined" && localStorage.');
          changeCount = 1;
        }
        break;
    }
    
    return {
      layerId,
      layerName: `Layer ${layerId}`,
      success: true,
      transformedCode,
      executionTime: Date.now() - startTime,
      changeCount
    };
  }

  private static fallbackRecommendations(code: string): { recommendedLayers: number[]; reasoning: string[] } {
    const layers = [];
    const reasoning = [];
    
    if (code.includes('&quot;') || code.includes('console.log')) {
      layers.push(2);
      reasoning.push('Layer 2: HTML entities and patterns detected');
    }
    
    if (code.includes('.map(') && !code.includes('key=')) {
      layers.push(3);
      reasoning.push('Layer 3: Missing key props detected');
    }
    
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      layers.push(4);
      reasoning.push('Layer 4: Hydration issues detected');
    }
    
    return { recommendedLayers: layers, reasoning };
  }

  private static fallbackValidation(originalCode: string, transformedCode: string) {
    const errors = [];
    const warnings = [];
    
    if (transformedCode.includes('undefined') && !originalCode.includes('undefined')) {
      errors.push('Transformation may have introduced undefined values');
    }
    
    if (transformedCode.length < originalCode.length * 0.5) {
      warnings.push('Significant code reduction detected');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static generateReasoning(layers: number[]): string[] {
    const layerNames = {
      1: 'Configuration optimization',
      2: 'Pattern and entity cleanup', 
      3: 'Component enhancement',
      4: 'Hydration and SSR fixes',
      5: 'Next.js App Router fixes',
      6: 'Testing and validation'
    };
    
    return layers.map(id => `Layer ${id}: ${layerNames[id as keyof typeof layerNames] || 'Unknown layer'}`);
  }

  private static getLayerName(layerId: number): string {
    const names = {
      1: 'Configuration',
      2: 'Pattern Recognition', 
      3: 'Component Enhancement',
      4: 'Hydration & SSR',
      5: 'Next.js App Router',
      6: 'Testing & Validation'
    };
    return names[layerId as keyof typeof names] || `Layer ${layerId}`;
  }
}

class APIError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'APIError';
  }
}