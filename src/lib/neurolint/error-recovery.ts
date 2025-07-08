
import { ErrorInfo, LayerExecutionResult, RecoverySuggestion, ExecutionOptions } from './types';

/**
 * Advanced error recovery system with categorized error handling
 * Provides actionable feedback and recovery suggestions
 */
export class ErrorRecoverySystem {
  
  /**
   * Execute layer with comprehensive error recovery
   */
  static async executeWithRecovery(
    code: string, 
    layerId: number, 
    options: ExecutionOptions = {}
  ): Promise<LayerExecutionResult> {
    
    const startTime = performance.now();
    
    try {
      // Attempt normal execution
      const result = await this.executeLayer(layerId, code, options);
      
      return {
        finalCode: result,
        results: [{
          layerId,
          success: true,
          code: result,
          executionTime: performance.now() - startTime,
          changeCount: this.calculateChanges(code, result),
          improvements: this.detectImprovements(code, result)
        }],
        states: [code, result],
        totalExecutionTime: performance.now() - startTime,
        successfulLayers: 1
      };
      
    } catch (error) {
      // Categorize and handle errors appropriately
      const errorInfo = this.categorizeError(error, layerId, code);
      
      console.error(`❌ Layer ${layerId} error:`, errorInfo.message);
      
      return {
        finalCode: code, // Return original code unchanged
        results: [{
          layerId,
          success: false,
          code,
          executionTime: performance.now() - startTime,
          changeCount: 0,
          error: errorInfo.message
        }],
        states: [code],
        totalExecutionTime: performance.now() - startTime,
        successfulLayers: 0
      };
    }
  }
  
  /**
   * Categorize errors for appropriate handling and user feedback
   */
  private static categorizeError(error: any, layerId: number, code: string): ErrorInfo {
    const errorMessage = error.message || error.toString();
    
    // Syntax errors
    if (error.name === 'SyntaxError' || errorMessage.includes('Unexpected token')) {
      return {
        category: 'syntax',
        message: 'Code syntax prevented transformation',
        suggestion: 'Fix syntax errors before running NeuroLint',
        recoveryOptions: [
          'Run syntax validation first',
          'Use a code formatter',
          'Check for missing brackets or semicolons'
        ],
        severity: 'high'
      };
    }
    
    // AST parsing errors
    if (errorMessage.includes('AST') || errorMessage.includes('parse')) {
      return {
        category: 'parsing',
        message: 'Complex code structure not supported by AST parser',
        suggestion: 'Try running with regex fallback or simplify code structure',
        recoveryOptions: [
          'Disable AST transformations',
          'Run individual layers',
          'Simplify complex expressions'
        ],
        severity: 'medium'
      };
    }
    
    // File system errors
    if (errorMessage.includes('ENOENT') || errorMessage.includes('permission')) {
      return {
        category: 'filesystem',
        message: 'File system access error',
        suggestion: 'Check file permissions and paths',
        recoveryOptions: [
          'Verify file exists',
          'Check write permissions',
          'Run with elevated privileges if needed'
        ],
        severity: 'high'
      };
    }
    
    // Layer-specific errors
    const layerSpecificError = this.getLayerSpecificError(layerId, errorMessage);
    if (layerSpecificError) {
      return layerSpecificError;
    }
    
    // Generic errors
    return {
      category: 'unknown',
      message: `Unexpected error in Layer ${layerId}`,
      suggestion: 'Please report this issue with your code sample',
      recoveryOptions: [
        'Try running other layers individually',
        'Check console for additional details',
        'Report issue with minimal reproduction case'
      ],
      severity: 'medium'
    };
  }
  
  /**
   * Handle layer-specific error patterns
   */
  private static getLayerSpecificError(layerId: number, errorMessage: string): ErrorInfo | null {
    switch (layerId) {
      case 1: // Configuration layer
        if (errorMessage.includes('JSON')) {
          return {
            category: 'config',
            message: 'Invalid JSON in configuration file',
            suggestion: 'Validate JSON syntax in config files',
            recoveryOptions: ['Use JSON validator', 'Check for trailing commas'],
            severity: 'high'
          };
        }
        break;
        
      case 2: // Pattern layer
        if (errorMessage.includes('replace')) {
          return {
            category: 'pattern',
            message: 'Pattern replacement failed',
            suggestion: 'Some patterns may conflict with your code structure',
            recoveryOptions: ['Skip pattern layer', 'Review conflicting patterns'],
            severity: 'low'
          };
        }
        break;
        
      case 3: // Component layer
        if (errorMessage.includes('JSX')) {
          return {
            category: 'component',
            message: 'JSX transformation error',
            suggestion: 'Complex JSX structures may need manual fixing',
            recoveryOptions: ['Simplify JSX', 'Use manual key addition'],
            severity: 'medium'
          };
        }
        break;
        
      case 4: // Hydration layer
        if (errorMessage.includes('localStorage') || errorMessage.includes('window')) {
          return {
            category: 'hydration',
            message: 'Browser API protection failed',
            suggestion: 'Manual SSR guards may be needed for complex cases',
            recoveryOptions: ['Add manual typeof window checks', 'Use useEffect hooks'],
            severity: 'medium'
          };
        }
        break;
    }
    
    return null;
  }
  
  /**
   * Generate recovery suggestions based on error patterns
   */
  static generateRecoverySuggestions(errors: LayerExecutionResult['results']): RecoverySuggestion[] {
    const suggestions: RecoverySuggestion[] = [];
    
    const failedLayers = errors.filter(e => !e.success);
    const syntaxErrors = failedLayers.filter(e => e.error?.includes('syntax'));
    const parsingErrors = failedLayers.filter(e => e.error?.includes('parsing'));
    
    if (syntaxErrors.length > 0) {
      suggestions.push({
        type: 'syntax',
        title: 'Fix Syntax Errors First',
        description: 'Multiple syntax errors detected. Consider fixing these manually before running NeuroLint.',
        actions: [
          'Run code through a formatter (Prettier)',
          'Use ESLint to identify syntax issues',
          'Check for missing brackets, quotes, or semicolons'
        ]
      });
    }
    
    if (parsingErrors.length > 0) {
      suggestions.push({
        type: 'parsing',
        title: 'Simplify Complex Code',
        description: 'AST parser struggled with code complexity. Consider simplification.',
        actions: [
          'Break down complex expressions',
          'Separate complex JSX into smaller components',
          'Use regex-only mode for this code'
        ]
      });
    }
    
    return suggestions;
  }
  
  private static async executeLayer(layerId: number, code: string, options: ExecutionOptions): Promise<string> {
    // Placeholder for actual layer execution
    return new Promise((resolve) => {
      setTimeout(() => resolve(code), 100);
    });
  }
  
  private static calculateChanges(before: string, after: string): number {
    return Math.abs(before.length - after.length);
  }
  
  private static detectImprovements(before: string, after: string): string[] {
    if (before !== after) {
      return ['Code transformation applied'];
    }
    return [];
  }
}
