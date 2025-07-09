
import { DetectedIssue, ImpactAssessment } from "./types";

/**
 * Code Analysis Service
 * Comprehensive analysis engine that mirrors the problem detection from fix-master.js
 */

export class CodeAnalysisService {
  constructor(private code: string) {}

  /**
   * Run comprehensive analysis matching fix-master.js problem detection
   */
  runAnalysis(): DetectedIssue[] {
    const issues: DetectedIssue[] = [];
    
    // Layer 1: Configuration issues
    this.detectConfigurationIssues(issues);
    
    // Layer 2: Pattern recognition issues
    this.detectPatternIssues(issues);
    
    // Layer 3: Component issues
    this.detectComponentIssues(issues);
    
    // Layer 4: Hydration issues
    this.detectHydrationIssues(issues);
    
    // Layer 5: Next.js issues
    this.detectNextJsIssues(issues);
    
    // Layer 6: Testing and validation issues
    this.detectTestingIssues(issues);
    
    return issues;
  }

  /**
   * Calculate confidence based on the types and severity of issues found
   */
  calculateConfidence(): number {
    const issues = this.runAnalysis();
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const totalIssues = issues.length;
    
    if (totalIssues === 0) return 0.9;
    if (criticalIssues > 0) return 0.95;
    if (highIssues > 0) return 0.85;
    return 0.75;
  }

  /**
   * Estimate the impact of fixes based on detected issues
   */
  estimateImpact(): ImpactAssessment {
    const issues = this.runAnalysis();
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const totalCount = issues.length;
    
    if (criticalCount > 0 || totalCount > 5) {
      return {
        level: 'high',
        estimatedFixTime: '2-5 minutes'
      };
    } else if (highCount > 0 || totalCount > 2) {
      return {
        level: 'medium',
        estimatedFixTime: '1-2 minutes'
      };
    } else {
      return {
        level: 'low',
        estimatedFixTime: '30 seconds'
      };
    }
  }

  /**
   * Detect Layer 1 configuration issues
   */
  private detectConfigurationIssues(issues: DetectedIssue[]): void {
    // Check for TypeScript configuration issues
    if (this.code.includes('"target": "es5"')) {
      issues.push({
        severity: 'high',
        pattern: 'Outdated TypeScript target',
        description: 'TypeScript target is ES5, should be ES2020 or higher',
        fixedByLayer: 1,
        type: 'config'
      });
    }

    if (this.code.includes('appDir') && this.code.includes('experimental')) {
      issues.push({
        severity: 'medium',
        pattern: 'Deprecated Next.js option',
        description: 'appDir in experimental is deprecated in Next.js 13+',
        fixedByLayer: 1,
        type: 'config'
      });
    }

    if (this.code.includes('package.json') && !this.code.includes('"type-check"')) {
      issues.push({
        severity: 'low',
        pattern: 'Missing scripts',
        description: 'package.json may be missing useful scripts',
        fixedByLayer: 1,
        type: 'config'
      });
    }
  }

  /**
   * Detect Layer 2 pattern recognition issues
   */
  private detectPatternIssues(issues: DetectedIssue[]): void {
    // HTML entity corruption
    const htmlEntityMatches = this.code.match(/&quot;|&#x27;|&amp;|&lt;|&gt;/g);
    if (htmlEntityMatches) {
      issues.push({
        severity: 'high',
        pattern: 'HTML entity corruption',
        description: 'HTML entities found that should be converted to proper characters',
        fixedByLayer: 2,
        type: 'corruption',
        count: htmlEntityMatches.length
      });
    }

    // Console.log statements
    const consoleMatches = this.code.match(/console\.log\(/g);
    if (consoleMatches) {
      issues.push({
        severity: 'low',
        pattern: 'Console statements',
        description: 'Console.log statements should be replaced with proper logging',
        fixedByLayer: 2,
        type: 'pattern',
        count: consoleMatches.length
      });
    }

    // var statements (should be let/const)
    const varMatches = this.code.match(/\bvar\s+/g);
    if (varMatches) {
      issues.push({
        severity: 'medium',
        pattern: 'Legacy var declarations',
        description: 'var declarations should be replaced with let/const',
        fixedByLayer: 2,
        type: 'pattern',
        count: varMatches.length
      });
    }

    // React Fragment patterns
    if (this.code.includes('<React.Fragment>')) {
      issues.push({
        severity: 'low',
        pattern: 'React Fragment shorthand',
        description: 'React.Fragment can be shortened to <> syntax',
        fixedByLayer: 2,
        type: 'pattern'
      });
    }

    // Unused imports (basic detection)
    const importMatches = this.code.match(/import.*from/g);
    if (importMatches && importMatches.length > 10) {
      issues.push({
        severity: 'low',
        pattern: 'Potentially unused imports',
        description: 'Many imports detected, some may be unused',
        fixedByLayer: 2,
        type: 'imports'
      });
    }
  }

  /**
   * Detect Layer 3 component issues
   */
  private detectComponentIssues(issues: DetectedIssue[]): void {
    // Missing key props in map functions
    if (this.code.includes('.map(') && !this.code.includes('key=')) {
      const mapMatches = this.code.match(/\.map\(/g);
      issues.push({
        severity: 'medium',
        pattern: 'Missing key props',
        description: 'React map functions missing key props',
        fixedByLayer: 3,
        type: 'react',
        count: mapMatches?.length || 1
      });
    }

    // Button components without variants
    if (this.code.includes('<Button') && !this.code.includes('variant=')) {
      issues.push({
        severity: 'low',
        pattern: 'Button without variant',
        description: 'Button components should have explicit variant props',
        fixedByLayer: 3,
        type: 'component'
      });
    }

    // Images without alt attributes
    if (this.code.includes('<img') && !this.code.includes('alt=')) {
      issues.push({
        severity: 'medium',
        pattern: 'Images without alt',
        description: 'Image elements should have alt attributes for accessibility',
        fixedByLayer: 3,
        type: 'accessibility'
      });
    }

    // Form components without proper structure
    if (this.code.includes('<FormField') && !this.code.includes('FormControl')) {
      issues.push({
        severity: 'medium',
        pattern: 'Incomplete form structure',
        description: 'FormField components may need proper control structure',
        fixedByLayer: 3,
        type: 'component'
      });
    }

    // Component missing prop interfaces
    if (this.code.includes('export default function') && 
        this.code.includes('props') && 
        !this.code.includes('interface')) {
      issues.push({
        severity: 'medium',
        pattern: 'Missing prop interfaces',
        description: 'Components should have TypeScript interfaces for props',
        fixedByLayer: 3,
        type: 'typescript'
      });
    }
  }

  /**
   * Detect Layer 4 hydration issues
   */
  private detectHydrationIssues(issues: DetectedIssue[]): void {
    // localStorage without SSR guards
    if (this.code.includes('localStorage.getItem') && !this.code.includes('typeof window')) {
      const localStorageMatches = this.code.match(/localStorage\.getItem/g);
      issues.push({
        severity: 'critical',
        pattern: 'localStorage without SSR guard',
        description: 'localStorage access without typeof window guard causes hydration errors',
        fixedByLayer: 4,
        type: 'hydration',
        count: localStorageMatches?.length || 1
      });
    }

    // window access without guards
    if (this.code.includes('window.matchMedia') && !this.code.includes('typeof window')) {
      issues.push({
        severity: 'critical',
        pattern: 'window access without guard',
        description: 'window object access without typeof window guard',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }

    // document access without guards
    if (this.code.includes('document.documentElement') && !this.code.includes('typeof document')) {
      issues.push({
        severity: 'high',
        pattern: 'document access without guard',
        description: 'document object access without typeof document guard',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }

    // Theme providers without mounted state
    if (this.code.includes('ThemeProvider') && 
        this.code.includes('useState') && 
        !this.code.includes('mounted')) {
      issues.push({
        severity: 'critical',
        pattern: 'Theme provider hydration issue',
        description: 'ThemeProvider needs mounted state to prevent hydration mismatch',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }

    // Client-only components without proper handling
    if (this.code.includes('useTheme') && 
        !this.code.includes('dynamic') && 
        !this.code.includes('NoSSR')) {
      issues.push({
        severity: 'medium',
        pattern: 'Client-only component issue',
        description: 'Component using client-only hooks may need SSR protection',
        fixedByLayer: 4,
        type: 'hydration'
      });
    }
  }

  /**
   * Detect Layer 5 Next.js App Router issues
   */
  private detectNextJsIssues(issues: DetectedIssue[]): void {
    // Corrupted import statements
    if (/import\s*{\s*$|import\s*{\s*\n\s*import/m.test(this.code)) {
      issues.push({
        severity: 'critical',
        pattern: 'Corrupted import statements',
        description: 'Malformed import statements that will cause syntax errors',
        fixedByLayer: 5,
        type: 'corruption'
      });
    }

    // Misplaced 'use client' directives
    const lines = this.code.split('\n');
    const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
    if (useClientIndex > 0) {
      // Check if there are imports or other statements before 'use client'
      for (let i = 0; i < useClientIndex; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('//') && !line.startsWith('/*')) {
          issues.push({
            severity: 'critical',
            pattern: 'Misplaced use client directive',
            description: '"use client" directive must be at the top of the file',
            fixedByLayer: 5,
            type: 'nextjs'
          });
          break;
        }
      }
    }

    // Missing 'use client' for components using hooks
    if ((this.code.includes('useState') || this.code.includes('useEffect')) &&
        !this.code.includes("'use client'") &&
        this.code.includes('export default function')) {
      issues.push({
        severity: 'high',
        pattern: 'Missing use client directive',
        description: 'Components using hooks need "use client" directive in App Router',
        fixedByLayer: 5,
        type: 'nextjs'
      });
    }

    // React import issues in App Router
    if (this.code.includes("'use client'") && 
        !this.code.includes('import React') && 
        (this.code.includes('useState') || this.code.includes('useEffect'))) {
      issues.push({
        severity: 'medium',
        pattern: 'Missing React import',
        description: 'Client components should explicitly import React',
        fixedByLayer: 5,
        type: 'nextjs'
      });
    }
  }

  /**
   * Detect Layer 6 testing and validation issues
   */
  private detectTestingIssues(issues: DetectedIssue[]): void {
    // Missing error boundaries for risky components
    if ((this.code.includes('PDF') || this.code.includes('upload') || this.code.includes('API')) && 
        !this.code.includes('ErrorBoundary') && 
        !this.code.includes('try')) {
      issues.push({
        severity: 'medium',
        pattern: 'Missing error handling',
        description: 'Risky operations should have error boundaries or try-catch blocks',
        fixedByLayer: 6,
        type: 'reliability'
      });
    }

    // Missing accessibility attributes
    if (this.code.includes('<button') && !this.code.includes('aria-label')) {
      const buttonMatches = this.code.match(/<button/g);
      issues.push({
        severity: 'medium',
        pattern: 'Missing accessibility attributes',
        description: 'Interactive elements should have aria-label attributes',
        fixedByLayer: 6,
        type: 'accessibility',
        count: buttonMatches?.length || 1
      });
    }

    // Missing loading states for async operations
    if (this.code.includes('async') && 
        this.code.includes('useState') &&
        !this.code.includes('loading') &&
        !this.code.includes('isLoading')) {
      issues.push({
        severity: 'low',
        pattern: 'Missing loading states',
        description: 'Async operations should have loading state indicators',
        fixedByLayer: 6,
        type: 'ux'
      });
    }

    // Components that could benefit from React.memo
    if (this.code.includes('export default function') && 
        !this.code.includes('useState') &&
        !this.code.includes('useEffect') &&
        !this.code.includes('React.memo') &&
        this.code.includes('props')) {
      issues.push({
        severity: 'low',
        pattern: 'Pure component optimization',
        description: 'Pure components could benefit from React.memo for performance',
        fixedByLayer: 6,
        type: 'performance'
      });
    }

    // Missing prop validation
    if (this.code.includes('export default function') && 
        this.code.includes('props') &&
        !this.code.includes('interface') &&
        !this.code.includes('type Props')) {
      issues.push({
        severity: 'medium',
        pattern: 'Missing prop validation',
        description: 'Components should have TypeScript interfaces for prop validation',
        fixedByLayer: 6,
        type: 'typescript'
      });
    }
  }
}
