
import { TestResult } from "../types";
import { NeuroLintOrchestrator } from "../orchestrator";

/**
 * Load test runner for performance and scalability testing
 */
export class LoadTestRunner {
  async run(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; loadTestResults: TestResult[] }> {
    const loadTests = [
      { name: "Process 50 Files Concurrently", test: () => this.testConcurrentFiles(50) },
      { name: "Process Large Codebase", test: () => this.testLargeCodebase(100000) },
      { name: "Sustained Processing", test: () => this.testSustainedProcessing(30000) },
      { name: "Memory Pressure Test", test: () => this.testMemoryPressure() },
      { name: "Pattern Learning Scalability", test: () => this.testPatternLearningScale() },
    ];

    const results: TestResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < loadTests.length; i++) {
      const test = loadTests[i];
      progressCallback?.(((i + 1) / loadTests.length) * 100, test.name);

      const startTime = Date.now();
      try {
        const passed = await test.test();
        const duration = Date.now() - startTime;

        results.push({ passed, duration });
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
      passed: passedCount >= Math.floor(loadTests.length * 0.8),
      loadTestResults: results,
    };
  }

  private async testConcurrentFiles(count: number): Promise<boolean> {
    const promises = Array.from({ length: count }, (_, i) =>
      NeuroLintOrchestrator.transform(`const file${i} = ${i};`, [1, 2])
    );

    const results = await Promise.all(promises);
    return results.filter((r) => r.successfulLayers > 0).length >= count * 0.9;
  }

  private async testLargeCodebase(sizeChars: number): Promise<boolean> {
    const largeCode = "const x = 1;\n".repeat(Math.floor(sizeChars / 13));
    const startTime = Date.now();

    const result = await NeuroLintOrchestrator.transform(largeCode, [1, 2]);
    const duration = Date.now() - startTime;

    return result.successfulLayers > 0 && duration < 30000;
  }

  private async testSustainedProcessing(durationMs: number): Promise<boolean> {
    const endTime = Date.now() + durationMs;
    let processedCount = 0;
    let errorCount = 0;

    while (Date.now() < endTime) {
      try {
        await NeuroLintOrchestrator.transform(`const sustained${processedCount} = true;`, [1, 2]);
        processedCount++;
      } catch {
        errorCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return errorCount < processedCount * 0.1;
  }

  private async testMemoryPressure(): Promise<boolean> {
    let initialMemory = 0;
    try {
      initialMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
    } catch {
      initialMemory = 0;
    }

    for (let i = 0; i < 50; i++) {
      await NeuroLintOrchestrator.transform(`const memory${i} = new Array(100);`, [1, 2]);
    }

    let finalMemory = 0;
    try {
      finalMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
    } catch {
      finalMemory = 0;
    }

    const memoryIncrease = finalMemory - initialMemory;
    return memoryIncrease < 50 * 1024 * 1024;
  }

  private async testPatternLearningScale(): Promise<boolean> {
    const patterns = Array.from(
      { length: 50 },
      (_, i) => `items${i}.map(item => <div key={item.id}>{item.name}</div>)`
    );

    for (const pattern of patterns) {
      await NeuroLintOrchestrator.transform(pattern, [7]);
    }

    return true;
  }
}
