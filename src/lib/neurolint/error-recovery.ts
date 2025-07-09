
import { ErrorInfo, RecoverySuggestion, LayerResult } from "./types";

/**
 * Advanced error recovery system with categorized error handling
 * Provides actionable feedback and recovery suggestions
 */
export class ErrorRecoverySystem {
  /**
   * Categorize errors for appropriate handling and user feedback
   */
  static categorizeError(error: any, layerId: number, code: string): ErrorInfo {
    const errorMessage = error.message || error.toString();

    // Syntax errors
    if (
      error.name === "SyntaxError" ||
      errorMessage.includes("Unexpected token")
    ) {
      return {
        code: error.code || "SYNTAX_ERROR",
        layer: layerId,
        category: "syntax",
        message: "Code syntax prevented transformation",
        suggestion: "Fix syntax errors before running NeuroLint",
        recoveryOptions: [
          "Run syntax validation first",
          "Use a code formatter",
          "Check for missing brackets or semicolons",
        ],
        severity: "high",
      };
    }

    // AST parsing errors
    if (errorMessage.includes("AST") || errorMessage.includes("parse")) {
      return {
        code: error.code || "AST_PARSE_ERROR",
        layer: layerId,
        category: "parsing",
        message: "Complex code structure not supported by AST parser",
        suggestion:
          "Try running with regex fallback or simplify code structure",
        recoveryOptions: [
          "Disable AST transformations",
          "Run individual layers",
          "Simplify complex expressions",
        ],
        severity: "medium",
      };
    }

    // File system errors
    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("permission")
    ) {
      return {
        code: error.code || "FILESYSTEM_ERROR",
        layer: layerId,
        category: "filesystem",
        message: "File system access error",
        suggestion: "Check file permissions and paths",
        recoveryOptions: [
          "Verify file exists",
          "Check write permissions",
          "Run with elevated privileges if needed",
        ],
        severity: "high",
      };
    }

    // Layer-specific errors
    const layerSpecificError = this.getLayerSpecificError(
      layerId,
      errorMessage,
    );
    if (layerSpecificError) {
      return layerSpecificError;
    }

    // Generic errors
    return {
      code: error.code || "UNKNOWN_ERROR",
      layer: layerId,
      category: "unknown",
      message: `Unexpected error in Layer ${layerId}`,
      suggestion: "Please report this issue with your code sample",
      recoveryOptions: [
        "Try running other layers individually",
        "Check console for additional details",
        "Report issue with minimal reproduction case",
      ],
      severity: "medium",
    };
  }

  /**
   * Handle layer-specific error patterns
   */
  private static getLayerSpecificError(
    layerId: number,
    errorMessage: string,
  ): ErrorInfo | null {
    switch (layerId) {
      case 1: // Configuration layer
        if (errorMessage.includes("JSON")) {
          return {
            code: "JSON_PARSE_ERROR",
            layer: layerId,
            category: "config",
            message: "Invalid JSON in configuration file",
            suggestion: "Validate JSON syntax in config files",
            recoveryOptions: [
              "Use JSON validator",
              "Check for trailing commas",
            ],
            severity: "high",
          };
        }
        break;

      case 2: // Pattern layer
        if (errorMessage.includes("replace")) {
          return {
            code: "PATTERN_ERROR",
            layer: layerId,
            category: "pattern",
            message: "Pattern replacement failed",
            suggestion: "Some patterns may conflict with your code structure",
            recoveryOptions: [
              "Skip pattern layer",
              "Review conflicting patterns",
            ],
            severity: "low",
          };
        }
        break;

      case 3: // Component layer
        if (errorMessage.includes("JSX")) {
          return {
            code: "JSX_ERROR",
            layer: layerId,
            category: "component",
            message: "JSX transformation error",
            suggestion: "Complex JSX structures may need manual fixing",
            recoveryOptions: ["Simplify JSX", "Use manual key addition"],
            severity: "medium",
          };
        }
        break;

      case 4: // Hydration layer
        if (
          errorMessage.includes("localStorage") ||
          errorMessage.includes("window")
        ) {
          return {
            code: "HYDRATION_ERROR",
            layer: layerId,
            category: "hydration",
            message: "Browser API protection failed",
            suggestion: "Manual SSR guards may be needed for complex cases",
            recoveryOptions: [
              "Add manual typeof window checks",
              "Use useEffect hooks",
            ],
            severity: "medium",
          };
        }
        break;
    }

    return null;
  }

  /**
   * Generate recovery suggestions based on error patterns
   */
  static generateRecoverySuggestions(
    errors: LayerResult[],
  ): RecoverySuggestion[] {
    const suggestions: RecoverySuggestion[] = [];

    const failedLayers = errors.filter((e) => !e.success);
    const syntaxErrors = failedLayers.filter((e) =>
      e.error?.includes("syntax"),
    );
    const parsingErrors = failedLayers.filter((e) =>
      e.error?.includes("parsing"),
    );

    if (syntaxErrors.length > 0) {
      suggestions.push({
        action: "fix-syntax",
        description: "Multiple syntax errors detected. Consider fixing these manually before running NeuroLint.",
        priority: 1,
        estimatedEffectiveness: 0.9,
        type: "syntax",
        title: "Fix Syntax Errors First",
        actions: [
          "Run code through a formatter (Prettier)",
          "Use ESLint to identify syntax issues",
          "Check for missing brackets, quotes, or semicolons",
        ],
      });
    }

    if (parsingErrors.length > 0) {
      suggestions.push({
        action: "simplify-code",
        description: "AST parser struggled with code complexity. Consider simplification.",
        priority: 2,
        estimatedEffectiveness: 0.7,
        type: "parsing",
        title: "Simplify Complex Code",
        actions: [
          "Break down complex expressions",
          "Separate complex JSX into smaller components",
          "Use regex-only mode for this code",
        ],
      });
    }

    return suggestions;
  }
}
