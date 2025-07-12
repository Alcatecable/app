
import { AnalysisResult, DetectedIssue, ImpactAssessment } from "./types";

/**
 * Smart Layer Selector - Analyzes code and recommends optimal layer selection
 */
export class SmartLayerSelector {
  /**
   * Analyze code and recommend layers
   */
  static async analyzeAndRecommend(code: string): Promise<AnalysisResult> {
    const detectedIssues: DetectedIssue[] = [];
    const recommendedLayers: number[] = [];
    const reasoning: string[] = [];

    // Basic pattern detection
    if (code.includes('localStorage.getItem') || code.includes('sessionStorage.getItem')) {
      detectedIssues.push({
        severity: 'medium',
        pattern: 'localStorage usage',
        description: 'Direct localStorage usage detected',
        fixedByLayer: 1
      });
      recommendedLayers.push(1);
      reasoning.push('Layer 1 recommended for localStorage configuration');
    }

    if (code.includes('.map(') && !code.includes('key=')) {
      detectedIssues.push({
        severity: 'high',
        pattern: 'missing keys',
        description: 'Missing keys in map operations',
        fixedByLayer: 2
      });
      recommendedLayers.push(2);
      reasoning.push('Layer 2 recommended for React key patterns');
    }

    const estimatedImpact: ImpactAssessment = {
      level: detectedIssues.length > 2 ? 'high' : 'medium',
      estimatedFixTime: '2-5 minutes'
    };

    return {
      confidence: 0.8,
      estimatedImpact,
      detectedIssues,
      recommendedLayers: [...new Set(recommendedLayers)],
      reasoning
    };
  }
}
