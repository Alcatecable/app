
import { TestResult } from "../types";
import { NeuroLintOrchestrator } from "../orchestrator";

/**
 * Integration test runner for end-to-end scenarios
 */
export class IntegrationTestRunner {
  async run(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; integrationResults: TestResult[] }> {
    const tests = [
      { name: "End-to-End Pipeline Execution", test: this.testEndToEndPipeline },
      { name: "Multi-Layer State Management", test: this.testStateManagement },
      { name: "Error Propagation & Recovery", test: this.testErrorPropagation },
      { name: "Performance Under Load", test: this.testPerformanceIntegration },
      { name: "Layer Dependency Management", test: this.testLayerDependencies },
      { name: "Concurrent Processing", test: this.testConcurrentProcessing },
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

        const result: TestResult = { passed, duration };
        results.push(result);

        if (passed) passedCount++;
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          passed: false,
          duration,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      passed: passedCount === tests.length,
      integrationResults: results,
    };
  }

  private async testEndToEndPipeline(): Promise<boolean> {
    const testCode = `
      const UserList = ({ users }) => {
        return (
          <div>
            {users.map(user => (
              <div>{user.name}</div>
            ))}
          </div>
        );
      };
    `;

    const result = await NeuroLintOrchestrator.transform(testCode, [1, 2, 3, 4, 5, 6, 7]);
    return result.successfulLayers > 0 && result.finalCode !== testCode;
  }

  private async testStateManagement(): Promise<boolean> {
    const testCode = "const [state, setState] = useState(0);";
    const result = await NeuroLintOrchestrator.transform(testCode, [5, 6]);
    return result.states.length > 1;
  }

  private async testErrorPropagation(): Promise<boolean> {
    const invalidCode = "const invalid = function( { return }";
    const result = await NeuroLintOrchestrator.transform(invalidCode, [1, 2, 3]);
    return result.results.some(r => !r.success);
  }

  private async testPerformanceIntegration(): Promise<boolean> {
    const startTime = Date.now();
    await this.testEndToEndPipeline();
    const duration = Date.now() - startTime;
    return duration < 5000;
  }

  private async testLayerDependencies(): Promise<boolean> {
    const result = await NeuroLintOrchestrator.transform("const test = true;", [3]);
    return result.results.length >= 3; // Should auto-add dependencies
  }

  private async testConcurrentProcessing(): Promise<boolean> {
    const promises = Array.from({ length: 10 }, () =>
      NeuroLintOrchestrator.transform("const test = true;", [1, 2])
    );

    const results = await Promise.all(promises);
    return results.every((r) => r.successfulLayers > 0);
  }
}
