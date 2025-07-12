
import { ValidationResult } from './types';

export class TransformationValidator {
  /**
   * Validate transformation safety
   */
  static validateTransformation(
    originalCode: string,
    transformedCode: string,
    layerId: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation checks
    if (transformedCode.length === 0 && originalCode.length > 0) {
      return {
        isValid: false,
        shouldRevert: true,
        errors: ['Transformation resulted in empty code'],
        warnings: [],
        reason: 'Code became empty after transformation'
      };
    }

    if (transformedCode === originalCode) {
      return {
        isValid: true,
        shouldRevert: false,
        errors: [],
        warnings: ['No changes detected'],
        reason: 'No transformation applied'
      };
    }

    // Check for obvious syntax issues
    const syntaxIssues = this.checkSyntaxIssues(transformedCode);
    if (syntaxIssues.length > 0) {
      return {
        isValid: false,
        shouldRevert: true,
        errors: syntaxIssues,
        warnings: [],
        reason: 'Syntax issues detected after transformation'
      };
    }

    // Check for structural integrity
    const structuralIssues = this.checkStructuralIntegrity(originalCode, transformedCode);
    if (structuralIssues.length > 0) {
      return {
        isValid: false,
        shouldRevert: true,
        errors: structuralIssues,
        warnings: [],
        reason: 'Structural integrity compromised'
      };
    }

    return {
      isValid: true,
      shouldRevert: false,
      errors: [],
      warnings: []
    };
  }

  private static checkSyntaxIssues(code: string): string[] {
    const issues: string[] = [];
    
    // Check for unmatched brackets
    const brackets = { '(': 0, '[': 0, '{': 0 };
    for (const char of code) {
      if (char === '(') brackets['(']++;
      else if (char === ')') brackets['(']--;
      else if (char === '[') brackets['[']++;
      else if (char === ']') brackets['[']--;
      else if (char === '{') brackets['{']++;
      else if (char === '}') brackets['{']--;
    }
    
    if (brackets['('] !== 0) issues.push('Unmatched parentheses');
    if (brackets['['] !== 0) issues.push('Unmatched square brackets');
    if (brackets['{'] !== 0) issues.push('Unmatched curly braces');
    
    return issues;
  }

  private static checkStructuralIntegrity(original: string, transformed: string): string[] {
    const issues: string[] = [];
    
    // Check if critical patterns were removed inappropriately
    const criticalPatterns = [
      /export\s+default/,
      /export\s+\{/,
      /import\s+/,
      /function\s+\w+/,
      /const\s+\w+\s*=/,
    ];
    
    for (const pattern of criticalPatterns) {
      const originalMatches = (original.match(pattern) || []).length;
      const transformedMatches = (transformed.match(pattern) || []).length;
      
      if (transformedMatches < originalMatches * 0.5) {
        issues.push(`Critical pattern significantly reduced: ${pattern.source}`);
      }
    }
    
    return issues;
  }
}
