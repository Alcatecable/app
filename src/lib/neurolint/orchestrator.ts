import { LayerConfig, LayerExecutionResult } from "./types";
import { CodeAnalysisService } from "./code-analysis";
import { ConfigurationLayer } from "./layers/configuration";
import { PatternRecognitionLayer } from "./layers/pattern-recognition";
import { ComponentEnhancementLayer } from "./layers/component-enhancement";
import { ErrorHandlingLayer } from "./layers/error-handling";
import { SecurityLayer } from "./layers/security";
import { OptimizationLayer } from "./layers/optimization";
import { patternLearner } from "./pattern-learner";
import { logger } from "./logger";
import { metrics } from "./metrics";

export class NeuroLintOrchestrator {
  private static layers = [
    ConfigurationLayer,
    PatternRecognitionLayer,
    ComponentEnhancementLayer,
    ErrorHandlingLayer,
    SecurityLayer,
    OptimizationLayer,
  ];

  static analyze(code: string): any {
    const analysisService = new CodeAnalysisService(code);
    const detectedIssues = analysisService.runAnalysis();
    const confidence = analysisService.calculateConfidence();
    const estimatedImpact = analysisService.estimateImpact();
    const recommendedLayers = this.recommendLayersForIssues(detectedIssues);
    const reasoning = this.generateReasoningForLayers(recommendedLayers);

    return {
      detectedIssues,
      confidence,
      estimatedImpact,
      recommendedLayers,
      reasoning,
    };
  }

  private static recommendLayersForIssues(detectedIssues: any[]): number[] {
    const layers = new Set<number>();
    detectedIssues.forEach((issue) => {
      if (issue.fixedByLayer) {
        layers.add(issue.fixedByLayer);
      }
    });
    return Array.from(layers);
  }

  private static generateReasoningForLayers(layerIds: number[]): string[] {
    const reasoning: string[] = [];
    if (layerIds.includes(1)) {
      reasoning.push("Configuration layer will optimize settings.");
    }
    if (layerIds.includes(2)) {
      reasoning.push("Pattern recognition will identify and fix common issues.");
    }
    if (layerIds.includes(3)) {
      reasoning.push("Component enhancement will improve code components.");
    }
    if (layerIds.includes(4)) {
      reasoning.push("Error handling will add robust error management.");
    }
    if (layerIds.includes(5)) {
      reasoning.push("Security layer will enhance code security.");
    }
    if (layerIds.includes(6)) {
      reasoning.push("Optimization layer will improve performance.");
    }
    return reasoning;
  }

  static async transform(
    code: string,
    enabledLayers: number[],
    options: { verbose: boolean; dryRun: boolean }
  ): Promise<LayerExecutionResult> {
    const startTime = performance.now();
    let currentCode = code;
    let successfulLayers = 0;
    const results = [];

    logger.startSession({ codeLength: code.length, enabledLayers });
    metrics.incrementTotalExecutions();

    for (const layer of this.layers) {
      if (!enabledLayers.includes(layer.id)) {
        logger.log(`Layer ${layer.id} "${layer.name}" skipped.`);
        continue;
      }

      const layerStartTime = performance.now();
      let layerResult;

      try {
        logger.log(`Executing layer ${layer.id} "${layer.name}"...`);
        layerResult = await layer.execute(currentCode, options);

        if (layerResult.transformedCode !== currentCode) {
          currentCode = layerResult.transformedCode;
          successfulLayers++;
          logger.log(
            `Layer ${layer.id} "${layer.name}" applied successfully. Changes: ${layerResult.changeCount}`
          );
          metrics.incrementSuccessfulExecutions();
        } else {
          logger.log(`Layer ${layer.id} "${layer.name}" did not change the code.`);
        }

        results.push({
          layerId: layer.id,
          layerName: layer.name,
          success: true,
          executionTime: performance.now() - layerStartTime,
          changeCount: layerResult.changeCount,
          improvements: layerResult.improvements,
        });
      } catch (error: any) {
        logger.error(`Layer ${layer.id} "${layer.name}" failed:`, error);
        metrics.incrementFailedExecutions();
        results.push({
          layerId: layer.id,
          layerName: layer.name,
          success: false,
          executionTime: performance.now() - layerStartTime,
          changeCount: 0,
          error: error.message,
        });
      }
    }

    const totalExecutionTime = performance.now() - startTime;
    logger.endSession({
      successfulLayers,
      totalExecutionTime,
      finalCodeLength: currentCode.length,
    });

    return {
      originalCode: code,
      finalCode: currentCode,
      results,
      successfulLayers,
      totalExecutionTime,
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  static async processCode(
    code: string,
    targetFile?: string,
    preview?: boolean,
    enabledLayers?: number[]
  ): Promise<any> {
    return this.transform(code, enabledLayers || [1, 2, 3, 4], {
      verbose: true,
      dryRun: preview || false
    });
  }
}
