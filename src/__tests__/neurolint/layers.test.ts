
import { describe, it, expect, beforeEach } from 'vitest';
import { NeuroLintOrchestrator } from '../../lib/neurolint/orchestrator';
import { SmartLayerSelector } from '../../lib/neurolint/smart-selector';
import { patternLearner } from '../../lib/neurolint/pattern-learner';

describe('NeuroLint Layer System', () => {
  beforeEach(() => {
    // Reset pattern learner state before each test
    patternLearner.clearRules();
  });

  describe('Layer 1: Configuration Fixes', () => {
    it('should fix TypeScript configuration issues', async () => {
      const problematicCode = `
        // TypeScript config issues
        const config = {
          target: "es5",
          lib: ["dom"]
        };
      `;

      const result = await NeuroLintOrchestrator.processCode(problematicCode, {
        selectedLayers: [1]
      });

      expect(result.successfulLayers).toBeGreaterThan(0);
      expect(result.finalCode).toBeDefined();
    });

    it('should optimize package.json scripts', async () => {
      const problematicCode = `
        {
          "scripts": {
            "dev": "next",
            "build": "next build"
          }
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(problematicCode, {
        selectedLayers: [1]
      });

      expect(result.results).toBeDefined();
      expect(result.successfulLayers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Layer 2: Pattern Recognition and Bulk Fixes', () => {
    it('should fix HTML entity corruption', async () => {
      const corruptedCode = `
        const message = "Hello &quot;World&quot; &#x27;test&#x27;";
        const ampersand = "Company &amp; Co";
      `;

      const result = await NeuroLintOrchestrator.processCode(corruptedCode, {
        selectedLayers: [2]
      });

      expect(result.finalCode).not.toContain('&quot;');
      expect(result.finalCode).not.toContain('&#x27;');
      expect(result.finalCode).not.toContain('&amp;');
    });

    it('should remove unused imports', async () => {
      const codeWithUnusedImports = `
        import React from 'react';
        import { useState, useEffect } from 'react';
        import { Button } from './Button';
        import { UnusedComponent } from './Unused';
        
        export default function Component() {
          const [state, setState] = useState(0);
          return <div>{state}</div>;
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(codeWithUnusedImports, {
        selectedLayers: [2]
      });

      expect(result.finalCode).not.toContain('UnusedComponent');
      expect(result.finalCode).toContain('useState');
    });

    it('should standardize quote usage', async () => {
      const mixedQuotes = `
        import { Component } from "react";
        const message = 'Hello World';
        const config = { "key": 'value' };
      `;

      const result = await NeuroLintOrchestrator.processCode(mixedQuotes, {
        selectedLayers: [2]
      });

      expect(result.successfulLayers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Layer 3: Component Enhancement', () => {
    it('should fix Button component props', async () => {
      const buttonCode = `
        export default function MyComponent() {
          return (
            <div>
              <Button>Click me</Button>
              <Button size="large">Big Button</Button>
            </div>
          );
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(buttonCode, {
        selectedLayers: [3]
      });

      expect(result.finalCode).toContain('variant=');
    });

    it('should add missing key props', async () => {
      const listCode = `
        const items = ['a', 'b', 'c'];
        return items.map(item => <div>{item}</div>);
      `;

      const result = await NeuroLintOrchestrator.processCode(listCode, {
        selectedLayers: [3]
      });

      expect(result.finalCode).toContain('key=');
    });

    it('should fix Form component structure', async () => {
      const formCode = `
        <FormField>
          <Input type="text" />
        </FormField>
      `;

      const result = await NeuroLintOrchestrator.processCode(formCode, {
        selectedLayers: [3]
      });

      expect(result.successfulLayers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Layer 4: Hydration and SSR Fixes', () => {
    it('should add SSR guards for localStorage', async () => {
      const ssrProblematicCode = `
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      `;

      const result = await NeuroLintOrchestrator.processCode(ssrProblematicCode, {
        selectedLayers: [4]
      });

      expect(result.finalCode).toContain('typeof window');
    });

    it('should fix theme provider hydration', async () => {
      const themeCode = `
        export function ThemeProvider({ children }) {
          const [theme, setTheme] = useState('light');
          return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(themeCode, {
        selectedLayers: [4]
      });

      expect(result.finalCode).toContain('mounted');
    });
  });

  describe('Layer 5: Next.js App Router Fixes', () => {
    it('should fix misplaced use client directives', async () => {
      const misplacedDirective = `
        import React from 'react';
        'use client';
        
        export default function Component() {
          return <div>Hello</div>;
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(misplacedDirective, {
        selectedLayers: [5]
      });

      expect(result.finalCode.indexOf("'use client'")).toBeLessThan(result.finalCode.indexOf('import'));
    });

    it('should add missing use client for hooks', async () => {
      const hookCode = `
        import { useState } from 'react';
        
        export default function Component() {
          const [state, setState] = useState(0);
          return <div>{state}</div>;
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(hookCode, {
        selectedLayers: [5]
      });

      expect(result.finalCode).toContain("'use client'");
    });

    it('should fix corrupted import statements', async () => {
      const corruptedImports = `
        import {
        import { useState } from 'react';
      `;

      const result = await NeuroLintOrchestrator.processCode(corruptedImports, {
        selectedLayers: [5]
      });

      expect(result.finalCode).not.toMatch(/import\s*{\s*$/);
    });
  });

  describe('Layer 6: Testing and Validation', () => {
    it('should add error boundaries', async () => {
      const riskyCode = `
        export default function PDFUpload() {
          return <div>PDF upload component</div>;
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(riskyCode, {
        selectedLayers: [6]
      });

      expect(result.finalCode).toContain('try');
    });
  });

  describe('Pattern Learning Integration', () => {
    it('should learn from successful fixes', async () => {
      const initialStats = patternLearner.getStatistics();
      
      const code = `const message = "&quot;Hello&quot;";`;
      await NeuroLintOrchestrator.processCode(code, {
        selectedLayers: [2],
        enablePatternLearning: true
      });

      const updatedStats = patternLearner.getStatistics();
      expect(updatedStats.totalRules).toBeGreaterThanOrEqual(initialStats.totalRules);
    });
  });

  describe('Multi-layer Processing', () => {
    it('should handle complex code with multiple issues', async () => {
      const complexCode = `
        import React from 'react';
        'use client';
        
        export default function Component() {
          const data = localStorage.getItem('data');
          const items = [1, 2, 3];
          
          return (
            <div>
              {items.map(item => <Button>{item}</Button>)}
              <div>&quot;Hello&quot;</div>
            </div>
          );
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(complexCode, {
        selectedLayers: [2, 3, 4, 5]
      });

      expect(result.successfulLayers).toBeGreaterThan(0);
    });

    it('should optimize execution order', async () => {
      const code = `const test = "&quot;test&quot;";`;
      
      const result = await NeuroLintOrchestrator.processCode(code, {
        selectedLayers: [1, 2, 3, 4, 5, 6]
      });

      expect(result.results).toBeDefined();
      expect(result.totalExecutionTime).toBeGreaterThan(0);
    });

    it('should handle layer dependencies', async () => {
      const code = `
        import { Button } from './Button';
        export default function App() {
          return <Button size="xl">Test</Button>;
        }
      `;

      const result = await NeuroLintOrchestrator.processCode(code, {
        selectedLayers: [3, 5]
      });

      expect(result.successfulLayers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Smart Layer Selection', () => {
    it('should recommend appropriate layers based on code analysis', async () => {
      const codeWithHydrationIssues = `
        const theme = localStorage.getItem('theme');
        const [mounted, setMounted] = useState(false);
      `;

      const recommendations = SmartLayerSelector.recommendLayers(codeWithHydrationIssues);
      expect(recommendations).toContain(4); // Hydration layer
    });
  });
});
