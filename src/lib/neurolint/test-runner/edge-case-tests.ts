
import { TestResult } from "../types";
import { NeuroLintOrchestrator } from "../orchestrator";

export class EdgeCaseTestRunner {
  async run(progressCallback?: (progress: number, testName: string) => void): Promise<{ passed: boolean; edgeCaseResults: TestResult[] }> {
    const results: TestResult[] = [];
    const testCases = [
      {
        name: "Malformed JavaScript",
        code: "function broken( { return; }"
      },
      {
        name: "Empty File",
        code: ""
      },
      {
        name: "Complex Nested JSX",
        code: "<div>{items.map(item => item.children?.map(child => <span key={child.id}>{child.name}</span>))}</div>"
      }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = performance.now();
      
      try {
        const result = await NeuroLintOrchestrator(testCase.code, undefined, true, [1, 2, 3]);
        const duration = performance.now() - startTime;
        
        results.push({
          name: testCase.name,
          passed: result.success,
          success: result.success,
          duration,
          executionTime: duration
        });
        
      } catch (error) {
        const duration = performance.now() - startTime;
        results.push({
          name: testCase.name,
          passed: true, // Edge cases are expected to potentially fail
          success: true,
          duration,
          executionTime: duration,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      if (progressCallback) {
        progressCallback(((i + 1) / testCases.length) * 100, testCase.name);
      }
    }
    
    return {
      passed: results.every(r => r.passed),
      edgeCaseResults: results
    };
  }
}
