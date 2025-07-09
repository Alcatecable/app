/**
 * Enterprise Pattern Learner for Layer 7: Adaptive Pattern Learning
 * Supports both regex and AST-based pattern learning with browser/Node.js compatibility
 */

import { parse, ParserOptions } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export interface LearnedRule {
  id: string;
  pattern: string; // Stored as string, converted to RegExp when needed
  replacement: string;
  confidence: number; // 0-1, based on frequency and success
  frequency: number; // Number of times observed
  successRate: number; // Success rate when applied
  sourceLayer: number; // Layer that generated this pattern
  createdAt: number; // Timestamp
  lastUsed: number; // Last time applied
  description: string; // Human-readable description
  examples: string[]; // Example transformations
  type: "regex" | "ast"; // Pattern type for AST vs regex
  astMetadata?: ASTPatternMetadata; // Metadata for AST patterns
}

export interface ASTPatternMetadata {
  nodeType: string; // e.g., 'CallExpression', 'JSXElement'
  targetProperty?: string; // e.g., 'callee.property.name' for method calls
  contextRequirements?: string[]; // Required context patterns
  transformationType: "add" | "modify" | "wrap" | "replace";
}

export interface PatternLearningResult {
  appliedRules: string[];
  transformedCode: string;
  ruleCount: number;
  executionTime: number;
}

export interface PatternExtractionResult {
  newRules: LearnedRule[];
  updatedRules: LearnedRule[];
}

export class PatternLearner {
  private static readonly STORAGE_KEY = "neurolint_learned_patterns";
  private static readonly MIN_CONFIDENCE = 0.6;
  private static readonly MAX_RULES = 100; // Prevent unlimited growth
  private rules: LearnedRule[] = [];
  private isInitialized = false;

  constructor() {
    this.loadRules();
  }

  /**
   * Load rules from localStorage
   */
  private loadRules(): void {
    try {
      const stored = localStorage.getItem(PatternLearner.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.rules = Array.isArray(parsed) ? parsed : [];
        console.log(
          `🧠 Loaded ${this.rules.length} learned patterns from storage`,
        );
      }
    } catch (error) {
      console.warn("Failed to load learned patterns:", error);
      this.rules = [];
    }
    this.isInitialized = true;
  }

  /**
   * Save rules to localStorage
   */
  private saveRules(): void {
    try {
      // Keep only the most successful rules to prevent storage bloat
      const sortedRules = [...this.rules]
        .sort((a, b) => b.confidence * b.frequency - a.confidence * a.frequency)
        .slice(0, PatternLearner.MAX_RULES);

      localStorage.setItem(
        PatternLearner.STORAGE_KEY,
        JSON.stringify(sortedRules),
      );
      this.rules = sortedRules;
      console.log(`💾 Saved ${this.rules.length} learned patterns to storage`);
    } catch (error) {
      console.error("Failed to save learned patterns:", error);
    }
  }

  /**
   * Learn patterns from a transformation
   */
  public async learnFromTransformation(
    before: string,
    after: string,
    sourceLayer: number,
  ): Promise<PatternExtractionResult> {
    if (!this.isInitialized) {
      this.loadRules();
    }

    const startTime = Date.now();
    const result: PatternExtractionResult = {
      newRules: [],
      updatedRules: [],
    };

    try {
      if (before === after) {
        return result; // No changes to learn from
      }

      const patterns = this.extractPatterns(before, after, sourceLayer);

      for (const pattern of patterns) {
        const existingRuleIndex = this.rules.findIndex(
          (r) =>
            r.pattern === pattern.pattern &&
            r.sourceLayer === pattern.sourceLayer,
        );

        if (existingRuleIndex >= 0) {
          // Update existing rule
          const existingRule = this.rules[existingRuleIndex];
          existingRule.frequency++;
          existingRule.confidence = Math.min(
            0.95,
            existingRule.confidence + 0.02,
          );
          existingRule.lastUsed = Date.now();

          // Add example if we don't have too many
          if (existingRule.examples.length < 3) {
            const example = `${before.substring(0, 50)}... → ${after.substring(0, 50)}...`;
            if (!existingRule.examples.includes(example)) {
              existingRule.examples.push(example);
            }
          }

          result.updatedRules.push(existingRule);
        } else {
          // Create new rule
          const newRule: LearnedRule = {
            ...pattern,
            id: this.generateRuleId(),
            examples: [
              `${before.substring(0, 50)}... → ${after.substring(0, 50)}...`,
            ],
          };

          this.rules.push(newRule);
          result.newRules.push(newRule);
        }
      }

      this.saveRules();

      const executionTime = Date.now() - startTime;
      console.log(
        `🎯 Learned ${patterns.length} patterns from Layer ${sourceLayer} in ${executionTime}ms`,
      );

      return result;
    } catch (error) {
      console.error("Pattern learning failed:", error);
      return result;
    }
  }

  /**
   * Extract patterns from before/after states
   */
  private extractPatterns(
    before: string,
    after: string,
    sourceLayer: number,
  ): Omit<LearnedRule, "id" | "examples">[] {
    const patterns: Omit<LearnedRule, "id" | "examples">[] = [];

    // Line-by-line analysis for simple patterns
    const beforeLines = before.split("\n");
    const afterLines = after.split("\n");

    // Look for simple replacements
    for (let i = 0; i < Math.min(beforeLines.length, afterLines.length); i++) {
      const beforeLine = beforeLines[i]?.trim();
      const afterLine = afterLines[i]?.trim();

      if (beforeLine && afterLine && beforeLine !== afterLine) {
        const pattern = this.createPatternFromLines(
          beforeLine,
          afterLine,
          sourceLayer,
        );
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    // Look for additions at the beginning (like 'use client')
    if (afterLines.length > beforeLines.length) {
      const addedLines = afterLines.slice(
        0,
        afterLines.length - beforeLines.length,
      );
      for (const addedLine of addedLines) {
        if (addedLine.trim()) {
          patterns.push({
            pattern: "^(.*)$",
            replacement: `${addedLine}\n$1`,
            confidence: 0.7,
            frequency: 1,
            successRate: 1.0,
            sourceLayer,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            description: `Add "${addedLine.trim()}" directive`,
          });
        }
      }
    }

    // AST-based pattern extraction for layers 3-6
    if ([3, 4, 5, 6].includes(sourceLayer)) {
      const astPatterns = this.extractASTPatterns(before, after, sourceLayer);
      patterns.push(...astPatterns);
    }

    return patterns;
  }

  /**
   * Extract AST-based patterns for layers 3-6
   */
  private extractASTPatterns(
    before: string,
    after: string,
    sourceLayer: number,
  ): Omit<LearnedRule, "id" | "examples">[] {
    const patterns: Omit<LearnedRule, "id" | "examples">[] = [];

    try {
      const beforeAST = this.parseToAST(before);
      const afterAST = this.parseToAST(after);

      if (!beforeAST || !afterAST) {
        return patterns; // Fallback to regex patterns only
      }

      // Layer 3: Component AST patterns
      if (sourceLayer === 3) {
        patterns.push(...this.extractComponentASTPatterns(beforeAST, afterAST));
      }

      // Layer 4: Hydration AST patterns
      if (sourceLayer === 4) {
        patterns.push(...this.extractHydrationASTPatterns(beforeAST, afterAST));
      }

      // Layer 5: Next.js AST patterns
      if (sourceLayer === 5) {
        patterns.push(...this.extractNextJSASTPatterns(beforeAST, afterAST));
      }

      // Layer 6: Testing AST patterns
      if (sourceLayer === 6) {
        patterns.push(...this.extractTestingASTPatterns(beforeAST, afterAST));
      }
    } catch (error) {
      console.warn(
        `AST pattern extraction failed for layer ${sourceLayer}:`,
        error,
      );
    }

    return patterns;
  }

  /**
   * Parse code to AST with comprehensive TypeScript/JSX support
   */
  private parseToAST(code: string): t.File | null {
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
   * Extract Layer 3 (Component) AST patterns
   */
  private extractComponentASTPatterns(
    beforeAST: t.File,
    afterAST: t.File,
  ): Omit<LearnedRule, "id" | "examples">[] {
    const patterns: Omit<LearnedRule, "id" | "examples">[] = [];

    // Detect key prop additions in map operations
    let beforeMapWithoutKeys = 0;
    let afterMapWithKeys = 0;

    // Count maps without keys in before AST
    traverse(beforeAST, {
      CallExpression: (path) => {
        if (this.isMapCallReturningJSX(path) && !this.hasKeyPropInJSX(path)) {
          beforeMapWithoutKeys++;
        }
      },
    });

    // Count maps with keys in after AST
    traverse(afterAST, {
      CallExpression: (path) => {
        if (this.isMapCallReturningJSX(path) && this.hasKeyPropInJSX(path)) {
          afterMapWithKeys++;
        }
      },
    });

    // If keys were added, create an AST pattern
    if (beforeMapWithoutKeys > 0 && afterMapWithKeys > beforeMapWithoutKeys) {
      patterns.push({
        pattern: "\\.map\\s*\\(\\s*([^)]+)\\s*=>\\s*<([^>]+)>",
        replacement: ".map($1 => <$2 key={$1.id || Math.random()}>",
        confidence: 0.8,
        frequency: 1,
        successRate: 1.0,
        sourceLayer: 3,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: "Add key prop to mapped JSX elements",
        type: "ast",
        astMetadata: {
          nodeType: "CallExpression",
          targetProperty: "callee.property.name",
          contextRequirements: ["JSXElement", "ArrowFunctionExpression"],
          transformationType: "modify",
        },
      });
    }

    return patterns;
  }

  /**
   * Extract Layer 4 (Hydration) AST patterns
   */
  private extractHydrationASTPatterns(
    beforeAST: t.File,
    afterAST: t.File,
  ): Omit<LearnedRule, "id" | "examples">[] {
    const patterns: Omit<LearnedRule, "id" | "examples">[] = [];

    // Detect SSR guard additions
    let beforeUnguardedAPIs = 0;
    let afterGuardedAPIs = 0;

    // Count unguarded browser APIs in before AST
    traverse(beforeAST, {
      MemberExpression: (path) => {
        if (this.isBrowserAPI(path) && !this.isSSRGuarded(path)) {
          beforeUnguardedAPIs++;
        }
      },
    });

    // Count guarded browser APIs in after AST
    traverse(afterAST, {
      MemberExpression: (path) => {
        if (this.isBrowserAPI(path) && this.isSSRGuarded(path)) {
          afterGuardedAPIs++;
        }
      },
    });

    // If SSR guards were added, create pattern
    if (beforeUnguardedAPIs > 0 && afterGuardedAPIs > 0) {
      patterns.push({
        pattern: "localStorage\\.",
        replacement: 'typeof window !== "undefined" && localStorage.',
        confidence: 0.9,
        frequency: 1,
        successRate: 1.0,
        sourceLayer: 4,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: "Add SSR guard for browser APIs",
        type: "ast",
        astMetadata: {
          nodeType: "MemberExpression",
          targetProperty: "object.name",
          contextRequirements: [
            "localStorage",
            "sessionStorage",
            "window",
            "document",
          ],
          transformationType: "wrap",
        },
      });
    }

    return patterns;
  }

  /**
   * Extract Layer 5 (Next.js) AST patterns
   */
  private extractNextJSASTPatterns(
    beforeAST: t.File,
    afterAST: t.File,
  ): Omit<LearnedRule, "id" | "examples">[] {
    const patterns: Omit<LearnedRule, "id" | "examples">[] = [];

    // Detect 'use client' directive additions
    const beforeHasUseClient = this.hasUseClientDirective(beforeAST);
    const afterHasUseClient = this.hasUseClientDirective(afterAST);

    if (!beforeHasUseClient && afterHasUseClient) {
      patterns.push({
        pattern: "^((?:import\\s.*?\\n)*)",
        replacement: "'use client';\n\n$1",
        confidence: 0.85,
        frequency: 1,
        successRate: 1.0,
        sourceLayer: 5,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: "Add 'use client' directive for client components",
        type: "ast",
        astMetadata: {
          nodeType: "Program",
          targetProperty: "directives",
          contextRequirements: ["ImportDeclaration"],
          transformationType: "add",
        },
      });
    }

    return patterns;
  }

  /**
   * Extract Layer 6 (Testing) AST patterns
   */
  private extractTestingASTPatterns(
    beforeAST: t.File,
    afterAST: t.File,
  ): Omit<LearnedRule, "id" | "examples">[] {
    const patterns: Omit<LearnedRule, "id" | "examples">[] = [];

    // Detect React.memo wrapping
    let beforeFunctionComponents = 0;
    let afterMemoComponents = 0;

    // Count function components in before AST
    traverse(beforeAST, {
      FunctionDeclaration: (path) => {
        if (this.isReactComponent(path)) {
          beforeFunctionComponents++;
        }
      },
    });

    // Count React.memo wrapped components in after AST
    traverse(afterAST, {
      CallExpression: (path) => {
        if (this.isReactMemoCall(path)) {
          afterMemoComponents++;
        }
      },
    });

    if (beforeFunctionComponents > 0 && afterMemoComponents > 0) {
      patterns.push({
        pattern: "(function\\s+\\w+\\s*\\([^)]*\\)\\s*{[\\s\\S]*?})",
        replacement: "React.memo($1)",
        confidence: 0.7,
        frequency: 1,
        successRate: 1.0,
        sourceLayer: 6,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: "Wrap function component with React.memo",
        type: "ast",
        astMetadata: {
          nodeType: "FunctionDeclaration",
          targetProperty: "id.name",
          contextRequirements: ["JSXElement"],
          transformationType: "wrap",
        },
      });
    }

    return patterns;
  }

  // Helper methods for AST analysis
  private isMapCallReturningJSX(path: any): boolean {
    return (
      t.isMemberExpression(path.node.callee) &&
      t.isIdentifier(path.node.callee.property, { name: "map" }) &&
      path.node.arguments.length > 0 &&
      this.callbackReturnsJSX(path.node.arguments[0])
    );
  }

  private callbackReturnsJSX(callback: t.Node): boolean {
    if (
      t.isArrowFunctionExpression(callback) ||
      t.isFunctionExpression(callback)
    ) {
      if (t.isJSXElement(callback.body) || t.isJSXFragment(callback.body)) {
        return true;
      }
      // Check block statements for return statements with JSX
      if (t.isBlockStatement(callback.body)) {
        for (const stmt of callback.body.body) {
          if (
            t.isReturnStatement(stmt) &&
            (t.isJSXElement(stmt.argument) || t.isJSXFragment(stmt.argument))
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private hasKeyPropInJSX(path: any): boolean {
    const callback = path.node.arguments[0];
    if (!callback) return false;

    let hasKey = false;
    const callbackAST = t.isBlockStatement(callback.body)
      ? callback.body
      : t.program([t.expressionStatement(callback.body)]);

    traverse(
      t.program([callbackAST]),
      {
        JSXAttribute: (jsxPath) => {
          if (t.isJSXIdentifier(jsxPath.node.name, { name: "key" })) {
            hasKey = true;
          }
        },
      },
      path.scope,
    );

    return hasKey;
  }

  private isBrowserAPI(path: any): boolean {
    return (
      t.isIdentifier(path.node.object, { name: "localStorage" }) ||
      t.isIdentifier(path.node.object, { name: "sessionStorage" }) ||
      t.isIdentifier(path.node.object, { name: "window" }) ||
      t.isIdentifier(path.node.object, { name: "document" })
    );
  }

  private isSSRGuarded(path: any): boolean {
    // Look for typeof window !== "undefined" guard
    let parent = path.parent;
    while (parent) {
      if (t.isLogicalExpression(parent) && parent.operator === "&&") {
        const left = parent.left;
        if (
          t.isBinaryExpression(left) &&
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

  private hasUseClientDirective(ast: t.File): boolean {
    return (
      ast.program.directives?.some(
        (directive) => directive.value.value === "use client",
      ) || false
    );
  }

  private isReactComponent(path: any): boolean {
    // Check if function returns JSX
    if (t.isFunctionDeclaration(path.node)) {
      let returnsJSX = false;
      traverse(path.node, {
        ReturnStatement: (returnPath) => {
          if (
            t.isJSXElement(returnPath.node.argument) ||
            t.isJSXFragment(returnPath.node.argument)
          ) {
            returnsJSX = true;
          }
        },
      });
      return returnsJSX;
    }
    return false;
  }

  private isReactMemoCall(path: any): boolean {
    return (
      t.isCallExpression(path.node) &&
      t.isMemberExpression(path.node.callee) &&
      t.isIdentifier(path.node.callee.object, { name: "React" }) &&
      t.isIdentifier(path.node.callee.property, { name: "memo" })
    );
  }

  /**
   * Create pattern from line differences
   */
  private createPatternFromLines(
    beforeLine: string,
    afterLine: string,
    sourceLayer: number,
  ): Omit<LearnedRule, "id" | "examples"> | null {
    // Layer-specific pattern recognition
    switch (sourceLayer) {
      case 5: // Next.js App Router Fixes
        if (
          beforeLine.includes("import") &&
          afterLine.includes("React") &&
          !beforeLine.includes("React")
        ) {
          return {
            pattern: "import\\s*{([^}]*)}\\s*from\\s*['\"]react['\"]",
            replacement: "import { React, $1 } from 'react'",
            confidence: 0.75,
            frequency: 1,
            successRate: 1.0,
            sourceLayer,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            description: "Add React to import statement",
          };
        }
        break;

      case 6: // Testing and Validation
        if (
          beforeLine.includes("function") &&
          afterLine.includes("React.memo") &&
          !beforeLine.includes("React.memo")
        ) {
          return {
            pattern: "(function\\s+\\w+\\s*\\([^)]*\\)\\s*{)",
            replacement: "React.memo($1",
            confidence: 0.7,
            frequency: 1,
            successRate: 1.0,
            sourceLayer,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            description: "Wrap function with React.memo",
          };
        }
        if (
          beforeLine.includes("<") &&
          afterLine.includes("aria-") &&
          !beforeLine.includes("aria-")
        ) {
          return {
            pattern: "<(\\w+)([^>]*?)>",
            replacement: '<$1$2 aria-label="accessible-element">',
            confidence: 0.7,
            frequency: 1,
            successRate: 1.0,
            sourceLayer,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            description: "Add accessibility attributes",
          };
        }
        break;

      case 3: // Components
        if (
          beforeLine.includes(".map(") &&
          afterLine.includes("key=") &&
          !beforeLine.includes("key=")
        ) {
          return {
            pattern: "\\.map\\s*\\(\\s*([^)]+)\\s*=>\\s*<([^>]+)>",
            replacement: ".map($1 => <$2 key={$1.id || Math.random()}>",
            confidence: 0.8,
            frequency: 1,
            successRate: 1.0,
            sourceLayer,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            description: "Add key prop to mapped elements",
          };
        }
        break;

      case 4: // Hydration
        if (
          beforeLine.includes("localStorage") &&
          afterLine.includes("typeof window") &&
          !beforeLine.includes("typeof window")
        ) {
          return {
            pattern: "localStorage\\.",
            replacement: 'typeof window !== "undefined" && localStorage.',
            confidence: 0.8,
            frequency: 1,
            successRate: 1.0,
            sourceLayer,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            description: "Add SSR guard for localStorage",
          };
        }
        break;
    }

    // Generic pattern for simple replacements
    if (this.isSimpleReplacement(beforeLine, afterLine)) {
      const escapedBefore = beforeLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return {
        pattern: escapedBefore,
        replacement: afterLine,
        confidence: 0.6,
        frequency: 1,
        successRate: 1.0,
        sourceLayer,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: `Generic replacement from Layer ${sourceLayer}`,
      };
    }

    return null;
  }

  /**
   * Check if this is a simple string replacement
   */
  private isSimpleReplacement(before: string, after: string): boolean {
    // Avoid learning very long lines or complex patterns
    return (
      before.length < 100 &&
      after.length < 150 &&
      !before.includes("{") &&
      !before.includes("(") &&
      before.trim().length > 5
    );
  }

  /**
   * Apply learned rules to code
   */
  public async applyLearnedRules(code: string): Promise<PatternLearningResult> {
    if (!this.isInitialized) {
      this.loadRules();
    }

    const startTime = Date.now();
    let transformedCode = code;
    const appliedRules: string[] = [];

    // Get high-confidence rules, sorted by confidence * frequency
    const applicableRules = this.rules
      .filter((r) => r.confidence >= PatternLearner.MIN_CONFIDENCE)
      .sort((a, b) => b.confidence * b.frequency - a.confidence * a.frequency);

    for (const rule of applicableRules) {
      try {
        const regex = new RegExp(rule.pattern, "gm");
        const beforeTransform = transformedCode;

        transformedCode = transformedCode.replace(regex, rule.replacement);

        if (beforeTransform !== transformedCode) {
          appliedRules.push(rule.description);

          // Update rule statistics
          rule.lastUsed = Date.now();
          rule.successRate =
            (rule.successRate * rule.frequency + 1) / (rule.frequency + 1);

          console.log(`✨ Applied learned rule: ${rule.description}`);
        }
      } catch (error) {
        console.warn(`Failed to apply rule "${rule.description}":`, error);
        // Decrease confidence for failed rules
        rule.confidence = Math.max(0.1, rule.confidence - 0.1);
      }
    }

    // Save updated statistics
    if (appliedRules.length > 0) {
      this.saveRules();
    }

    const executionTime = Date.now() - startTime;

    return {
      appliedRules,
      transformedCode,
      ruleCount: appliedRules.length,
      executionTime,
    };
  }

  /**
   * Get all learned rules for inspection
   */
  public getRules(): LearnedRule[] {
    return [...this.rules];
  }

  /**
   * Clear all learned rules
   */
  public clearRules(): void {
    this.rules = [];
    localStorage.removeItem(PatternLearner.STORAGE_KEY);
    console.log("🧹 Cleared all learned patterns");
  }

  /**
   * Get learning statistics
   */
  public getStatistics(): {
    totalRules: number;
    averageConfidence: number;
    totalApplications: number;
    rulesByLayer: Record<number, number>;
  } {
    const totalRules = this.rules.length;
    const averageConfidence =
      totalRules > 0
        ? this.rules.reduce((sum, r) => sum + r.confidence, 0) / totalRules
        : 0;
    const totalApplications = this.rules.reduce(
      (sum, r) => sum + r.frequency,
      0,
    );

    const rulesByLayer = this.rules.reduce(
      (acc, rule) => {
        acc[rule.sourceLayer] = (acc[rule.sourceLayer] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return {
      totalRules,
      averageConfidence,
      totalApplications,
      rulesByLayer,
    };
  }

  /**
   * Generate unique rule ID
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export rules for backup
   */
  public exportRules(): string {
    return JSON.stringify(this.rules, null, 2);
  }

  /**
   * Import rules from backup
   */
  public importRules(rulesJson: string): boolean {
    try {
      const imported = JSON.parse(rulesJson);
      if (Array.isArray(imported)) {
        this.rules = imported;
        this.saveRules();
        console.log(`📥 Imported ${imported.length} learned patterns`);
        return true;
      }
    } catch (error) {
      console.error("Failed to import rules:", error);
    }
    return false;
  }
}

// Singleton instance
export const patternLearner = new PatternLearner();
