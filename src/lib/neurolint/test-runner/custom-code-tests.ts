
import { LayerTestResult } from "../types";
import { NeuroLintOrchestrator } from "../orchestrator";

/**
 * Custom code test runner for user-provided code analysis
 */
export class CustomCodeTestRunner {
  async run(
    code: string,
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; layerResults: LayerTestResult[] }> {
    progressCallback?.(0, "Initializing custom code analysis...");

    const layerResults: LayerTestResult[] = [];
    const layerNames = [
      "Configuration",
      "Pattern Detection", 
      "Component Analysis",
      "Hydration Fixes",
      "Next.js Optimization",
      "Testing Integration",
      "Adaptive Learning",
    ];

    try {
      progressCallback?.(10, "Starting NeuroLint processing...");

      const result = await NeuroLintOrchestrator.transform(code, [1, 2, 3, 4, 5, 6, 7], {
        verbose: false,
        dryRun: false
      });

      progressCallback?.(80, "Analyzing layer results...");

      for (let i = 0; i < 7; i++) {
        const layerId = i + 1;
        const layerName = layerNames[i];
        const layerResult = result.results.find(r => r.layerId === layerId);

        const testResult: LayerTestResult = {
          layerId,
          layerName,
          success: layerResult?.success || false,
          executionTime: layerResult?.executionTime || 0,
          changeCount: layerResult?.changeCount || 0,
          error: layerResult?.error,
          improvements: layerResult?.improvements || [],
          passed: layerResult?.success || false,
          duration: layerResult?.executionTime || 0,
          changes: layerResult?.changeCount || 0,
          issues: layerResult?.error ? [layerResult.error] : [],
          before: code,
          after: layerResult?.code || code,
        };

        layerResults.push(testResult);
      }

      progressCallback?.(100, "Analysis complete!");

      return {
        passed: result.successfulLayers > 0,
        layerResults,
      };
    } catch (error) {
      progressCallback?.(100, "Analysis failed");

      for (let i = 0; i < 7; i++) {
        layerResults.push({
          layerId: i + 1,
          layerName: layerNames[i],
          success: false,
          executionTime: 0,
          changeCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
          improvements: [],
          passed: false,
          duration: 0,
          changes: 0,
          issues: [error instanceof Error ? error.message : "Unknown error"],
          before: code,
          after: code,
        });
      }

      return { passed: false, layerResults };
    }
  }
}
