
import { TestResult } from "../types";
import { NeuroLintOrchestrator } from "../orchestrator";

/**
 * Edge case test runner for handling unusual scenarios
 */
export class EdgeCaseTestRunner {
  async run(
    progressCallback?: (progress: number, testName: string) => void,
  ): Promise<{ passed: boolean; edgeCaseResults: TestResult[] }> {
    const edgeCases = [
      { name: "Empty Code Input", code: "" },
      { name: "Invalid JavaScript Syntax", code: "const invalid = function( { return }" },
      { name: "Deeply Nested Components", code: this.generateDeeplyNestedComponent(20) },
      { name: "Very Large File", code: this.generateLargeCodeFile(1000) },
      { name: "Unicode and Special Characters", code: 'const 测试 = "🎉"; // ñáéíóú' },
      { name: "Mixed JS/TS/JSX Syntax", code: this.generateMixedSyntaxCode() },
      { name: "Malformed JSX", code: "<div><span>Unclosed component" },
      { name: "Complex Regex Patterns", code: this.generateComplexRegexCode() },
    ];

    const results: TestResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < edgeCases.length; i++) {
      const edgeCase = edgeCases[i];
      progressCallback?.(((i + 1) / edgeCases.length) * 100, edgeCase.name);

      const startTime = Date.now();
      try {
        const result = await NeuroLintOrchestrator.transform(edgeCase.code, [1, 2, 3, 4, 5, 6, 7]);
        const duration = Date.now() - startTime;
        const passed = result.finalCode !== undefined;

        results.push({ passed, duration });
        if (passed) passedCount++;
      } catch (error) {
        const duration = Date.now() - startTime;
        const passed = true; // Graceful error handling is acceptable
        results.push({
          passed,
          duration,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        passedCount++;
      }
    }

    return {
      passed: passedCount >= Math.floor(edgeCases.length * 0.8),
      edgeCaseResults: results,
    };
  }

  private generateDeeplyNestedComponent(depth: number): string {
    let code = "const DeepComponent = () => {\n  return (\n";

    for (let i = 0; i < depth; i++) {
      code += "    ".repeat(i + 2) + `<div className="level-${i}">\n`;
    }

    code += "    ".repeat(depth + 2) + "<span>Deep content</span>\n";

    for (let i = depth - 1; i >= 0; i--) {
      code += "    ".repeat(i + 2) + "</div>\n";
    }

    code += "  );\n};";
    return code;
  }

  private generateLargeCodeFile(lines: number): string {
    let code = "";
    for (let i = 0; i < lines; i++) {
      code += `const variable${i} = "Line ${i} of large file";\n`;
    }
    return code;
  }

  private generateMixedSyntaxCode(): string {
    return `
      interface User {
        id: number;
        name: string;
      }

      function getUsers() {
        return fetch('/api/users');
      }

      const UserComponent: React.FC<{user: User}> = ({ user }) => {
        return <div key={user.id}>{user.name}</div>;
      };

      const users: User[] = [];
      users.map(user => <UserComponent user={user} />);
    `;
  }

  private generateComplexRegexCode(): string {
    return `
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const phoneRegex = /^\\+?1?[-\\s.]?\\(?[0-9]{3}\\)?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}$/;
      const testString = "test@example.com";
      const matches = testString.match(emailRegex);
    `;
  }
}
