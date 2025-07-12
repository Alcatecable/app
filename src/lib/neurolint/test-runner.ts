
import { PerformanceMetrics, TestResult } from "./types";
import { unitTests } from "./tests/unit-tests";
import { integrationTests } from "./tests/integration-tests";
import { performanceTests } from "./tests/performance-tests";
import { edgeCaseTests } from "./tests/edge-case-tests";
import { loadTests } from "./tests/load-tests";

export class NeuroLintTestRunner {
  async runUnitTest(test: { name: string; test: () => Promise<boolean> }): Promise<TestResult> {
    const startTime = performance.now();
    let passed = false;
    let error: any = null;

    try {
      passed = await test.test();
    } catch (e: any) {
      error = e;
      console.error(`❌ Unit Test ${test.name} Failed:`, e);
    }

    const duration = performance.now() - startTime;

    return {
      name: test.name,
      passed: passed && !error,
      success: passed && !error,
      duration,
      executionTime: duration,
      error: error ? error.message : null,
      details: error ? error.stack : null,
    };
  }

  async runIntegrationTest(test: { name: string; test: () => Promise<boolean> }): Promise<TestResult> {
    const startTime = performance.now();
    let passed = false;
    let error: any = null;

    try {
      passed = await test.test();
    } catch (e: any) {
      error = e;
      console.error(`❌ Integration Test ${test.name} Failed:`, e);
    }

    const duration = performance.now() - startTime;

    return {
      name: test.name,
      passed: passed && !error,
      success: passed && !error,
      duration,
      executionTime: duration,
      error: error ? error.message : null,
      details: error ? error.stack : null,
    };
  }

  async runPerformanceTest(test: { name: string; test: () => Promise<PerformanceMetrics> }): Promise<PerformanceMetrics> {
    try {
      return await test.test();
    } catch (e: any) {
      console.error(`❌ Performance Test ${test.name} Failed:`, e);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        maxMemoryUsage: 0,
        cpuUsage: 0,
        errors: [e.message],
      };
    }
  }

  async runEdgeCaseTest(test: { name: string; test: () => Promise<boolean> }): Promise<TestResult> {
    const startTime = performance.now();
    let passed = false;
    let error: any = null;

    try {
      passed = await test.test();
    } catch (e: any) {
      error = e;
      console.error(`❌ Edge Case Test ${test.name} Failed:`, e);
    }

    const duration = performance.now() - startTime;

    return {
      name: test.name,
      passed: passed && !error,
      success: passed && !error,
      duration,
      executionTime: duration,
      error: error ? error.message : null,
      details: error ? error.stack : null,
    };
  }

  async runLoadTest(test: { name: string; test: () => Promise<boolean> }): Promise<TestResult> {
    const startTime = performance.now();
    let passed = false;
    let error: any = null;

    try {
      passed = await test.test();
    } catch (e: any) {
      error = e;
      console.error(`❌ Load Test ${test.name} Failed:`, e);
    }

    const duration = performance.now() - startTime;

    return {
      name: test.name,
      passed: passed && !error,
      success: passed && !error,
      duration,
      executionTime: duration,
      error: error ? error.message : null,
      details: error ? error.stack : null,
    };
  }

  async runUnitTests(): Promise<{ passed: boolean; tests: TestResult[] }> {
    console.log('🏃 Running Unit Tests...');
    const testResults: TestResult[] = [];

    for (const test of unitTests) {
      const result = await this.runUnitTest(test);
      testResults.push(result);
    }

    const passed = testResults.every(test => test.passed);
    console.log(`✅ Unit Tests ${passed ? 'Passed' : 'Failed'}`);

    return { passed, tests: testResults };
  }

  async runIntegrationTests(): Promise<{ passed: boolean; tests: TestResult[] }> {
    console.log('🔗 Running Integration Tests...');
    const testResults: TestResult[] = [];

    for (const test of integrationTests) {
      const result = await this.runIntegrationTest(test);
      testResults.push(result);
    }

    const passed = testResults.every(test => test.passed);
    console.log(`✅ Integration Tests ${passed ? 'Passed' : 'Failed'}`);

    return { passed, tests: testResults };
  }

  async runPerformanceTests(): Promise<PerformanceMetrics> {
    console.log('⚡ Running Performance Tests...');
    let overallMetrics: PerformanceMetrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      maxMemoryUsage: 0,
      cpuUsage: 0,
      errors: [],
    };

    for (const test of performanceTests) {
      const metrics = await this.runPerformanceTest(test);
      overallMetrics = {
        totalExecutions: overallMetrics.totalExecutions + metrics.totalExecutions,
        successfulExecutions: overallMetrics.successfulExecutions + metrics.successfulExecutions,
        failedExecutions: overallMetrics.failedExecutions + metrics.failedExecutions,
        averageExecutionTime: overallMetrics.averageExecutionTime + metrics.averageExecutionTime,
        lastExecutionTime: metrics.lastExecutionTime,
        maxMemoryUsage: Math.max(overallMetrics.maxMemoryUsage, metrics.maxMemoryUsage),
        cpuUsage: Math.max(overallMetrics.cpuUsage, metrics.cpuUsage),
        errors: [...overallMetrics.errors, ...metrics.errors],
      };
    }

    console.log(`✅ Performance Tests Completed`);
    return overallMetrics;
  }

  async runEdgeCaseTests(): Promise<{ passed: boolean; tests: TestResult[] }> {
    console.log('⚠️ Running Edge Case Tests...');
    const testResults: TestResult[] = [];

    for (const test of edgeCaseTests) {
      const result = await this.runEdgeCaseTest(test);
      testResults.push(result);
    }

    const passed = testResults.every(test => test.passed);
    console.log(`✅ Edge Case Tests ${passed ? 'Passed' : 'Failed'}`);

    return { passed, tests: testResults };
  }

  async runLoadTests(): Promise<{ passed: boolean; tests: TestResult[] }> {
    console.log('🔥 Running Load Tests...');
    const testResults: TestResult[] = [];

    for (const test of loadTests) {
      const result = await this.runLoadTest(test);
      testResults.push(result);
    }

    const passed = testResults.every(test => test.passed);
    console.log(`✅ Load Tests ${passed ? 'Passed' : 'Failed'}`);

    return { passed, tests: testResults };
  }

  async runAllTests(): Promise<{
    passed: boolean;
    tests: TestResult[];
    totalDuration: number;
    averageDuration: number;
    performanceResults: PerformanceMetrics;
  }> {
    console.log('🧪 Running NeuroLint Test Suite...');
    
    const allTests: TestResult[] = [];
    const startTime = performance.now();
    
    // Run all test categories
    const unitResults = await this.runUnitTests();
    const integrationResults = await this.runIntegrationTests();
    const performanceResults = await this.runPerformanceTests();
    const edgeCaseResults = await this.runEdgeCaseTests();
    const loadTestResults = await this.runLoadTests();
    
    allTests.push(...unitResults.tests);
    allTests.push(...integrationResults.tests);
    allTests.push(...edgeCaseResults.tests);
    allTests.push(...loadTestResults.tests);
    
    const totalDuration = performance.now() - startTime;
    const passed = allTests.every(test => test.passed);
    
    console.log(`✅ Test suite completed in ${totalDuration.toFixed(0)}ms`);
    console.log(`📊 ${allTests.filter(t => t.passed).length}/${allTests.length} tests passed`);
    
    return {
      passed,
      tests: allTests,
      totalDuration,
      averageDuration: totalDuration / allTests.length,
      performanceResults: performanceResults
    };
  }
}

// Export both the class and as default for compatibility
export { NeuroLintTestRunner as TestRunner };
export default NeuroLintTestRunner;
