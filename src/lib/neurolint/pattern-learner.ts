import { logger } from "./logger";
import { LogContext } from "./types";

export interface LearnedPattern {
  id: string;
  pattern: string | RegExp;
  replacement: string;
  confidence: number;
  successCount: number;
  failureCount: number;
  lastUsed: number;
  category: string;
  description: string;
}

export interface PatternStatistics {
  totalPatterns: number;
  successfulApplications: number;
  averageConfidence: number;
  recentlyLearned: number;
}

export interface PatternLearner {
  learnPattern(before: string, after: string, context?: LogContext): void;
  applyPatterns(code: string, context?: LogContext): string;
  getStatistics(): PatternStatistics;
  clearRules(): void;
}

class PatternLearnerImpl implements PatternLearner {
  private learnedPatterns: Map<string, LearnedPattern> = new Map();
  private patternIdCounter: number = 0;

  learnPattern(before: string, after: string, context?: LogContext): void {
    try {
      const newPattern = this.generatePatternFromExample(before, after);
      if (this.isPatternUnique(newPattern.pattern)) {
        this.learnedPatterns.set(newPattern.id, newPattern);
        logger.info(`New pattern learned: ${newPattern.description}`, { ...context, patternId: newPattern.id });
      } else {
        logger.debug(`Duplicate pattern not learned`, context);
      }
    } catch (error) {
      logger.error('Failed to learn pattern', { ...context, originalError: (error as Error).message });
    }
  }

  applyPatterns(code: string, context?: LogContext): string {
    let transformedCode = code;
    let changeCount = 0;

    this.learnedPatterns.forEach(pattern => {
      try {
        const regex = new RegExp(pattern.pattern, 'g');
        const originalCode = transformedCode;
        transformedCode = transformedCode.replace(regex, pattern.replacement);

        if (originalCode !== transformedCode) {
          pattern.successCount++;
          pattern.lastUsed = Date.now();
          changeCount++;
          this.updatePattern(pattern.id, pattern);
          logger.debug(`Pattern applied successfully: ${pattern.description}`, { ...context, patternId: pattern.id });
        }
      } catch (error) {
        pattern.failureCount++;
        logger.warn(`Pattern application failed: ${pattern.description}`, { ...context, patternId: pattern.id, originalError: (error as Error).message });
      }
    });

    if (changeCount > 0) {
      logger.info(`Applied ${changeCount} learned patterns`, { ...context, changeCount });
    }
    return transformedCode;
  }

  getStatistics(): PatternStatistics {
    const totalPatterns = this.learnedPatterns.size;
    const successfulApplications = Array.from(this.learnedPatterns.values())
      .reduce((sum, pattern) => sum + pattern.successCount, 0);
    
    return {
      totalPatterns,
      successfulApplications,
      averageConfidence: totalPatterns > 0 ? 
        Array.from(this.learnedPatterns.values())
          .reduce((sum, pattern) => sum + pattern.confidence, 0) / totalPatterns : 0,
      recentlyLearned: Array.from(this.learnedPatterns.values())
        .filter(pattern => Date.now() - pattern.lastUsed < 24 * 60 * 60 * 1000)
        .length
    };
  }

  clearRules(): void {
    this.learnedPatterns.clear();
    logger.info('Pattern learner rules cleared');
  }

  private isPatternUnique(pattern: string | RegExp): boolean {
    const patternString = pattern instanceof RegExp ? pattern.source : pattern;
    for (const existingPattern of this.learnedPatterns.values()) {
      const existingPatternString = existingPattern.pattern instanceof RegExp ? existingPattern.pattern.source : existingPattern.pattern;
      if (existingPatternString === patternString) {
        return false;
      }
    }
    return true;
  }

  private generatePatternId(): string {
    this.patternIdCounter++;
    return `pattern-${this.patternIdCounter}`;
  }

  private updatePattern(id: string, pattern: LearnedPattern): void {
    // Fix: Convert RegExp to string for storage
    const updatedPattern = {
      ...pattern,
      pattern: pattern.pattern instanceof RegExp ? pattern.pattern.source : pattern.pattern
    };
    this.learnedPatterns.set(id, updatedPattern);
  }

  private generatePatternFromExample(before: string, after: string): LearnedPattern {
    const diff = this.findDiff(before, after);
    if (!diff) {
      throw new Error('No significant difference found between before and after states.');
    }

    const { start, end, text } = diff;
    const pattern = before.substring(start, end);
    const replacement = text;
    const description = `Replace "${pattern}" with "${replacement}"`;

    // Basic regex escaping (improve as needed)
    const escapedPattern = pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const patternRegex = new RegExp(escapedPattern, 'g');

    // Fix: Ensure pattern is stored as string
    return {
      id: this.generatePatternId(),
      pattern: patternRegex.source, // Convert RegExp to string
      replacement: replacement,
      confidence: 0.8,
      successCount: 1,
      failureCount: 0,
      lastUsed: Date.now(),
      category: 'learned',
      description: `Learned pattern: ${description}`
    };
  }

  private findDiff(before: string, after: string): { start: number; end: number; text: string } | null {
    let start = 0;
    while (start < before.length && start < after.length && before[start] === after[start]) {
      start++;
    }

    let endBefore = before.length;
    let endAfter = after.length;
    while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) {
      endBefore--;
      endAfter--;
    }

    if (start === before.length && start === after.length) {
      return null;
    }

    return {
      start: start,
      end: endBefore,
      text: after.substring(start, endAfter)
    };
  }
}

// Export both the class and instance for backward compatibility
export const PatternLearner = PatternLearnerImpl;
export const patternLearner = new PatternLearnerImpl();
export default patternLearner;
