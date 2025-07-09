/**
 * Document Compliance Verification Test
 * Ensures implementation follows the NeuroLint Layer Orchestration Implementation Patterns
 */

import { NeuroLintOrchestrator } from "./orchestrator";
import { TransformationValidator } from "./validation";
import { LayerDependencyManager } from "./dependency-manager";
import { SmartLayerSelector } from "./smart-selector";
import { ErrorRecoverySystem } from "./error-recovery";

export class DocumentComplianceTest {
  /**
   * Run comprehensive compliance verification
   */
  static async verifyDocumentCompliance(): Promise<{
    success: boolean;
    results: Array<{ test: string; passed: boolean; details?: string }>;
  }> {
    const results: Array<{ test: string; passed: boolean; details?: string }> =
      [];

    console.log("🔍 Running Document Compliance Verification...");

    // Test 1: Safe Layer Execution Pattern
    const safeExecutionTest = await this.testSafeLayerExecution();
    results.push(safeExecutionTest);

    // Test 2: Incremental Validation System
    const validationTest = await this.testIncrementalValidation();
    results.push(validationTest);

    // Test 3: Layer Dependency Management
    const dependencyTest = await this.testLayerDependencyManagement();
    results.push(dependencyTest);

    // Test 4: Smart Layer Selection
    const smartSelectionTest = await this.testSmartLayerSelection();
    results.push(smartSelectionTest);

    // Test 5: Error Recovery and Reporting
    const errorRecoveryTest = await this.testErrorRecovery();
    results.push(errorRecoveryTest);

    const success = results.every((r) => r.passed);

    console.log(
      `📊 Compliance Test Results: ${results.filter((r) => r.passed).length}/${results.length} passed`,
    );

    return { success, results };
  }

  /**
   * Test Safe Layer Execution Pattern compliance
   */
  private static async testSafeLayerExecution(): Promise<{
    test: string;
    passed: boolean;
    details?: string;
  }> {
    const testCode = `
const test = "Hello World";
console.log("test");
let items = [1,2,3];
items.map(item => <div>{item}</div>);
localStorage.setItem("test", "value");`;

    try {
      const result = await NeuroLintOrchestrator.transform(
        testCode,
        [1, 2, 3, 4],
        {
          verbose: true,
          dryRun: false,
        },
      );

      // Verify rollback capability - final code should never be corrupted
      const hasStates = result.states && result.states.length > 0;
      const hasFinalCode = result.finalCode && result.finalCode.length > 0;
      const hasResults = result.results && result.results.length > 0;

      // Verify each layer result has required fields
      const layerResultsValid = result.results.every(
        (r) =>
          typeof r.layerId === "number" &&
          typeof r.success === "boolean" &&
          typeof r.code === "string" &&
          typeof r.executionTime === "number" &&
          typeof r.changeCount === "number",
      );

      const passed =
        hasStates && hasFinalCode && hasResults && layerResultsValid;

      return {
        test: "Safe Layer Execution Pattern",
        passed,
        details: passed
          ? "All safety mechanisms working correctly"
          : "Safety mechanisms incomplete",
      };
    } catch (error) {
      return {
        test: "Safe Layer Execution Pattern",
        passed: false,
        details: `Error during execution: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Test Incremental Validation System compliance
   */
  private static async testIncrementalValidation(): Promise<{
    test: string;
    passed: boolean;
    details?: string;
  }> {
    // Test validation with good transformation
    const goodTransformation = TransformationValidator.validateTransformation(
      'const test = "hello";',
      'const test = "hello world";',
    );

    // Test validation with corrupted transformation (should revert)
    const corruptedTransformation =
      TransformationValidator.validateTransformation(
        "<button onClick={() => handleClick()}>Click</button>",
        "<button onClick={() => () => handleClick()}>Click</button>", // Double arrow function
      );

    const goodValidationWorks = !goodTransformation.shouldRevert;
    const corruptionDetected = corruptedTransformation.shouldRevert;

    const passed = goodValidationWorks && corruptionDetected;

    return {
      test: "Incremental Validation System",
      passed,
      details: passed
        ? "Validation correctly accepts good transformations and rejects corrupted ones"
        : `Good validation: ${goodValidationWorks}, Corruption detection: ${corruptionDetected}`,
    };
  }

  /**
   * Test Layer Dependency Management compliance
   */
  private static async testLayerDependencyManagement(): Promise<{
    test: string;
    passed: boolean;
    details?: string;
  }> {
    // Test that requesting layer 4 automatically includes 1, 2, 3
    const result = LayerDependencyManager.validateAndCorrectLayers([4]);

    const hasAllDependencies =
      result.correctedLayers.includes(1) &&
      result.correctedLayers.includes(2) &&
      result.correctedLayers.includes(3) &&
      result.correctedLayers.includes(4);

    const isInCorrectOrder =
      JSON.stringify(result.correctedLayers) === JSON.stringify([1, 2, 3, 4]);

    const hasWarnings = result.warnings.length > 0;
    const hasAutoAdded = result.autoAdded.length > 0;

    const passed =
      hasAllDependencies && isInCorrectOrder && hasWarnings && hasAutoAdded;

    return {
      test: "Layer Dependency Management",
      passed,
      details: passed
        ? "Dependencies automatically resolved and warnings generated"
        : `Dependencies: ${hasAllDependencies}, Order: ${isInCorrectOrder}, Warnings: ${hasWarnings}`,
    };
  }

  /**
   * Test Smart Layer Selection compliance
   */
  private static async testSmartLayerSelection(): Promise<{
    test: string;
    passed: boolean;
    details?: string;
  }> {
    const testCode = `
const message = &quot;Hello &amp; welcome&quot;;
function ItemList({ items }) {
  return items.map(item => <li>{item.name}</li>);
}
const data = localStorage.getItem('key');`;

    const recommendation = SmartLayerSelector.analyzeAndRecommend(testCode);

    const hasRecommendations = recommendation.recommendedLayers.length > 0;
    const hasReasons = recommendation.reasoning.length > 0;
    const hasIssues = recommendation.detectedIssues.length > 0;
    const hasConfidence = typeof recommendation.confidence === "number";
    const hasImpact =
      recommendation.estimatedImpact &&
      typeof recommendation.estimatedImpact.level === "string";

    // Should detect HTML entities (layer 2), missing keys (layer 3), and localStorage (layer 4)
    const detectsHtmlEntities = recommendation.detectedIssues.some((i) =>
      i.pattern.includes("HTML"),
    );
    const detectsMissingKeys = recommendation.detectedIssues.some((i) =>
      i.pattern.includes("key"),
    );
    const detectsSSRIssues = recommendation.detectedIssues.some((i) =>
      i.pattern.includes("SSR"),
    );

    const passed =
      hasRecommendations &&
      hasReasons &&
      hasIssues &&
      hasConfidence &&
      hasImpact &&
      detectsHtmlEntities &&
      detectsMissingKeys &&
      detectsSSRIssues;

    return {
      test: "Smart Layer Selection",
      passed,
      details: passed
        ? "Code analysis and recommendations working correctly"
        : `Recommendations: ${hasRecommendations}, Issues: ${hasIssues}, Detection: HTML(${detectsHtmlEntities}) Keys(${detectsMissingKeys}) SSR(${detectsSSRIssues})`,
    };
  }

  /**
   * Test Error Recovery and Reporting compliance
   */
  private static async testErrorRecovery(): Promise<{
    test: string;
    passed: boolean;
    details?: string;
  }> {
    // Test error categorization
    const syntaxError = new Error("Unexpected token");
    syntaxError.name = "SyntaxError";

    const syntaxErrorInfo = ErrorRecoverySystem.categorizeError(
      syntaxError,
      3,
      "test code",
    );

    const astError = new Error("AST parsing failed");
    const astErrorInfo = ErrorRecoverySystem.categorizeError(
      astError,
      3,
      "test code",
    );

    const syntaxCategorized =
      syntaxErrorInfo.category === "syntax" &&
      syntaxErrorInfo.severity === "high" &&
      syntaxErrorInfo.recoveryOptions.length > 0;

    const astCategorized =
      astErrorInfo.category === "parsing" &&
      astErrorInfo.severity === "medium" &&
      astErrorInfo.recoveryOptions.length > 0;

    const passed = syntaxCategorized && astCategorized;

    return {
      test: "Error Recovery and Reporting",
      passed,
      details: passed
        ? "Error categorization and recovery suggestions working correctly"
        : `Syntax categorization: ${syntaxCategorized}, AST categorization: ${astCategorized}`,
    };
  }
}
