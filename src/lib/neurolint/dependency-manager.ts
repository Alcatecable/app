
import { LAYER_DEPENDENCIES, LAYER_INFO } from './constants';

/**
 * Layer dependency system ensures proper execution order
 * Validates that required layers are included when others are selected
 */
export class LayerDependencyManager {
  
  /**
   * Validates and potentially auto-corrects layer selection
   */
  static validateAndCorrectLayers(requestedLayers: number[]): {
    correctedLayers: number[];
    warnings: string[];
    autoAdded: number[];
  } {
    const warnings: string[] = [];
    const autoAdded: number[] = [];
    let correctedLayers = [...requestedLayers];
    
    // Sort layers in execution order
    correctedLayers.sort((a, b) => a - b);
    
    // Check dependencies for each requested layer
    for (const layerId of requestedLayers) {
      const dependencies = LAYER_DEPENDENCIES[layerId as keyof typeof LAYER_DEPENDENCIES] || [];
      const missingDeps = dependencies.filter(dep => !correctedLayers.includes(dep));
      
      if (missingDeps.length > 0) {
        // Auto-add missing dependencies
        correctedLayers.push(...missingDeps);
        autoAdded.push(...missingDeps);
        
        warnings.push(
          `Layer ${layerId} (${LAYER_INFO[layerId as keyof typeof LAYER_INFO]?.name}) requires ` +
          `${missingDeps.map(dep => `${dep} (${LAYER_INFO[dep as keyof typeof LAYER_INFO]?.name})`).join(', ')}. ` +
          `Auto-added missing dependencies.`
        );
      }
    }
    
    // Remove duplicates and sort
    correctedLayers = [...new Set(correctedLayers)].sort((a, b) => a - b);
    
    return {
      correctedLayers,
      warnings,
      autoAdded
    };
  }
  
  /**
   * Suggests optimal layer combinations based on code analysis
   */
  static suggestLayers(code: string): {
    recommended: number[];
    reasons: string[];
  } {
    const recommended: number[] = [];
    const reasons: string[] = [];
    
    // Always recommend config layer for foundation
    recommended.push(1);
    reasons.push('Configuration layer provides essential foundation');
    
    // Check for HTML entities or old patterns
    if (/&quot;|&amp;|&lt;|&gt;|console\.log/.test(code)) {
      recommended.push(2);
      reasons.push('Entity cleanup needed for HTML entities and old patterns');
    }
    
    // Check for React components needing fixes
    if (code.includes('map(') && code.includes('<') && !code.includes('key=')) {
      recommended.push(3);
      reasons.push('Component fixes needed for missing key props');
    }
    
    // Check for hydration issues
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      recommended.push(4);
      reasons.push('Hydration fixes needed for SSR safety');
    }
    
    return { recommended, reasons };
  }
}
