
import { LayerConfig } from './types';

export const LAYER_EXECUTION_ORDER = [1, 2, 3, 4, 5, 6];

export const LAYER_DEPENDENCIES: Record<number, number[]> = {
  1: [], // Configuration - no dependencies
  2: [1], // Pattern recognition depends on config
  3: [1, 2], // Component enhancement depends on config and patterns
  4: [1, 2], // Hydration fixes depend on config and patterns
  5: [1, 2, 4], // Next.js fixes depend on config, patterns, and hydration
  6: [1, 2, 3, 4, 5], // Testing depends on all previous layers
};

export const LAYER_CONFIGS: Record<number, LayerConfig> = {
  1: {
    id: 1,
    name: 'Configuration Layer',
    description: 'Fixes TypeScript, Next.js, and package.json configurations',
    rules: []
  },
  2: {
    id: 2,
    name: 'Pattern Recognition Layer',
    description: 'Bulk fixes for common patterns like HTML entities and imports',
    rules: []
  },
  3: {
    id: 3,
    name: 'Component Enhancement Layer',
    description: 'Fixes component-specific issues like props and structure',
    rules: []
  },
  4: {
    id: 4,
    name: 'Hydration & SSR Layer',
    description: 'Fixes client-side rendering and hydration issues',
    rules: []
  },
  5: {
    id: 5,
    name: 'Next.js App Router Layer',
    description: 'Fixes Next.js App Router specific issues',
    rules: []
  },
  6: {
    id: 6,
    name: 'Testing & Validation Layer',
    description: 'Adds testing infrastructure and validation',
    rules: []
  }
};

export const LAYER_INFO = {
  1: { name: 'Configuration', color: 'blue' },
  2: { name: 'Pattern Recognition', color: 'green' },
  3: { name: 'Component Enhancement', color: 'purple' },
  4: { name: 'Hydration & SSR', color: 'orange' },
  5: { name: 'Next.js App Router', color: 'red' },
  6: { name: 'Testing & Validation', color: 'indigo' }
};

export const DEFAULT_LAYER_SELECTION = [1, 2, 3, 4, 5, 6];

export const PERFORMANCE_THRESHOLDS = {
  maxExecutionTime: 30000, // 30 seconds
  maxMemoryUsage: 512 * 1024 * 1024, // 512MB
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

export const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.6,
  low: 0.4,
};
