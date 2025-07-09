
import { LearnedPattern, PatternRule, TransformationExample } from "../types";
import { logger } from "../logger";
import { patternStorage } from "../pattern-storage";

/**
 * Advanced pattern learning system with ML-inspired techniques
 */
export class AdvancedPatternLearner {
  private patterns: Map<string, LearnedPattern> = new Map();
  private transformationHistory: TransformationExample[] = [];
  private patternConfidenceThreshold = 0.7;
  private maxPatterns = 1000;
  private initialized = false;

  /**
   * Initialize the pattern learner and load existing patterns
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storedPatterns = await patternStorage.loadPatterns();
      
      // Convert stored patterns to internal format
      for (const pattern of storedPatterns) {
        const patternKey = `${pattern.category}_${pattern.id}`;
        
        // Adapt stored pattern to internal format
        const internalPattern = {
          id: pattern.id,
          pattern: pattern.pattern,
          replacement: pattern.replacement,
          confidence: pattern.confidence,
          usage: pattern.usage,
          category: pattern.category,
          description: pattern.description || '',
        };
        
        this.patterns.set(patternKey, internalPattern);
      }

      logger.info('Pattern learner initialized', {
        layerId: 7,
        metadata: { loadedPatterns: storedPatterns.length }
      });
      
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize pattern learner', error instanceof Error ? error : new Error(String(error)));
      this.initialized = true; // Continue without stored patterns
    }
  }

  /**
   * Save current patterns to persistent storage
   */
  private async persistPatterns(): Promise<void> {
    try {
      const patterns = Array.from(this.patterns.values()).map(pattern => ({
        id: pattern.id,
        pattern: pattern.pattern,
        replacement: pattern.replacement,
        confidence: pattern.confidence,
        usage: pattern.usage || 1,
        category: pattern.category || 'learned',
        description: pattern.description || '',
      }));

      await patternStorage.savePatterns(patterns);
      
      logger.debug('Patterns persisted successfully', {
        layerId: 7,
        metadata: { patternCount: patterns.length }
      });
    } catch (error) {
      logger.error('Failed to persist patterns', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Learn from successful transformations using pattern recognition
   */
  async learnFromTransformation(
    before: string,
    after: string,
    layerId: number,
    context?: { filePath?: string; projectType?: string }
  ): Promise<void> {
    await this.initialize();
    
    const example: TransformationExample = {
      id: this.generateId(),
      before,
      after,
      layerId,
      timestamp: Date.now(),
      context,
      patterns: this.extractPatterns(before, after),
    };

    this.transformationHistory.push(example);
    
    // Analyze patterns and update learned rules
    await this.analyzeAndUpdatePatterns(example);
    
    // Cleanup old patterns if we exceed the limit
    this.cleanupPatterns();
    
    // Persist changes
    await this.persistPatterns();
    
    logger.debug("Pattern learning updated", {
      exampleId: example.id,
      layerId,
      patternsExtracted: example.patterns.length,
      totalPatterns: this.patterns.size,
    });
  }

  /**
   * Apply learned patterns to new code
   */
  async applyLearnedRules(code: string): Promise<{
    transformedCode: string;
    appliedRules: string[];
    ruleCount: number;
    executionTime: number;
  }> {
    await this.initialize();
    
    const startTime = Date.now();
    let transformedCode = code;
    const appliedRules: string[] = [];

    // Sort patterns by confidence and usage
    const sortedPatterns = Array.from(this.patterns.values())
      .filter(p => p.confidence >= this.patternConfidenceThreshold)
      .sort((a, b) => (b.confidence * (b.usage || 1)) - (a.confidence * (a.usage || 1)));

    for (const pattern of sortedPatterns) {
      const previousCode = transformedCode;
      transformedCode = this.applyPattern(transformedCode, pattern);
      
      if (transformedCode !== previousCode) {
        appliedRules.push(pattern.name);
        pattern.successfulApplications++;
        
        // Update confidence based on successful application
        this.updatePatternConfidence(pattern, true);
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      transformedCode,
      appliedRules,
      ruleCount: appliedRules.length,
      executionTime,
    };
  }

  /**
   * Extract meaningful patterns from before/after transformation
   */
  private extractPatterns(before: string, after: string): PatternRule[] {
    const patterns: PatternRule[] = [];

    // Extract regex-based patterns
    const regexPatterns = this.extractRegexPatterns(before, after);
    patterns.push(...regexPatterns);

    // Extract structural patterns
    const structuralPatterns = this.extractStructuralPatterns(before, after);
    patterns.push(...structuralPatterns);

    // Extract context-aware patterns
    const contextPatterns = this.extractContextPatterns(before, after);
    patterns.push(...contextPatterns);

    return patterns;
  }

  /**
   * Extract regex-based transformation patterns
   */
  private extractRegexPatterns(before: string, after: string): PatternRule[] {
    const patterns: PatternRule[] = [];

    // Common transformation patterns
    const transformations = [
      {
        type: 'html-entity-conversion',
        beforeRegex: /&quot;/g,
        afterPattern: '"',
        description: 'Convert HTML quote entities to regular quotes'
      },
      {
        type: 'missing-key-props',
        beforeRegex: /\.map\s*\(\s*([^)]+)\s*=>\s*<([^>]+)>/g,
        afterPattern: '.map($1 => <$2 key={$1.id || Math.random()}>',
        description: 'Add missing key props to mapped elements'
      },
      {
        type: 'ssr-guards',
        beforeRegex: /(localStorage\.[a-zA-Z]+)/g,
        afterPattern: 'typeof window !== "undefined" && $1',
        description: 'Add SSR guards to browser APIs'
      },
    ];

    for (const transform of transformations) {
      if (transform.beforeRegex.test(before) && after.includes(transform.afterPattern.replace(/\$\d+/g, ''))) {
        patterns.push({
          type: 'regex',
          name: transform.type,
          description: transform.description,
          pattern: transform.beforeRegex,
          replacement: transform.afterPattern,
          confidence: 0.8,
        });
      }
    }

    return patterns;
  }

  /**
   * Extract structural code patterns
   */
  private extractStructuralPatterns(before: string, after: string): PatternRule[] {
    const patterns: PatternRule[] = [];

    // React component patterns
    if (this.isReactComponent(before) && this.isReactComponent(after)) {
      if (!before.includes("'use client'") && after.includes("'use client'")) {
        patterns.push({
          type: 'structural',
          name: 'add-use-client-directive',
          description: 'Add "use client" directive to React components',
          pattern: /^(?!.*'use client')/,
          replacement: "'use client';\n",
          confidence: 0.9,
        });
      }

      if (!before.includes('React.memo') && after.includes('React.memo')) {
        patterns.push({
          type: 'structural',
          name: 'add-react-memo',
          description: 'Wrap components with React.memo for performance',
          pattern: /(function\s+\w+\s*\([^)]*\)\s*{[^}]*return\s*\()/,
          replacement: 'React.memo($1',
          confidence: 0.7,
        });
      }
    }

    return patterns;
  }

  /**
   * Extract context-aware patterns based on file type, imports, etc.
   */
  private extractContextPatterns(before: string, after: string): PatternRule[] {
    const patterns: PatternRule[] = [];

    // Import optimization patterns
    const beforeImports = this.extractImports(before);
    const afterImports = this.extractImports(after);

    if (beforeImports.length !== afterImports.length) {
      const addedImports = afterImports.filter(imp => !beforeImports.includes(imp));
      const removedImports = beforeImports.filter(imp => !afterImports.includes(imp));

      if (addedImports.length > 0) {
        patterns.push({
          type: 'context',
          name: 'import-optimization',
          description: `Add missing imports: ${addedImports.join(', ')}`,
          pattern: /^/,
          replacement: addedImports.join('\n') + '\n',
          confidence: 0.6,
        });
      }
    }

    return patterns;
  }

  /**
   * Analyze transformation example and update pattern database
   */
  private async analyzeAndUpdatePatterns(example: TransformationExample): Promise<void> {
    for (const patternRule of example.patterns) {
      const patternKey = this.generatePatternKey(patternRule);
      
      if (this.patterns.has(patternKey)) {
        // Update existing pattern
        const existingPattern = this.patterns.get(patternKey)!;
        existingPattern.frequency++;
        existingPattern.lastSeen = Date.now();
        existingPattern.examples.push(example.id);
        
        // Update confidence based on consistency
        this.updatePatternConfidence(existingPattern, true);
      } else {
        // Create new pattern
        const newPattern: LearnedPattern = {
          id: this.generateId(),
          name: patternRule.name,
          type: patternRule.type,
          description: patternRule.description,
          pattern: patternRule.pattern,
          replacement: patternRule.replacement,
          confidence: patternRule.confidence,
          frequency: 1,
          successfulApplications: 0,
          failedApplications: 0,
          layerId: example.layerId,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          examples: [example.id],
          context: example.context,
        };
        
        this.patterns.set(patternKey, newPattern);
      }
    }
  }

  /**
   * Apply a learned pattern to code
   */
  private applyPattern(code: string, pattern: LearnedPattern): string {
    try {
      if (pattern.pattern instanceof RegExp) {
        return code.replace(pattern.pattern, pattern.replacement as string);
      } else if (typeof pattern.pattern === 'string') {
        const regex = new RegExp(pattern.pattern, 'g');
        return code.replace(regex, pattern.replacement as string);
      }
      return code;
    } catch (error) {
      logger.warn("Pattern application failed", {
        patternId: pattern.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      pattern.failedApplications++;
      this.updatePatternConfidence(pattern, false);
      return code;
    }
  }

  /**
   * Update pattern confidence based on success/failure
   */
  private updatePatternConfidence(pattern: LearnedPattern, success: boolean): void {
    const totalApplications = pattern.successfulApplications + pattern.failedApplications;
    
    if (totalApplications > 0) {
      pattern.confidence = pattern.successfulApplications / totalApplications;
    }
    
    // Boost confidence for frequently successful patterns
    if (pattern.successfulApplications > 10 && pattern.confidence > 0.8) {
      pattern.confidence = Math.min(0.95, pattern.confidence + 0.05);
    }
  }

  /**
   * Clean up old or low-confidence patterns
   */
  private cleanupPatterns(): void {
    if (this.patterns.size <= this.maxPatterns) return;

    const patternsArray = Array.from(this.patterns.entries());
    
    // Sort by confidence and frequency (ascending)
    patternsArray.sort(([, a], [, b]) => {
      const scoreA = a.confidence * a.frequency;
      const scoreB = b.confidence * b.frequency;
      return scoreA - scoreB;
    });

    // Remove bottom 10% of patterns
    const toRemove = Math.floor(patternsArray.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.patterns.delete(patternsArray[i][0]);
    }

    logger.info("Pattern cleanup completed", {
      removedPatterns: toRemove,
      remainingPatterns: this.patterns.size,
    });
  }

  /**
   * Get all learned patterns for inspection
   */
  getLearnedRules(): LearnedPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => (b.confidence * b.frequency) - (a.confidence * a.frequency));
  }

  /**
   * Get pattern statistics
   */
  getPatternStatistics(): {
    totalPatterns: number;
    highConfidencePatterns: number;
    averageConfidence: number;
    totalTransformations: number;
    patternsByLayer: Record<number, number>;
  } {
    const patterns = Array.from(this.patterns.values());
    const highConfidencePatterns = patterns.filter(p => p.confidence >= this.patternConfidenceThreshold);
    const averageConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    
    const patternsByLayer = patterns.reduce((acc, pattern) => {
      acc[pattern.layerId] = (acc[pattern.layerId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalPatterns: patterns.length,
      highConfidencePatterns: highConfidencePatterns.length,
      averageConfidence: averageConfidence || 0,
      totalTransformations: this.transformationHistory.length,
      patternsByLayer,
    };
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternKey(rule: PatternRule): string {
    return `${rule.type}_${rule.name}_${rule.pattern.toString()}`;
  }

  private isReactComponent(code: string): boolean {
    return /import.*React|function.*\w+.*{.*return.*<|const.*=.*=>.*</.test(code);
  }

  private extractImports(code: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"]/g;
    return code.match(importRegex) || [];
  }
}
