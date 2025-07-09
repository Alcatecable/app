
import { TestResult, LayerTestResult, TestSuite } from "../types";
import { UnitTestRunner } from "./unit-tests";
import { IntegrationTestRunner } from "./integration-tests";
import { EdgeCaseTestRunner } from "./edge-case-tests";
import { LoadTestRunner } from "./load-tests";
import { CustomCodeTestRunner } from "./custom-code-tests";

/**
 * Core test runner orchestrator
 * Coordinates all test execution types
 */
export class TestRunner {
  private unitTestRunner: UnitTestRunner;
  private integrationTestRunner: IntegrationTestRunner;
  private edgeCaseTestRunner: EdgeCaseTestRunner;
  private loadTestRunner: LoadTestRunner;
  private customCodeTestRunner: CustomCodeTestRunner;

  constructor() {
    this.unitTestRunner = new UnitTestRunner();
    this.integrationTestRunner = new IntegrationTestRunner();
    this.edgeCaseTestRunner = new EdgeCaseTestRunner();
    this.loadTestRunner = new LoadTestRunner();
    this.customCodeTestRunner = new CustomCodeTestRunner();
  }

  async runUnitTests(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; unitTestResults: TestResult[] }> {
    return this.unitTestRunner.run(progressCallback);
  }

  async runIntegrationTests(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; integrationResults: TestResult[] }> {
    return this.integrationTestRunner.run(progressCallback);
  }

  async runEdgeCaseTests(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; edgeCaseResults: TestResult[] }> {
    return this.edgeCaseTestRunner.run(progressCallback);
  }

  async runLoadTests(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; loadTestResults: TestResult[] }> {
    return this.loadTestRunner.run(progressCallback);
  }

  async runCustomCodeTest(
    code: string,
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; layerResults: LayerTestResult[] }> {
    return this.customCodeTestRunner.run(code, progressCallback);
  }

  async runFullTestSuite(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<TestSuite> {
    const unitResults = await this.runUnitTests(progressCallback);
    const integrationResults = await this.runIntegrationTests(progressCallback);
    const edgeCaseResults = await this.runEdgeCaseTests(progressCallback);
    const loadResults = await this.runLoadTests(progressCallback);

    return {
      unitTestResults: unitResults.unitTestResults,
      integrationResults: integrationResults.integrationResults,
      layerResults: [],
      performanceResults: {
        loadTestsPassed: loadResults.passed,
        averageExecutionTime: this.calculateAverageExecutionTime(loadResults.loadTestResults),
      },
      edgeCaseResults: edgeCaseResults.edgeCaseResults,
      loadTestResults: loadResults.loadTestResults,
    };
  }

  private calculateAverageExecutionTime(results: TestResult[]): number {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.duration, 0);
    return total / results.length;
  }
}
