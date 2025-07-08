
// Constants for the NeuroLint orchestration system
import { LayerConfig } from './types';

export const LAYER_EXECUTION_ORDER = [
  { id: 1, name: 'Configuration', description: 'Foundation setup' },
  { id: 2, name: 'Entity Cleanup', description: 'Preprocessing patterns' },
  { id: 3, name: 'Components', description: 'React/TS specific fixes' },
  { id: 4, name: 'Hydration', description: 'Runtime safety guards' }
];

export const LAYER_CONFIGS: Record<number, LayerConfig> = {
  1: {
    id: 1,
    name: 'Configuration',
    description: 'TypeScript, Next.js, package.json fixes',
    supportsAST: false,
    critical: true
  },
  2: {
    id: 2,
    name: 'Entity Cleanup',
    description: 'HTML entities, imports, React patterns',
    supportsAST: false,
    critical: false
  },
  3: {
    id: 3,
    name: 'Components',
    description: 'React component best practices',
    supportsAST: true,
    critical: false
  },
  4: {
    id: 4,
    name: 'Hydration',
    description: 'SSR guards, theme providers, client APIs',
    supportsAST: true,
    critical: false
  }
};

export const LAYER_DEPENDENCIES = {
  1: [], // Configuration has no dependencies
  2: [1], // Entity cleanup depends on config foundation
  3: [1, 2], // Components depend on config + cleanup
  4: [1, 2, 3], // Hydration depends on all previous layers
};

export const LAYER_INFO = {
  1: { name: 'Configuration', critical: true },
  2: { name: 'Entity Cleanup', critical: false },
  3: { name: 'Components', critical: false },
  4: { name: 'Hydration', critical: false },
};

export const CORRUPTION_PATTERNS = [
  {
    name: 'Double function calls',
    regex: /onClick=\{[^}]*\([^)]*\)\s*=>\s*\(\)\s*=>/g
  },
  {
    name: 'Malformed event handlers',
    regex: /onClick=\{[^}]*\)\([^)]*\)$/g
  },
  {
    name: 'Invalid JSX attributes',
    regex: /\w+=\{[^}]*\)[^}]*\}/g
  },
  {
    name: 'Broken import statements',
    regex: /import\s*{\s*\n\s*import\s*{/g
  }
];

export const ENTITY_PATTERNS = [
  { pattern: /&quot;/g, name: 'HTML quote entities' },
  { pattern: /&amp;/g, name: 'HTML ampersand entities' },
  { pattern: /&lt;|&gt;/g, name: 'HTML bracket entities' },
  { pattern: /console\.log\(/g, name: 'Console.log usage' },
  { pattern: /\bvar\s+/g, name: 'Var declarations' }
];
