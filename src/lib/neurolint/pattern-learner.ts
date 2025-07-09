import { LearnedPattern, PatternRule, TransformationExample } from "./types";
import { logger } from "./logger";
import { metrics } from "./metrics";

/**
 * Advanced pattern learning system for NeuroLint Layer 7
 * Learns from successful transformations and applies patterns intelligently
 */
class PatternLearner {
  private learnedRules: Map<string, LearnedRule> = new Map();
  private transformationExamples: TransformationExample[] = [];
  private maxRules = 1000;
  private maxExamples = 500;
  private minConfidence = 0.3;
  private learningEnabled = true;

  constructor() {
    this.initializeDefaultPatterns();
  }

  /**
   * Learn from a successful transformation
   */
  async learnFromTransformation(
    before: string,
    after: string,
    layerId: number,
  ): Promise<void> {
    if (!this.learningEnabled) return;

    try {
      const example: TransformationExample = {
        id: this.generateId(),
        before,
        after,
        layerId,
        timestamp: Date.now(),
        patterns: [],
      };

      // Store the example
      this.addTransformationExample(example);

      // Extract patterns from the transformation
      const patterns = await this.extractPatterns(before, after, layerId);

      // Learn each pattern
      for (const pattern of patterns) {
        await this.learnPattern(pattern, layerId);
      }

      // Clean up old data if needed
      this.cleanup();

      logger.debug("Pattern learning completed", {
        metadata: {
          layerId,
          patternsLearned: patterns.length,
          totalRules: this.learnedRules.size,
        },
      });
    } catch (error) {
      logger.error(
        "Pattern learning failed",
        error instanceof Error ? error : new Error("Unknown error"),
        { metadata: { layerId } },
      );
    }
  }

  /**
   * Apply learned rules to new code
   */
  async applyLearnedRules(code: string): Promise<{
    transformedCode: string;
    appliedRules: string[];
    ruleCount: number;
    executionTime: number;
  }> {
    const startTime = Date.now();
    let transformedCode = code;
    const appliedRules: string[] = [];

    try {
      // Get high-confidence rules sorted by success rate
      const applicableRules = Array.from(this.learnedRules.values())
        .filter((rule) => rule.confidence >= this.minConfidence)
        .sort((a, b) => b.successRate - a.successRate);

      for (const rule of applicableRules) {
        try {
          const beforeTransform = transformedCode;
          transformedCode = await this.applyRule(transformedCode, rule);

          if (transformedCode !== beforeTransform) {
            appliedRules.push(rule.description);
            this.updateRuleStatistics(rule.id, true);
          }
        } catch (error) {
          this.updateRuleStatistics(rule.id, false);
        }
      }

      const executionTime = Date.now() - startTime;

      return {
        transformedCode,
        appliedRules,
        ruleCount: appliedRules.length,
        executionTime,
      };
    } catch (error) {
      logger.error(
        "Rule application failed",
        error instanceof Error ? error : new Error("Unknown error"),
      );

      return {
        transformedCode: code,
        appliedRules: [],
        ruleCount: 0,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get learned rules (backward compatibility)
   */
  getRules(): LearnedRule[] {
    return Array.from(this.learnedRules.values());
  }

  /**
   * Get learned rules (alternative method name)
   */
  getLearnedRules(): LearnedRule[] {
    return this.getRules();
  }

  /**
   * Extract patterns from a transformation
   */
  private async extractPatterns(
    before: string,
    after: string,
    layerId: number,
  ): Promise<PatternRule[]> {
    const patterns: PatternRule[] = [];

    // Simple diff-based pattern extraction
    const beforeLines = before.split("\n");
    const afterLines = after.split("\n");

    // Find line-by-line changes
    for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i++) {
      const beforeLine = beforeLines[i] || "";
      const afterLine = afterLines[i] || "";

      if (beforeLine !== afterLine && beforeLine.trim() && afterLine.trim()) {
        // Create a pattern for this specific transformation
        const pattern = this.createPatternFromLines(
          beforeLine,
          afterLine,
          layerId,
        );
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  /**
   * Create a pattern from before/after lines
   */
  private createPatternFromLines(
    beforeLine: string,
    afterLine: string,
    layerId: number,
  ): PatternRule | null {
    try {
      // Escape special regex characters but preserve some patterns
      const escapedBefore = beforeLine
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\*/g, ".*") // Allow * as wildcard
        .replace(/\\\?/g, ".?"); // Allow ? as optional

      return {
        type: "regex",
        name: `Layer ${layerId} transformation`,
        description: `Transform "${beforeLine.trim()}" to "${afterLine.trim()}"`,
        pattern: new RegExp(escapedBefore, "gm"),
        replacement: afterLine,
        confidence: 0.5, // Start with medium confidence
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Learn a specific pattern
   */
  private async learnPattern(pattern: PatternRule, layerId: number): Promise<void> {
    const ruleId = this.generateRuleId(pattern, layerId);
    const existingRule = this.learnedRules.get(ruleId);

    if (existingRule) {
      // Update existing rule
      existingRule.frequency++;
      existingRule.lastUsed = Date.now();
      existingRule.confidence = Math.min(
        0.95,
        existingRule.confidence + 0.05,
      );
    } else {
      // Create new rule
      const newRule: LearnedRule = {
        id: ruleId,
        type: pattern.type,
        pattern: pattern.pattern.toString(),
        replacement: pattern.replacement as string,
        confidence: pattern.confidence,
        frequency: 1,
        successRate: 0.5,
        sourceLayer: layerId,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: pattern.description,
      };

      this.learnedRules.set(ruleId, newRule);
    }
  }

  /**
   * Apply a single rule to code
   */
  private async applyRule(code: string, rule: LearnedRule): Promise<string> {
    try {
      const regex = new RegExp(rule.pattern, "gm");
      return code.replace(regex, rule.replacement);
    } catch (error) {
      throw new Error(`Failed to apply rule ${rule.id}: ${error}`);
    }
  }

  /**
   * Update rule statistics after application
   */
  private updateRuleStatistics(ruleId: string, success: boolean): void {
    const rule = this.learnedRules.get(ruleId);
    if (!rule) return;

    rule.lastUsed = Date.now();

    if (success) {
      rule.successRate = Math.min(0.95, rule.successRate + 0.1);
      rule.confidence = Math.min(0.95, rule.confidence + 0.05);
    } else {
      rule.successRate = Math.max(0.05, rule.successRate - 0.05);
      rule.confidence = Math.max(0.1, rule.confidence - 0.02);
    }

    // Remove rules that consistently fail
    if (rule.successRate < 0.2 && rule.confidence < 0.3) {
      this.learnedRules.delete(ruleId);
    }
  }

  /**
   * Add transformation example
   */
  private addTransformationExample(example: TransformationExample): void {
    this.transformationExamples.push(example);

    // Keep only recent examples
    if (this.transformationExamples.length > this.maxExamples) {
      this.transformationExamples = this.transformationExamples
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxExamples);
    }
  }

  /**
   * Clean up old data
   */
  private cleanup(): void {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Remove old, low-confidence rules
    for (const [id, rule] of this.learnedRules.entries()) {
      if (
        rule.lastUsed < oneWeekAgo &&
        rule.confidence < 0.5 &&
        rule.frequency < 3
      ) {
        this.learnedRules.delete(id);
      }
    }

    // Limit total number of rules
    if (this.learnedRules.size > this.maxRules) {
      const sortedRules = Array.from(this.learnedRules.entries()).sort(
        ([, a], [, b]) => a.confidence * a.frequency - b.confidence * b.frequency,
      );

      // Keep only the best rules
      const toKeep = sortedRules.slice(-this.maxRules);
      this.learnedRules.clear();
      toKeep.forEach(([id, rule]) => this.learnedRules.set(id, rule));
    }
  }

  /**
   * Initialize some default patterns
   */
  private initializeDefaultPatterns(): void {
    const defaultPatterns = [
      {
        pattern: /\.map\s*\(\s*([^)]+)\s*=>\s*<([^>]+)(?!.*key=)/g,
        replacement: ".map($1 => <$2 key={$1.id || Math.random()}",
        confidence: 0.8,
        frequency: 10,
        successRate: 0.9,
        sourceLayer: 3,
        description: "Add missing key props to map operations",
      },
      {
        pattern: /localStorage\./g,
        replacement: 'typeof window !== "undefined" && localStorage.',
        confidence: 0.9,
        frequency: 8,
        successRate: 0.95,
        sourceLayer: 4,
        description: "Add SSR guards to localStorage usage",
      },
    ];

    defaultPatterns.forEach((pattern, index) => {
      const rule: LearnedRule = {
        id: `default_${index}`,
        type: "regex",
        pattern: pattern.pattern.toString(),
        replacement: pattern.replacement,
        confidence: pattern.confidence,
        frequency: pattern.frequency,
        successRate: pattern.successRate,
        sourceLayer: pattern.sourceLayer,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        description: pattern.description,
      };

      this.learnedRules.set(rule.id, rule);
    });
  }

  /**
   * Initialize layer-specific patterns
   */
  private initializeLayerSpecificPatterns(): void {
    // Layer 5 - Next.js patterns
    this.addRule({
      pattern: /^(?!.*'use client')(.*(useState|useEffect|onClick).*)$/gm,
      replacement: "'use client';\n$1",
      confidence: 0.7,
      frequency: 5,
      successRate: 0.8,
      sourceLayer: 5,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      description: "Add 'use client' directive for client-side React features",
    });

    // Layer 6 - Testing and validation patterns
    this.addRule({
      pattern: /function\s+(\w+)\s*\([^)]*\)\s*{([^}]*return\s*\([^}]+)}/g,
      replacement: "const $1 = React.memo(function $1() {$2}});",
      confidence: 0.6,
      frequency: 3,
      successRate: 0.7,
      sourceLayer: 6,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      description: "Wrap components with React.memo for performance",
    });

    this.addRule({
      pattern: /<div(?![^>]*aria-)/g,
      replacement: '<div aria-label="content"',
      confidence: 0.5,
      frequency: 4,
      successRate: 0.6,
      sourceLayer: 6,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      description: "Add accessibility attributes to div elements",
    });

    // Layer 3 - Component patterns
    this.addRule({
      pattern: /<img(?![^>]*alt=)/g,
      replacement: '<img alt=""',
      confidence: 0.8,
      frequency: 6,
      successRate: 0.85,
      sourceLayer: 3,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      description: "Add alt attributes to img elements",
    });

    // Layer 4 - More hydration patterns
    this.addRule({
      pattern: /document\./g,
      replacement: 'typeof document !== "undefined" && document.',
      confidence: 0.85,
      frequency: 4,
      successRate: 0.9,
      sourceLayer: 4,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      description: "Add SSR guards to document usage",
    });

    // General pattern for console removal
    this.addRule({
      pattern: /console\.log\([^)]*\);?\n?/g,
      replacement: "",
      confidence: 0.7,
      frequency: 8,
      successRate: 0.8,
      sourceLayer: 2,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      description: "Remove console.log statements",
    });
  }

  private addRule(ruleData: Omit<LearnedRule, "id" | "type">): void {
    const rule: LearnedRule = {
      id: this.generateId(),
      type: "regex",
      ...ruleData,
    };
    this.learnedRules.set(rule.id, rule);
  }

  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleId(pattern: PatternRule, layerId: number): string {
    const patternStr = pattern.pattern.toString();
    const hash = this.simpleHash(patternStr + layerId);
    return `rule_${layerId}_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

interface LearnedRule {
  id: string;
  type: 'regex' | 'structural' | 'context';
  pattern: string;
  replacement: string;
  confidence: number;
  frequency: number;
  successRate: number;
  sourceLayer: number;
  createdAt: number;
  lastUsed: number;
  description: string;
}

// Create singleton instance
export const patternLearner = new PatternLearner();
