
export { TestRunner } from "./test-runner/core";
export { UnitTestRunner } from "./test-runner/unit-tests";
export { IntegrationTestRunner } from "./test-runner/integration-tests";
export { EdgeCaseTestRunner } from "./test-runner/edge-case-tests";
export { LoadTestRunner } from "./test-runner/load-tests";
export { CustomCodeTestRunner } from "./test-runner/custom-code-tests";

// Re-export types for backward compatibility
export type { TestResult, LayerTestResult, TestSuite } from "./types";
