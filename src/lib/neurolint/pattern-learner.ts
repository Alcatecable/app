import { LearnedPattern } from "./types";
import { logger } from "./logger";

/**
 * Component for dynamically learning and applying code transformation patterns
 * Integrates with the orchestrator to improve future transformations
 */
export class PatternLearner {
  private learnedPatterns: LearnedPattern[] = [];

  constructor() {
    // Load existing patterns from storage or database
    this.loadPatterns();
  }

  private async loadPatterns(): Promise<void> {
    // Load patterns from a database or storage
    this.learnedPatterns = [];
  }

  learnFromTransformation(before: string, after: string, layerId: number): void {
    logger.info(`Learning from transformation in layer ${layerId}`, {
      layerId,
      changeCount: Math.abs(before.length - after.length)
    });

    const pattern = this.analyzePattern(before, after);
    if (pattern) {
      this.learnedPatterns.push(pattern);
      this.savePattern(pattern);
    }
  }

  private async savePattern(pattern: LearnedPattern): Promise<void> {
    // Save the pattern to a database or storage
  }

  getLearnedPatterns(): LearnedPattern[] {
    return this.learnedPatterns;
  }

  applyLearnedPatterns(code: string, layerId: number): string {
    let transformedCode = code;
    for (const pattern of this.learnedPatterns) {
      try {
        // Apply the pattern using a regular expression
        const regex = new RegExp(pattern.pattern, "g");
        transformedCode = transformedCode.replace(regex, pattern.replacement);
      } catch (error) {
        // Handle errors in pattern application
        console.error(`Error applying pattern ${pattern.id}:`, error);
      }
    }
    return transformedCode;
  }

  private analyzePattern(before: string, after: string): LearnedPattern | null {
    logger.info('Analyzing transformation pattern', {
      layerId: 0,
      changeCount: Math.abs(before.length - after.length)
    });

    const differences = this.findDifferences(before, after);
    if (differences.length === 0) {
      return null;
    }

    const pattern = this.createPattern(before, after, differences);

    logger.info('Pattern analysis completed', {
      layerId: 0,
      changeCount: differences.length
    });

    if (!pattern) {
      return null;
    }

    logger.info(`New pattern learned: ${pattern.id}`, {
      layerId: 0,
      changeCount: 1
    });

    return pattern;
  }

  private findDifferences(before: string, after: string): { start: number; end: number }[] {
    const differences: { start: number; end: number }[] = [];
    let start = -1;

    for (let i = 0; i < Math.min(before.length, after.length); i++) {
      if (before[i] !== after[i]) {
        if (start === -1) {
          start = i;
        }
      } else if (start !== -1) {
        differences.push({ start, end: i });
        start = -1;
      }
    }

    if (start !== -1) {
      differences.push({ start, end: Math.max(before.length, after.length) });
    }

    return differences;
  }

  private createPattern(
    before: string,
    after: string,
    differences: { start: number; end: number }[],
  ): LearnedPattern | null {
    if (differences.length === 0) {
      return null;
    }

    const { start, end } = differences[0];
    const pattern = before.substring(start, end);
    const replacement = after.substring(start, end);

    if (!pattern || !replacement) {
      return null;
    }

    return {
      id: `pattern-${Date.now()}`,
      pattern: this.escapeRegExp(pattern),
      replacement: replacement,
      confidence: 0.8,
      usage: 0,
      category: "generic",
      description: `Learned pattern from code transformation`,
    };
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
}

export const patternLearner = new PatternLearner();
