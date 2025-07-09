import { LayerRecommendation, DetectedIssue, ImpactEstimate } from "./types";
import { patternLearner } from "./pattern-learner";

/**
 * Intelligent layer selection based on code analysis
 * Recommends optimal layer combinations for specific issues
 * Integrates with adaptive pattern learning for Layer 7 recommendations
 */
export class SmartLayerSelector {
  /**
   * Analyze code and suggest appropriate layers
   */
  static analyzeAndRecommend(
    code: string,
    filePath?: string,
  ): LayerRecommendation {
    const issues = this.detectIssues(code, filePath);
    const recommendations = this.generateRecommendations(issues);

    // Check for Layer 7 (Adaptive Pattern Learning) recommendations
    const layer7Recommendation = this.checkLayer7Recommendation(code);
    if (layer7Recommendation.shouldRecommend) {
      recommendations.layers.push(7);
      recommendations.reasons.push(layer7Recommendation.reason);
    }

    return {
      recommendedLayers: recommendations.layers,
      detectedIssues: issues,
      reasoning: recommendations.reasons,
      confidence: this.calculateConfidence(issues),
      estimatedImpact: this.estimateImpact(issues),
    };
  }

  /**
   * Detect specific issues in code that layers can fix
   */
  private static detectIssues(
    code: string,
    filePath?: string,
  ): DetectedIssue[] {
    const issues: DetectedIssue[] = [];

    // Layer 1: Configuration issues
    if (
      filePath &&
      (filePath.includes("tsconfig") || filePath.includes("next.config"))
    ) {
      if (
        code.includes('"target": "es5"') ||
        code.includes("reactStrictMode: false")
      ) {
        issues.push({
          type: "config",
          severity: "high",
          description: "Outdated configuration detected",
          fixedByLayer: 1,
          pattern: "Configuration modernization needed",
        });
      }
    }

    // Layer 2: Entity and pattern issues
    const entityPatterns = [
      { pattern: /&quot;/g, name: "HTML quote entities" },
      { pattern: /&amp;/g, name: "HTML ampersand entities" },
      { pattern: /&lt;|&gt;/g, name: "HTML bracket entities" },
      { pattern: /console\.log\(/g, name: "Console.log usage" },
      { pattern: /\bvar\s+/g, name: "Var declarations" },
    ];

    entityPatterns.forEach(({ pattern, name }) => {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: "pattern",
          severity: "medium",
          description: `${name} found (${matches.length} occurrences)`,
          fixedByLayer: 2,
          pattern: name,
          count: matches.length,
        });
      }
    });

    // Layer 3: Component issues
    if (this.isReactComponent(code)) {
      // Missing key props in map functions
      const mapWithoutKey = /\.map\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g;
      const mapMatches = code.match(mapWithoutKey);
      if (mapMatches) {
        issues.push({
          type: "component",
          severity: "high",
          description: `Missing key props in ${mapMatches.length} map operations`,
          fixedByLayer: 3,
          pattern: "Missing key props",
          count: mapMatches.length,
        });
      }

      // Missing React imports
      if (code.includes("useState") && !code.includes("import { useState")) {
        issues.push({
          type: "component",
          severity: "high",
          description: "Missing React hook imports",
          fixedByLayer: 3,
          pattern: "Missing imports",
        });
      }

      // Accessibility issues
      const imgWithoutAlt = /<img(?![^>]*alt=)[^>]*>/g;
      const imgMatches = code.match(imgWithoutAlt);
      if (imgMatches) {
        issues.push({
          type: "component",
          severity: "medium",
          description: `${imgMatches.length} images missing alt attributes`,
          fixedByLayer: 3,
          pattern: "Accessibility issues",
          count: imgMatches.length,
        });
      }
    }

    // Layer 4: Hydration issues
    if (code.includes("localStorage") && !code.includes("typeof window")) {
      const localStorageMatches = code.match(/localStorage\./g);
      issues.push({
        type: "hydration",
        severity: "high",
        description: `${localStorageMatches?.length || 1} unguarded localStorage usage`,
        fixedByLayer: 4,
        pattern: "SSR safety",
        count: localStorageMatches?.length || 1,
      });
    }

    return issues;
  }

  /**
   * Generate layer recommendations based on detected issues
   */
  private static generateRecommendations(issues: DetectedIssue[]): {
    layers: number[];
    reasons: string[];
  } {
    const layers = new Set<number>();
    const reasons: string[] = [];

    // Group issues by layer
    const issuesByLayer = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.fixedByLayer]) {
          acc[issue.fixedByLayer] = [];
        }
        acc[issue.fixedByLayer].push(issue);
        return acc;
      },
      {} as Record<number, DetectedIssue[]>,
    );

    // Always include layer 1 for foundation
    layers.add(1);
    reasons.push("Configuration layer provides essential foundation");

    // Add layers based on detected issues
    Object.entries(issuesByLayer).forEach(([layerId, layerIssues]) => {
      const id = parseInt(layerId);
      layers.add(id);

      const highSeverity = layerIssues.filter(
        (i) => i.severity === "high",
      ).length;
      const mediumSeverity = layerIssues.filter(
        (i) => i.severity === "medium",
      ).length;

      if (highSeverity > 0) {
        reasons.push(`Layer ${id}: ${highSeverity} critical issues detected`);
      }
      if (mediumSeverity > 0) {
        reasons.push(
          `Layer ${id}: ${mediumSeverity} medium priority issues detected`,
        );
      }
    });

    // Ensure dependency order
    const sortedLayers = Array.from(layers).sort((a, b) => a - b);

    return {
      layers: sortedLayers,
      reasons,
    };
  }

  private static isReactComponent(code: string): boolean {
    return (
      code.includes("import React") ||
      code.includes("import { ") ||
      (code.includes("function ") && code.includes("return (")) ||
      (code.includes("const ") && code.includes("=> ("))
    );
  }

  private static calculateConfidence(issues: DetectedIssue[]): number {
    const totalIssues = issues.length;
    const highSeverityCount = issues.filter(
      (i) => i.severity === "high",
    ).length;

    if (totalIssues === 0) return 0.5; // Neutral confidence when no issues

    // Higher confidence when more high-severity issues are detected
    return Math.min(0.9, 0.6 + (highSeverityCount / totalIssues) * 0.3);
  }

  private static estimateImpact(issues: DetectedIssue[]): ImpactEstimate {
    const totalIssues = issues.length;
    const criticalCount = issues.filter((i) => i.severity === "high").length;

    return {
      level: criticalCount > 3 ? "high" : criticalCount > 0 ? "medium" : "low",
      description: `${totalIssues} total issues, ${criticalCount} critical`,
      estimatedFixTime: Math.max(30, totalIssues * 10) + " seconds",
    };
  }
}
