
import { logger } from './logger';

interface LearnedRule {
  id: string;
  pattern: RegExp | string;
  replacement: string;
  confidence: number;
  usageCount: number;
  successRate: number;
  layerId: number;
  description: string;
  createdAt: Date;
}

interface PatternStatistics {
  totalRules: number;
  activeRules: number;
  averageConfidence: number;
  totalApplications: number;
  successfulApplications: number;
  overallSuccessRate: number;
}

export class PatternLearner {
  private rules: Map<string, LearnedRule> = new Map();
  private maxRules = 1000;
  private minConfidence = 0.7;
  private learningEnabled = true;

  learn(code: string, transformedCode: string, layerId: number, improvements: string[]): void {
    if (!this.learningEnabled || code === transformedCode) {
      return;
    }

    try {
      const patterns = this.extractPatterns(code, transformedCode, layerId, improvements);
      patterns.forEach(pattern => this.addOrUpdateRule(pattern));
      
      logger.log(`Learned ${patterns.length} new patterns from layer ${layerId}`);
    } catch (error) {
      logger.error('Pattern learning failed:', error);
    }
  }

  private extractPatterns(code: string, transformedCode: string, layerId: number, improvements: string[]): LearnedRule[] {
    const patterns: LearnedRule[] = [];
    
    // Extract simple replacement patterns
    const lines = code.split('\n');
    const transformedLines = transformedCode.split('\n');
    
    for (let i = 0; i < Math.min(lines.length, transformedLines.length); i++) {
      const original = lines[i].trim();
      const transformed = transformedLines[i].trim();
      
      if (original !== transformed && original.length > 0 && transformed.length > 0) {
        const pattern: LearnedRule = {
          id: `pattern_${layerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pattern: this.escapeRegExp(original),
          replacement: transformed,
          confidence: 0.8,
          usageCount: 1,
          successRate: 1.0,
          layerId,
          description: `Auto-learned pattern from layer ${layerId}`,
          createdAt: new Date()
        };
        
        patterns.push(pattern);
      }
    }

    // Learn from specific improvements
    improvements.forEach(improvement => {
      if (improvement.includes('HTML entity')) {
        patterns.push({
          id: `html_entity_${Date.now()}`,
          pattern: /&quot;/g,
          replacement: '"',
          confidence: 0.95,
          usageCount: 1,
          successRate: 1.0,
          layerId,
          description: 'HTML entity quote fix',
          createdAt: new Date()
        });
      }
    });

    return patterns;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private addOrUpdateRule(pattern: LearnedRule): void {
    const existingRule = this.rules.get(pattern.id);
    
    if (existingRule) {
      // Update existing rule
      existingRule.usageCount++;
      existingRule.confidence = Math.min(0.99, existingRule.confidence + 0.01);
    } else {
      // Add new rule if under limit
      if (this.rules.size < this.maxRules) {
        this.rules.set(pattern.id, pattern);
      } else {
        this.cleanupLowConfidenceRules();
        this.rules.set(pattern.id, pattern);
      }
    }
  }

  getRecommendations(code: string): LearnedRule[] {
    const recommendations: LearnedRule[] = [];
    
    for (const rule of this.rules.values()) {
      if (rule.confidence >= this.minConfidence) {
        try {
          if (rule.pattern instanceof RegExp) {
            if (rule.pattern.test(code)) {
              recommendations.push(rule);
            }
          } else if (typeof rule.pattern === 'string') {
            if (code.includes(rule.pattern)) {
              recommendations.push(rule);
            }
          }
        } catch (error) {
          logger.error('Error testing pattern:', error);
        }
      }
    }
    
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  getStatistics(): PatternStatistics {
    const rules = Array.from(this.rules.values());
    const activeRules = rules.filter(r => r.confidence >= this.minConfidence);
    
    const totalApplications = rules.reduce((sum, r) => sum + r.usageCount, 0);
    const successfulApplications = rules.reduce((sum, r) => sum + (r.usageCount * r.successRate), 0);
    
    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      averageConfidence: activeRules.length > 0 ? 
        activeRules.reduce((sum, r) => sum + r.confidence, 0) / activeRules.length : 0,
      totalApplications,
      successfulApplications: Math.round(successfulApplications),
      overallSuccessRate: totalApplications > 0 ? successfulApplications / totalApplications : 0
    };
  }

  clearRules(): void {
    this.rules.clear();
    logger.log('Pattern learner rules cleared');
  }

  getLearnedRules(): LearnedRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.confidence >= this.minConfidence)
      .sort((a, b) => b.confidence - a.confidence);
  }

  private cleanupLowConfidenceRules(): void {
    const lowConfidenceRules = Array.from(this.rules.entries())
      .filter(([_, rule]) => rule.confidence < this.minConfidence)
      .sort(([_, a], [__, b]) => a.confidence - b.confidence);
    
    // Remove bottom 10% of low confidence rules
    const toRemove = Math.max(1, Math.floor(lowConfidenceRules.length * 0.1));
    for (let i = 0; i < toRemove && i < lowConfidenceRules.length; i++) {
      this.rules.delete(lowConfidenceRules[i][0]);
    }
  }

  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
    logger.log(`Pattern learning ${enabled ? 'enabled' : 'disabled'}`);
  }

  exportRules(): string {
    return JSON.stringify(Array.from(this.rules.entries()), null, 2);
  }

  importRules(rulesJson: string): void {
    try {
      const importedRules = JSON.parse(rulesJson);
      this.rules = new Map(importedRules);
      logger.log(`Imported ${this.rules.size} rules`);
    } catch (error) {
      logger.error('Failed to import rules:', error);
    }
  }
}

export const patternLearner = new PatternLearner();
