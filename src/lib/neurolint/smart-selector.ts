
import { NeuroLintOrchestrator } from "./orchestrator";
import { AnalysisResult } from "./types";

export class SmartLayerSelector {
  static analyzeAndRecommend(code: string): AnalysisResult {
    const analysis = NeuroLintOrchestrator.analyze(code);

    // Mock logic for recommending layers based on analysis
    let recommendedLayers: number[] = [1, 2, 3, 4];
    if (analysis.detectedIssues.length > 5) {
      recommendedLayers = [3, 4, 5, 6];
    } else if (analysis.detectedIssues.length > 2) {
      recommendedLayers = [2, 3, 4];
    }

    const reasoning = [
      "Initial analysis identified potential improvements.",
      "Selected layers are optimized for the detected issue types.",
    ];

    return {
      confidence: analysis.confidence,
      estimatedImpact: analysis.estimatedImpact,
      detectedIssues: analysis.detectedIssues,
      recommendedLayers: recommendedLayers,
      reasoning: reasoning,
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  static recommendLayers(code: string): number[] {
    const analysis = this.analyzeAndRecommend(code);
    return analysis.recommendedLayers;
  }

  // Instance method for compatibility
  async recommendLayers(code: string): Promise<{ recommendedLayers: number[] }> {
    const analysis = SmartLayerSelector.analyzeAndRecommend(code);
    return { recommendedLayers: analysis.recommendedLayers };
  }
}
