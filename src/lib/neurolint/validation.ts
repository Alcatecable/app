import { ValidationResult, CORRUPTION_PATTERNS } from "./types";
import { parse, ParserOptions } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

interface ASTValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive validation system for transformations
 * Catches syntax errors, corruption, and logical issues
 * Includes AST validation for layers 3-4 (Components and Hydration)
 */
export class TransformationValidator {
  /**
   * Main validation entry point
   */
  static validateTransformation(
    before: string,
    after: string,
    layerId?: number,
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

    // AST validation for layers 3-4 (Components and Hydration)
    if (layerId === 3 || layerId === 4) {
      const astCheck = this.validateWithAST(before, after, layerId);
      if (!astCheck.valid) {
        return {
          shouldRevert: true,
          reason: `AST validation failed: ${astCheck.errors.join(", ")}`,
        };
      }
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

  /**
   * AST-based validation for layers 3-4 (Components and Hydration)
   * Validates React/JSX specific transformations using Babel AST
   */
  private static validateWithAST(
    before: string,
    after: string,
    layerId: number,
  ): ASTValidationResult {
    const result: ASTValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Parse both versions with TypeScript and JSX support
      const beforeAST = this.parseToAST(before);
      const afterAST = this.parseToAST(after);

      if (!beforeAST || !afterAST) {
        result.valid = false;
        result.errors.push("Failed to parse code to AST");
        return result;
      }

      // Layer 3: Component-specific validations
      if (layerId === 3) {
        this.validateComponentTransformation(beforeAST, afterAST, result);
      }

      // Layer 4: Hydration-specific validations
      if (layerId === 4) {
        this.validateHydrationTransformation(beforeAST, afterAST, result);
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(
        `AST validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return result;
  }

  /**
   * Parse code to AST with proper TypeScript and JSX support
   */
  private static parseToAST(code: string): t.File | null {
    try {
      const parserOptions: ParserOptions = {
        sourceType: "module",
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: [
          "typescript",
          "jsx",
          "decorators-legacy",
          "classProperties",
          "objectRestSpread",
          "functionBind",
          "exportDefaultFrom",
          "exportNamespaceFrom",
          "dynamicImport",
          "nullishCoalescingOperator",
          "optionalChaining",
        ],
      };

      return parse(code, parserOptions);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate Layer 3 (Component) transformations
   */
  private static validateComponentTransformation(
    beforeAST: t.File,
    afterAST: t.File,
    result: ASTValidationResult,
  ): void {
    // Track JSX elements with map operations to ensure key props are properly added
    let beforeMapElements = 0;
    let afterMapElements = 0;
    let beforeKeysCount = 0;
    let afterKeysCount = 0;

    // Analyze before AST
    traverse(beforeAST, {
      CallExpression: (path) => {
        // Check for .map() calls that return JSX
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property, { name: "map" })
        ) {
          const callback = path.node.arguments[0];
          if (
            t.isArrowFunctionExpression(callback) ||
            t.isFunctionExpression(callback)
          ) {
            // Check if the callback returns JSX
            let returnsJSX = false;
            if (
              t.isJSXElement(callback.body) ||
              t.isJSXFragment(callback.body)
            ) {
              returnsJSX = true;
            } else if (t.isBlockStatement(callback.body)) {
              traverse(
                t.program([callback.body]),
                {
                  ReturnStatement: (returnPath) => {
                    if (
                      t.isJSXElement(returnPath.node.argument) ||
                      t.isJSXFragment(returnPath.node.argument)
                    ) {
                      returnsJSX = true;
                    }
                  },
                },
                path.scope,
              );
            }

            if (returnsJSX) {
              beforeMapElements++;
            }
          }
        }
      },
      JSXAttribute: (path) => {
        if (t.isJSXIdentifier(path.node.name, { name: "key" })) {
          beforeKeysCount++;
        }
      },
    });

    // Analyze after AST
    traverse(afterAST, {
      CallExpression: (path) => {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property, { name: "map" })
        ) {
          const callback = path.node.arguments[0];
          if (
            t.isArrowFunctionExpression(callback) ||
            t.isFunctionExpression(callback)
          ) {
            let returnsJSX = false;
            if (
              t.isJSXElement(callback.body) ||
              t.isJSXFragment(callback.body)
            ) {
              returnsJSX = true;
            } else if (t.isBlockStatement(callback.body)) {
              traverse(
                t.program([callback.body]),
                {
                  ReturnStatement: (returnPath) => {
                    if (
                      t.isJSXElement(returnPath.node.argument) ||
                      t.isJSXFragment(returnPath.node.argument)
                    ) {
                      returnsJSX = true;
                    }
                  },
                },
                path.scope,
              );
            }

            if (returnsJSX) {
              afterMapElements++;
            }
          }
        }
      },
      JSXAttribute: (path) => {
        if (t.isJSXIdentifier(path.node.name, { name: "key" })) {
          afterKeysCount++;
        }
      },
    });

    // Validate key prop additions
    if (beforeMapElements > 0 && beforeKeysCount < beforeMapElements) {
      // There were map operations without proper keys
      if (afterKeysCount <= beforeKeysCount) {
        result.errors.push(
          "Expected key props to be added to mapped JSX elements",
        );
        result.valid = false;
      } else {
        result.warnings.push(
          `Added ${afterKeysCount - beforeKeysCount} key props to mapped elements`,
        );
      }
    }

    // Validate that no JSX elements were broken during transformation
    let beforeJSXCount = 0;
    let afterJSXCount = 0;

    traverse(beforeAST, {
      JSXElement: () => beforeJSXCount++,
      JSXFragment: () => beforeJSXCount++,
    });

    traverse(afterAST, {
      JSXElement: () => afterJSXCount++,
      JSXFragment: () => afterJSXCount++,
    });

    // Allow for reasonable variations in JSX count due to transformations
    if (Math.abs(afterJSXCount - beforeJSXCount) > beforeJSXCount * 0.5) {
      result.warnings.push(
        `Significant change in JSX element count: ${beforeJSXCount} → ${afterJSXCount}`,
      );
    }
  }

  /**
   * Validate Layer 4 (Hydration) transformations
   */
  private static validateHydrationTransformation(
    beforeAST: t.File,
    afterAST: t.File,
    result: ASTValidationResult,
  ): void {
    let beforeBrowserAPIs = 0;
    let afterGuardedAPIs = 0;
    let beforeGuardedAPIs = 0;

    // Count browser API usage in before AST
    traverse(beforeAST, {
      MemberExpression: (path) => {
        if (
          t.isIdentifier(path.node.object, { name: "localStorage" }) ||
          t.isIdentifier(path.node.object, { name: "sessionStorage" }) ||
          t.isIdentifier(path.node.object, { name: "window" }) ||
          t.isIdentifier(path.node.object, { name: "document" })
        ) {
          // Check if already guarded
          if (this.isSSRGuarded(path)) {
            beforeGuardedAPIs++;
          } else {
            beforeBrowserAPIs++;
          }
        }
      },
    });

    // Count guarded browser API usage in after AST
    traverse(afterAST, {
      MemberExpression: (path) => {
        if (
          t.isIdentifier(path.node.object, { name: "localStorage" }) ||
          t.isIdentifier(path.node.object, { name: "sessionStorage" }) ||
          t.isIdentifier(path.node.object, { name: "window" }) ||
          t.isIdentifier(path.node.object, { name: "document" })
        ) {
          if (this.isSSRGuarded(path)) {
            afterGuardedAPIs++;
          }
        }
      },
    });

    // Validate that unguarded browser APIs were properly protected
    if (beforeBrowserAPIs > 0) {
      const expectedGuardedAPIs = beforeGuardedAPIs + beforeBrowserAPIs;
      if (afterGuardedAPIs < expectedGuardedAPIs) {
        result.errors.push(
          `Expected ${expectedGuardedAPIs} guarded browser API calls, found ${afterGuardedAPIs}`,
        );
        result.valid = false;
      } else if (afterGuardedAPIs > beforeGuardedAPIs) {
        result.warnings.push(
          `Added SSR guards to ${afterGuardedAPIs - beforeGuardedAPIs} browser API calls`,
        );
      }
    }

    // Validate useState hydration protection
    this.validateHydrationProtection(beforeAST, afterAST, result);
  }

  /**
   * Check if a browser API call is properly SSR guarded
   */
  private static isSSRGuarded(path: any): boolean {
    // Look for typeof window !== "undefined" or similar guards
    let parent = path.parent;
    while (parent) {
      if (
        t.isLogicalExpression(parent) &&
        parent.operator === "&&" &&
        t.isBinaryExpression(parent.left)
      ) {
        const left = parent.left;
        if (
          left.operator === "!==" &&
          t.isUnaryExpression(left.left, { operator: "typeof" }) &&
          t.isIdentifier(left.left.argument, { name: "window" }) &&
          t.isStringLiteral(left.right, { value: "undefined" })
        ) {
          return true;
        }
      }
      parent = parent.parent;
    }
    return false;
  }

  /**
   * Validate hydration protection patterns
   */
  private static validateHydrationProtection(
    beforeAST: t.File,
    afterAST: t.File,
    result: ASTValidationResult,
  ): void {
    let beforeMountedStates = 0;
    let afterMountedStates = 0;

    // Look for mounted state pattern
    const mountedPattern =
      /const\s*\[\s*mounted\s*,\s*setMounted\s*\]\s*=\s*useState\s*\(\s*false\s*\)/;

    traverse(beforeAST, {
      VariableDeclarator: (path) => {
        if (
          t.isArrayPattern(path.node.id) &&
          path.node.id.elements.length === 2 &&
          t.isIdentifier(path.node.id.elements[0], { name: "mounted" })
        ) {
          beforeMountedStates++;
        }
      },
    });

    traverse(afterAST, {
      VariableDeclarator: (path) => {
        if (
          t.isArrayPattern(path.node.id) &&
          path.node.id.elements.length === 2 &&
          t.isIdentifier(path.node.id.elements[0], { name: "mounted" })
        ) {
          afterMountedStates++;
        }
      },
    });

    if (afterMountedStates > beforeMountedStates) {
      result.warnings.push(
        `Added ${afterMountedStates - beforeMountedStates} mounted state patterns for hydration protection`,
      );
    }
  }
}
