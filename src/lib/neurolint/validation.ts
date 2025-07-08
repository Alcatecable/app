
import { ValidationResult, CORRUPTION_PATTERNS } from './types';

/**
 * Comprehensive validation system for transformations
 * Catches syntax errors, corruption, and logical issues
 */
export class TransformationValidator {
  
  /**
   * Main validation entry point
   */
  static validateTransformation(before: string, after: string): ValidationResult {
    // Skip validation if no changes were made
    if (before === after) {
      return { shouldRevert: false, reason: 'No changes made' };
    }
    
    // Check for syntax validity
    const syntaxCheck = this.validateSyntax(after);
    if (!syntaxCheck.valid) {
      return { 
        shouldRevert: true, 
        reason: `Syntax error: ${syntaxCheck.error}` 
      };
    }
    
    // Check for code corruption patterns
    const corruptionCheck = this.detectCorruption(before, after);
    if (corruptionCheck.detected) {
      return { 
        shouldRevert: true, 
        reason: `Corruption detected: ${corruptionCheck.pattern}` 
      };
    }
    
    // Check for logical issues
    const logicalCheck = this.validateLogicalIntegrity(before, after);
    if (!logicalCheck.valid) {
      return { 
        shouldRevert: true, 
        reason: `Logical issue: ${logicalCheck.reason}` 
      };
    }
    
    return { shouldRevert: false };
  }
  
  /**
   * Parse code to check for syntax errors
   */
  private static validateSyntax(code: string): { valid: boolean; error?: string } {
    try {
      // Basic syntax validation using Function constructor
      // This is a simplified version - in real implementation you'd use a proper parser
      new Function(code);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown syntax error' 
      };
    }
  }
  
  /**
   * Detect common corruption patterns introduced by faulty transformations
   */
  private static detectCorruption(before: string, after: string): { 
    detected: boolean; 
    pattern?: string 
  } {
    for (const pattern of CORRUPTION_PATTERNS) {
      // Check if pattern exists in after but not before
      if (pattern.regex.test(after) && !pattern.regex.test(before)) {
        return { 
          detected: true, 
          pattern: pattern.name 
        };
      }
    }
    
    return { detected: false };
  }
  
  /**
   * Validate logical integrity of transformations
   */
  private static validateLogicalIntegrity(before: string, after: string): {
    valid: boolean;
    reason?: string;
  } {
    // Check that essential imports weren't accidentally removed
    const beforeImports = this.extractImports(before);
    const afterImports = this.extractImports(after);
    
    const removedImports = beforeImports.filter(imp => !afterImports.includes(imp));
    const criticalImports = ['React', 'useState', 'useEffect'];
    
    const removedCritical = removedImports.filter(imp => 
      criticalImports.some(critical => imp.includes(critical))
    );
    
    if (removedCritical.length > 0) {
      return {
        valid: false,
        reason: `Critical imports removed: ${removedCritical.join(', ')}`
      };
    }
    
    return { valid: true };
  }
  
  private static extractImports(code: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"]/g;
    return code.match(importRegex) || [];
  }
}
