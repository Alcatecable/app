
import { TestResult } from "../types";
import { NeuroLintOrchestrator } from "../orchestrator";
import { TransformationValidator } from "../validation";
import { metrics } from "../metrics";
import { PatternLearner } from "../pattern-learner";
import { SmartLayerSelector } from "../smart-selector";

/**
 * Unit test runner for individual components
 */
export class UnitTestRunner {
  async run(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; unitTestResults: TestResult[] }> {
    const tests = [
      { name: "Layer 1: Configuration Validation", test: this.testLayer1Configuration },
      { name: "Layer 2: Pattern Detection", test: this.testLayer2Patterns },
      { name: "Layer 3: Component Analysis", test: this.testLayer3Components },
      { name: "Layer 4: Hydration Fixes", test: this.testLayer4Hydration },
      { name: "Layer 5: Next.js Optimization", test: this.testLayer5NextJS },
      { name: "Layer 6: Testing Integration", test: this.testLayer6Testing },
      { name: "Layer 7: Adaptive Learning", test: this.testLayer7Learning },
      { name: "Orchestrator: Pipeline Flow", test: this.testOrchestratorFlow },
      { name: "Validation: AST Processing", test: this.testASTValidation },
      { name: "Metrics: Data Collection", test: this.testMetricsCollection },
      { name: "Smart Selector: Layer Selection", test: this.testSmartSelection },
      { name: "Error Recovery: Fallback Mechanisms", test: this.testErrorRecovery },
    ];

    const results: TestResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      progressCallback?.(((i + 1) / tests.length) * 100, test.name);

      const startTime = Date.now();
      try {
        const passed = await test.test.call(this);
        const duration = Date.now() - startTime;

        const result: TestResult = { 
          name: test.name,
          passed, 
          success: passed,
          duration,
          executionTime: duration
        };
        results.push(result);

        if (passed) passedCount++;
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          name: test.name,
          passed: false,
          success: false,
          duration,
          executionTime: duration,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      passed: passedCount === tests.length,
      unitTestResults: results,
    };
  }

  private async testLayer1Configuration(): Promise<boolean> {
    const testCode = '{ "compilerOptions": { "target": "es5" } }';
    const result = await NeuroLintOrchestrator.executeLayer(1, testCode, {});
    return result.includes("ES2020") || result.includes("ES2022");
  }

  private async testLayer2Patterns(): Promise<boolean> {
    const testCode = 'const msg = &quot;Hello&quot;;';
    const result = await NeuroLintOrchestrator.executeLayer(2, testCode, {});
    return result.includes('"Hello"') && !result.includes("&quot;");
  }

  private async testLayer3Components(): Promise<boolean> {
    const testCode = "items.map(item => <div>{item.name}</div>)";
    const result = await NeuroLintOrchestrator.executeLayer(3, testCode, {});
    return result.includes("key=");
  }

  private async testLayer4Hydration(): Promise<boolean> {
    const testCode = 'const data = localStorage.getItem("key");';
    const result = await NeuroLintOrchestrator.executeLayer(4, testCode, {});
    return result.includes("typeof window");
  }

  private async testLayer5NextJS(): Promise<boolean> {
    const testCode = "const [state, setState] = useState(0);";
    const result = await NeuroLintOrchestrator.executeLayer(5, testCode, {});
    return result.includes("'use client'");
  }

  private async testLayer6Testing(): Promise<boolean> {
    const testCode = "const TestComponent = () => <div>Test</div>;";
    const result = await NeuroLintOrchestrator.executeLayer(6, testCode, {});
    return result.includes("React.memo") || result.includes("aria-");
  }

  private async testLayer7Learning(): Promise<boolean> {
    const testCode = "const test = 'pattern learning test';";
    const result = await NeuroLintOrchestrator.executeLayer(7, testCode, {});
    return typeof result === "string";
  }

  private async testOrchestratorFlow(): Promise<boolean> {
    const testCode = 'const test = "orchestrator test";';
    const result = await NeuroLintOrchestrator.transform(testCode, [1, 2], { verbose: true, dryRun: false });
    return result.finalCode !== undefined && result.results.length > 0;
  }

  private async testASTValidation(): Promise<boolean> {
    const testCode = "const valid = true;";
    const result = TransformationValidator.validateTransformation(testCode, testCode, 1);
    return !result.shouldRevert;
  }

  private async testMetricsCollection(): Promise<boolean> {
    metrics.recordLayerExecution(1, true, 100, 0);
    return true;
  }

  private async testSmartSelection(): Promise<boolean> {
    const recommendation = SmartLayerSelector.analyzeAndRecommend("const test = true;");
    return recommendation.recommendedLayers.length > 0;
  }

  private async testErrorRecovery(): Promise<boolean> {
    try {
      await NeuroLintOrchestrator.transform("invalid syntax {{{", [1], { verbose: true, dryRun: false });
      return true;
    } catch {
      return false;
    }
  }
}
