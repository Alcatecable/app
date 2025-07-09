import { ValidationResult, CORRUPTION_PATTERNS } from "./types";

/**
 * Comprehensive validation system for transformations
 * Catches syntax errors, corruption, and logical issues
 */
export class TransformationValidator {
  /**
   * Main validation entry point
   */
  static validateTransformation(
    before: string,
    after: string,
  ): ValidationResult {
    // Skip validation if no changes were made
    if (before === after) {
      return { shouldRevert: false, reason: "No changes made" };
    }

    // Check for syntax validity
    const syntaxCheck = this.validateSyntax(after);
    if (!syntaxCheck.valid) {
      return {
        shouldRevert: true,
        reason: `Syntax error: ${syntaxCheck.error}`,
      };
    }

    // Check for code corruption patterns
    const corruptionCheck = this.detectCorruption(before, after);
    if (corruptionCheck.detected) {
      return {
        shouldRevert: true,
        reason: `Corruption detected: ${corruptionCheck.pattern}`,
      };
    }

    // Check for logical issues
    const logicalCheck = this.validateLogicalIntegrity(before, after);
    if (!logicalCheck.valid) {
      return {
        shouldRevert: true,
        reason: `Logical issue: ${logicalCheck.reason}`,
      };
    }

    return { shouldRevert: false };
  }

  /**
   * Parse code to check for syntax errors
   * Using heuristic checks for React/JSX code
   */
  private static validateSyntax(code: string): {
    valid: boolean;
    error?: string;
  } {
    try {
      // For React/JSX code, we use basic heuristic checks instead of Function constructor
      // since JSX is not valid JavaScript that can be executed directly

      // Check for common syntax issues
      const brackets = this.validateBracketBalance(code);
      if (!brackets.valid) {
        return {
          valid: false,
          error: `Unbalanced brackets: ${brackets.error}`,
        };
      }

      // Check for basic JavaScript syntax patterns
      const basicSyntax = this.validateBasicJSSyntax(code);
      if (!basicSyntax.valid) {
        return {
          valid: false,
          error: basicSyntax.error,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown syntax error",
      };
    }
  }

  /**
   * Check if brackets are balanced
   */
  private static validateBracketBalance(code: string): {
    valid: boolean;
    error?: string;
  } {
    const brackets = { "(": 0, "[": 0, "{": 0, "<": 0 };
    const closing = { ")": "(", "]": "[", "}": "{", ">": "<" };

    for (const char of code) {
      if (char in brackets) {
        brackets[char as keyof typeof brackets]++;
      } else if (char in closing) {
        const opening = closing[char as keyof typeof closing];
        if (brackets[opening as keyof typeof brackets] > 0) {
          brackets[opening as keyof typeof brackets]--;
        } else {
          return { valid: false, error: `Unexpected closing ${char}` };
        }
      }
    }

    for (const [bracket, count] of Object.entries(brackets)) {
      if (count > 0) {
        return { valid: false, error: `Unclosed ${bracket}` };
      }
    }

    return { valid: true };
  }

  /**
   * Basic JavaScript syntax validation
   */
  private static validateBasicJSSyntax(code: string): {
    valid: boolean;
    error?: string;
  } {
    // Check for obvious syntax errors
    const errorPatterns = [
      {
        pattern: /(\w+)\s*\(\s*\)\s*=>\s*\(\s*\)\s*=>/g,
        error: "Double arrow functions detected",
      },
      {
        pattern: /import\s*{\s*\n\s*import\s*{/g,
        error: "Malformed import statements",
      },
      {
        pattern: /onClick=\{[^}]*\([^)]*\)\s*=>\s*\(\)\s*=>/g,
        error: "Malformed event handlers",
      },
    ];

    for (const { pattern, error } of errorPatterns) {
      if (pattern.test(code)) {
        return { valid: false, error };
      }
    }

    return { valid: true };
  }

  /**
   * Detect common corruption patterns introduced by faulty transformations
   */
  private static detectCorruption(
    before: string,
    after: string,
  ): {
    detected: boolean;
    pattern?: string;
  } {
    for (const pattern of CORRUPTION_PATTERNS) {
      // Check if pattern exists in after but not before
      if (pattern.regex.test(after) && !pattern.regex.test(before)) {
        return {
          detected: true,
          pattern: pattern.name,
        };
      }
    }

    return { detected: false };
  }

  /**
   * Validate logical integrity of transformations
   */
  private static validateLogicalIntegrity(
    before: string,
    after: string,
  ): {
    valid: boolean;
    reason?: string;
  } {
    // Check that essential imports weren't accidentally removed
    const beforeImports = this.extractImports(before);
    const afterImports = this.extractImports(after);

    const removedImports = beforeImports.filter(
      (imp) => !afterImports.includes(imp),
    );
    const criticalImports = ["React", "useState", "useEffect"];

    const removedCritical = removedImports.filter((imp) =>
      criticalImports.some((critical) => imp.includes(critical)),
    );

    if (removedCritical.length > 0) {
      return {
        valid: false,
        reason: `Critical imports removed: ${removedCritical.join(", ")}`,
      };
    }

    return { valid: true };
  }

  private static extractImports(code: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"]/g;
    return code.match(importRegex) || [];
  }
}
