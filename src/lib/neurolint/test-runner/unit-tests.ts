
import { TestResult } from "../types";
import { SmartLayerSelector } from "../smart-layer-selector";

export class UnitTestRunner {
  async run(progressCallback?: (progress: number, testName: string) => void): Promise<{ passed: boolean; unitTestResults: TestResult[] }> {
    const results: TestResult[] = [];
    const tests = [
      {
        name: "Smart Layer Selector Test",
        test: async () => {
          const analysis = await SmartLayerSelector.analyzeAndRecommend('const test = "hello"; localStorage.getItem("theme");');
          // Access properties correctly after await
          return analysis.recommendedLayers.length > 0 && analysis.detectedIssues.length > 0;
        }
      },
      {
        name: "Pattern Detection Test",
        test: async () => {
          const analysis = await SmartLayerSelector.analyzeAndRecommend('items.map(item => <div>{item.name}</div>)');
          return analysis.detectedIssues.some(issue => issue.pattern === 'missing keys');
        }
      }
    ];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const startTime = performance.now();
      
      try {
        const passed = await test.test();
        const duration = performance.now() - startTime;
        
        results.push({
          name: test.name,
          passed,
          success: passed,
          duration,
          executionTime: duration
        });
        
      } catch (error) {
        const duration = performance.now() - startTime;
        
        results.push({
          name: test.name,
          passed: false,
          success: false,
          duration,
          executionTime: duration,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      if (progressCallback) {
        progressCallback(((i + 1) / tests.length) * 100, test.name);
      }
    }
    
    return {
      passed: results.every(r => r.passed),
      unitTestResults: results
    };
  }
}
