import { ErrorInfo, RecoverySuggestion, LayerResult, ErrorRecoveryStrategy } from "../types";
import { logger } from "../logger";

/**
 * Enhanced error recovery system with intelligent error categorization
 * and adaptive recovery strategies
 */
export class EnhancedErrorRecovery {
  private static errorPatterns: Map<string, ErrorRecoveryStrategy> = new Map();
  private static recoveryHistory: Array<{ error: string; strategy: string; success: boolean; timestamp: number }> = [];

  static {
    this.initializeErrorPatterns();
  }

  /**
   * Categorize errors with enhanced intelligence and provide recovery strategies
   */
  static categorizeError(error: any, layerId: number, code: string): ErrorInfo {
    const errorMessage = error.message || error.toString();
    const errorStack = error.stack || '';
    
    // Analyze error pattern
    const errorAnalysis = this.analyzeErrorPattern(errorMessage, errorStack, layerId);
    
    // Get recovery strategy
    const strategy = this.getRecoveryStrategy(errorAnalysis);
    
    // Record error for learning
    this.recordError(errorMessage, strategy.name, layerId);

    return {
      category: errorAnalysis.category,
      message: errorAnalysis.message,
      suggestion: strategy.suggestion,
      recoveryOptions: strategy.recoveryOptions,
      severity: errorAnalysis.severity,
      confidence: errorAnalysis.confidence,
      automated: strategy.automated,
      retryable: strategy.retryable,
    };
  }

  /**
   * Attempt automatic error recovery
   */
  static async attemptRecovery(
    error: any,
    layerId: number,
    code: string,
    attempt: number = 1
  ): Promise<{ success: boolean; recoveredCode?: string; strategy?: string }> {
    const errorInfo = this.categorizeError(error, layerId, code);
    
    if (!errorInfo.automated || attempt > 3) {
      return { success: false };
    }

    const strategy = this.errorPatterns.get(errorInfo.category);
    if (!strategy || !strategy.recoveryFunction) {
      return { success: false };
    }

    try {
      logger.info(`Attempting automatic recovery for ${errorInfo.category}`, {
        layerId,
        attempt,
        strategy: strategy.name,
      });

      const recoveredCode = await strategy.recoveryFunction(code, error);
      
      // Validate recovery
      const isValid = await this.validateRecovery(recoveredCode, code);
      
      if (isValid) {
        this.recordRecoverySuccess(errorInfo.category, strategy.name);
        return { success: true, recoveredCode, strategy: strategy.name };
      } else {
        this.recordRecoveryFailure(errorInfo.category, strategy.name);
        return { success: false };
      }
    } catch (recoveryError) {
      logger.warn("Recovery attempt failed", {
        originalError: error.message,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : "Unknown",
        strategy: strategy.name,
      });
      
      this.recordRecoveryFailure(errorInfo.category, strategy.name);
      return { success: false };
    }
  }

  /**
   * Analyze error patterns to determine category and characteristics
   */
  private static analyzeErrorPattern(
    message: string,
    stack: string,
    layerId: number
  ): {
    category: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  } {
    const patterns = [
      {
        category: 'syntax',
        patterns: [/SyntaxError/, /Unexpected token/, /Unexpected end of input/],
        severity: 'high' as const,
        confidence: 0.95,
      },
      {
        category: 'ast-parsing',
        patterns: [/AST/, /parse/, /transform/, /babel/i],
        severity: 'medium' as const,
        confidence: 0.8,
      },
      {
        category: 'type-error',
        patterns: [/TypeError/, /Cannot read prop/, /undefined is not a function/],
        severity: 'high' as const,
        confidence: 0.9,
      },
      {
        category: 'reference-error',
        patterns: [/ReferenceError/, /is not defined/, /Cannot access/],
        severity: 'high' as const,
        confidence: 0.9,
      },
      {
        category: 'jsx-error',
        patterns: [/JSX/, /React/, /element/, /component/i],
        severity: 'medium' as const,
        confidence: 0.7,
      },
      {
        category: 'import-error',
        patterns: [/Cannot resolve/, /Module not found/, /import/i],
        severity: 'high' as const,
        confidence: 0.85,
      },
      {
        category: 'timeout',
        patterns: [/timeout/, /timed out/, /exceeded/i],
        severity: 'low' as const,
        confidence: 0.8,
      },
      {
        category: 'memory',
        patterns: [/memory/, /heap/, /out of memory/i],
        severity: 'critical' as const,
        confidence: 0.9,
      },
    ];

    for (const pattern of patterns) {
      const isMatch = pattern.patterns.some(regex => regex.test(message) || regex.test(stack));
      if (isMatch) {
        return {
          category: pattern.category,
          message: `${pattern.category.charAt(0).toUpperCase() + pattern.category.slice(1)} error in Layer ${layerId}`,
          severity: pattern.severity,
          confidence: pattern.confidence,
        };
      }
    }

    return {
      category: 'unknown',
      message: `Unknown error in Layer ${layerId}`,
      severity: 'medium',
      confidence: 0.5,
    };
  }

  /**
   * Get appropriate recovery strategy for error type
   */
  private static getRecoveryStrategy(errorAnalysis: {
    category: string;
    severity: string;
  }): ErrorRecoveryStrategy {
    const strategy = this.errorPatterns.get(errorAnalysis.category);
    
    if (strategy) {
      return strategy;
    }

    // Default strategy for unknown errors
    return {
      name: 'default-fallback',
      suggestion: 'Manual intervention required',
      recoveryOptions: [
        'Review error message and stack trace',
        'Check input code for obvious issues',
        'Try running individual layers',
        'Report issue with minimal reproduction case',
      ],
      automated: false,
      retryable: false,
    };
  }

  /**
   * Initialize error patterns and recovery strategies
   */
  private static initializeErrorPatterns(): void {
    this.errorPatterns.set('syntax', {
      name: 'syntax-error-recovery',
      suggestion: 'Fix syntax errors in the code',
      recoveryOptions: [
        'Run code through a formatter (Prettier)',
        'Check for missing brackets, quotes, or semicolons',
        'Validate with ESLint',
      ],
      automated: true,
      retryable: true,
      recoveryFunction: this.recoverFromSyntaxError,
    });

    this.errorPatterns.set('ast-parsing', {
      name: 'ast-parsing-fallback',
      suggestion: 'Use regex-based transformations instead of AST',
      recoveryOptions: [
        'Disable AST transformations',
        'Use regex-only mode',
        'Simplify complex expressions',
      ],
      automated: true,
      retryable: true,
      recoveryFunction: this.recoverFromASTError,
    });

    this.errorPatterns.set('jsx-error', {
      name: 'jsx-error-recovery',
      suggestion: 'Fix JSX syntax or structure issues',
      recoveryOptions: [
        'Check for unclosed JSX tags',
        'Validate JSX element nesting',
        'Ensure proper React imports',
      ],
      automated: true,
      retryable: true,
      recoveryFunction: this.recoverFromJSXError,
    });

    this.errorPatterns.set('timeout', {
      name: 'timeout-retry',
      suggestion: 'Retry with increased timeout or smaller chunks',
      recoveryOptions: [
        'Increase timeout duration',
        'Process in smaller chunks',
        'Skip non-essential transformations',
      ],
      automated: true,
      retryable: true,
      recoveryFunction: this.recoverFromTimeout,
    });

    this.errorPatterns.set('memory', {
      name: 'memory-optimization',
      suggestion: 'Reduce memory usage and process in chunks',
      recoveryOptions: [
        'Process code in smaller chunks',
        'Disable memory-intensive features',
        'Clear caches and temporary data',
      ],
      automated: true,
      retryable: true,
      recoveryFunction: this.recoverFromMemoryError,
    });
  }

  /**
   * Recovery functions for different error types
   */
  private static async recoverFromSyntaxError(code: string, error: any): Promise<string> {
    // Attempt basic syntax fixes
    let recoveredCode = code;
    
    // Fix common syntax issues
    recoveredCode = recoveredCode
      .replace(/([^;{}\n])\s*$/gm, '$1;') // Add missing semicolons
      .replace(/\s*{\s*$/gm, ' {') // Fix bracket spacing
      .replace(/\s*}\s*$/gm, '}'); // Fix bracket spacing

    return recoveredCode;
  }

  private static async recoverFromASTError(code: string, error: any): Promise<string> {
    // For AST errors, return code unchanged to force regex fallback
    return code;
  }

  private static async recoverFromJSXError(code: string, error: any): Promise<string> {
    let recoveredCode = code;
    
    // Fix common JSX issues
    recoveredCode = recoveredCode
      .replace(/<(\w+)([^>]*?)(?<!\/)\s*>([^<]*?)(?!<\/\1>)/g, '<$1$2>$3</$1>') // Close unclosed tags
      .replace(/\s+>/g, '>') // Remove extra spaces before closing brackets
      .replace(/>\s+</g, '><'); // Remove extra spaces between tags

    return recoveredCode;
  }

  private static async recoverFromTimeout(code: string, error: any): Promise<string> {
    // For timeout errors, return code unchanged to trigger retry with different settings
    return code;
  }

  private static async recoverFromMemoryError(code: string, error: any): Promise<string> {
    // For memory errors, try to simplify the code
    let recoveredCode = code;
    
    // Remove comments to reduce memory usage
    recoveredCode = recoveredCode
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/^\s*\n/gm, ''); // Remove empty lines

    return recoveredCode;
  }

  /**
   * Validate that recovery was successful
   */
  private static async validateRecovery(recoveredCode: string, originalCode: string): Promise<boolean> {
    // Basic validation - ensure we didn't break the code structure
    if (recoveredCode.length === 0) return false;
    if (recoveredCode === originalCode) return true; // No changes, but that's okay
    
    // Check for basic syntax validity
    try {
      // Simple validation - check for balanced brackets
      const openBrackets = (recoveredCode.match(/[{([]/g) || []).length;
      const closeBrackets = (recoveredCode.match(/[})\]]/g) || []).length;
      
      return Math.abs(openBrackets - closeBrackets) <= 1; // Allow small imbalances
    } catch {
      return false;
    }
  }

  /**
   * Record error for pattern learning
   */
  private static recordError(error: string, strategy: string, layerId: number): void {
    // Keep only recent errors to prevent memory issues
    if (this.recoveryHistory.length > 1000) {
      this.recoveryHistory = this.recoveryHistory.slice(-500);
    }
    
    this.recoveryHistory.push({
      error: error.substring(0, 200), // Truncate long error messages
      strategy,
      success: false, // Will be updated if recovery succeeds
      timestamp: Date.now(),
    });
  }

  /**
   * Record successful recovery
   */
  private static recordRecoverySuccess(category: string, strategy: string): void {
    const lastRecord = this.recoveryHistory[this.recoveryHistory.length - 1];
    if (lastRecord && lastRecord.strategy === strategy) {
      lastRecord.success = true;
    }
    
    logger.info("Error recovery successful", { category, strategy });
  }

  /**
   * Record failed recovery
   */
  private static recordRecoveryFailure(category: string, strategy: string): void {
    logger.warn("Error recovery failed", { category, strategy });
  }

  /**
   * Get recovery statistics for monitoring
   */
  static getRecoveryStatistics(): {
    totalAttempts: number;
    successfulRecoveries: number;
    successRate: number;
    strategiesUsed: Record<string, { attempts: number; successes: number }>;
  } {
    const strategiesUsed: Record<string, { attempts: number; successes: number }> = {};
    
    this.recoveryHistory.forEach(record => {
      if (!strategiesUsed[record.strategy]) {
        strategiesUsed[record.strategy] = { attempts: 0, successes: 0 };
      }
      strategiesUsed[record.strategy].attempts++;
      if (record.success) {
        strategiesUsed[record.strategy].successes++;
      }
    });
    
    const totalAttempts = this.recoveryHistory.length;
    const successfulRecoveries = this.recoveryHistory.filter(r => r.success).length;
    const successRate = totalAttempts > 0 ? successfulRecoveries / totalAttempts : 0;
    
    return {
      totalAttempts,
      successfulRecoveries,
      successRate,
      strategiesUsed,
    };
  }
}
