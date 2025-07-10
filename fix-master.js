#!/usr/bin/env node

/**
 * Master Automated Fixing Script
 * Comprehensive multi-layer fix strategy for React/Next.js codebases
 * 
 * Layer 1: Configuration fixes (TypeScript, Next.js, package.json)
 * Layer 2: Bulk pattern fixes (imports, types, HTML entities)
 * Layer 3: Component-specific fixes (Button variants, Tabs props, etc.)
 * Layer 4: Hydration and SSR fixes (client-side guards, theme providers)
 * Layer 5: Next.js App Router fixes
 * Layer 6: Testing and Validation Fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Comprehensive Automated Fixing System');
console.log('================================================');

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  outputJson: process.argv.includes('--output=json'),
  skipLayers: process.argv.includes('--skip-layers') ? 
    process.argv[process.argv.indexOf('--skip-layers') + 1]?.split(',') || [] : [],
  enabledLayers: process.argv.includes('--layers') ?
    process.argv[process.argv.indexOf('--layers') + 1]?.split(',').map(Number) || [1,2,3,4,5,6] : [1,2,3,4,5,6],
  inputFile: process.argv.includes('--file') ?
    process.argv[process.argv.indexOf('--file') + 1] : null,
  targetDir: process.cwd()
};

// Utility functions
function log(message, level = 'info') {
  if (config.outputJson) return; // Suppress logs in JSON mode
  
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    'info': '📝',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌',
    'debug': '🔍'
  }[level] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, description) {
  try {
    log(`Running: ${description}`, 'info');
    if (!config.dryRun) {
      const result = execSync(command, { 
        cwd: config.targetDir, 
        encoding: 'utf8',
        stdio: config.verbose ? 'inherit' : 'pipe'
      });
      log(`Completed: ${description}`, 'success');
      return result;
    } else {
      log(`[DRY RUN] Would run: ${command}`, 'debug');
      return '';
    }
  } catch (error) {
    log(`Failed: ${description} - ${error.message}`, 'error');
    return null;
  }
}

// Process single file mode (for API)
async function processSingleFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  let currentContent = originalContent;
  const results = [];
  const startTime = Date.now();

  for (const layerId of config.enabledLayers) {
    if (config.skipLayers.includes(layerId.toString())) {
      continue;
    }

    const layerStartTime = Date.now();
    const beforeContent = currentContent;
    
    try {
      // Apply layer transformation
      currentContent = await applyLayerToContent(layerId, currentContent, filePath);
      
      const changeCount = beforeContent !== currentContent ? 1 : 0;
      const executionTime = Date.now() - layerStartTime;

      results.push({
        layerId,
        layerName: getLayerName(layerId),
        success: true,
        executionTime,
        changeCount,
        improvements: changeCount > 0 ? [`Layer ${layerId} applied successfully`] : []
      });

      log(`Layer ${layerId} completed: ${changeCount} changes`, changeCount > 0 ? 'success' : 'info');
      
    } catch (error) {
      const executionTime = Date.now() - layerStartTime;
      
      results.push({
        layerId,
        layerName: getLayerName(layerId),
        success: false,
        executionTime,
        changeCount: 0,
        error: error.message
      });

      log(`Layer ${layerId} failed: ${error.message}`, 'error');
      // Continue with next layer
    }
  }

  // Write the transformed content back to file
  if (currentContent !== originalContent && !config.dryRun) {
    fs.writeFileSync(filePath, currentContent);
  }

  const totalExecutionTime = Date.now() - startTime;
  const successfulLayers = results.filter(r => r.success).length;

  return {
    originalCode: originalContent,
    finalCode: currentContent,
    results,
    successfulLayers,
    totalExecutionTime
  };
}

// Apply individual layer transformation to content
async function applyLayerToContent(layerId, content, filePath) {
  const tempDir = path.join(__dirname, 'temp-api');
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFile = path.join(tempDir, `temp-layer-${layerId}-${Date.now()}.js`);
  
  try {
    // Write content to temp file
    fs.writeFileSync(tempFile, content);

    // Apply layer-specific transformations
    switch (layerId) {
      case 1:
        // Configuration layer - for single file mode, apply basic config fixes
        content = applyConfigFixes(content);
        break;
      case 2:
        // Pattern fixes
        content = applyPatternFixes(content);
        break;
      case 3:
        // Component fixes
        content = applyComponentFixes(content);
        break;
      case 4:
        // Hydration fixes
        content = applyHydrationFixes(content);
        break;
      case 5:
        // Next.js fixes
        content = applyNextjsFixes(content);
        break;
      case 6:
        // Testing fixes
        content = applyTestingFixes(content);
        break;
      default:
        log(`Unknown layer: ${layerId}`, 'warning');
    }

    return content;

  } finally {
    // Cleanup temp file
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Layer-specific transformation functions
function applyConfigFixes(content) {
  // Basic TypeScript target upgrade for single files
  if (content.includes('"target": "es5"')) {
    content = content.replace('"target": "es5"', '"target": "ES2020"');
  }
  return content;
}

function applyPatternFixes(content) {
  // HTML entity fixes
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#x27;/g, "'");
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  
  // Console.log to console.debug
  content = content.replace(/console\.log\(/g, 'console.debug(');
  
  return content;
}

function applyComponentFixes(content) {
  // Add missing key props to map functions
  content = content.replace(
    /\.map\(\s*(\([^)]*\)|[^,)]+)\s*=>\s*(<[^>]*?)>/g,
    (match, param, element) => {
      if (!element.includes('key=')) {
        // Extract component name and add key
        const componentMatch = element.match(/<(\w+)/);
        if (componentMatch) {
          return match.replace(element + '>', element + ` key={${param}.id || ${param}}`);
        }
      }
      return match;
    }
  );

  // Add basic accessibility attributes
  content = content.replace(
    /<button([^>]*?)>/g,
    (match, attributes) => {
      if (!attributes.includes('aria-label')) {
        return `<button${attributes} aria-label="Button">`;
      }
      return match;
    }
  );

  return content;
}

function applyHydrationFixes(content) {
  // Add SSR guards for localStorage
  content = content.replace(
    /localStorage\.getItem\(/g,
    'typeof window !== "undefined" && localStorage.getItem('
  );
  
  content = content.replace(
    /localStorage\.setItem\(/g,
    'typeof window !== "undefined" && localStorage.setItem('
  );

  // Add guards for window access
  content = content.replace(
    /window\.matchMedia\(/g,
    'typeof window !== "undefined" && window.matchMedia('
  );

  return content;
}

function applyNextjsFixes(content) {
  const lines = content.split('\n');
  
  // Fix misplaced 'use client' directives
  const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
  
  if (useClientIndex > 0) {
    // Remove existing 'use client'
    lines.splice(useClientIndex, 1);
    
    // Add at the top, after any comments
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        insertIndex = i;
        break;
      }
    }
    
    lines.splice(insertIndex, 0, "'use client';", '');
  }

  return lines.join('\n');
}

function applyTestingFixes(content) {
  // Add basic error handling for async functions
  if (content.includes('async') && content.includes('await') && !content.includes('try')) {
    content = content.replace(
      /(async\s+function\s+\w+[^{]*{)/g,
      '$1\n  try {'
    ).replace(
      /(\n\s*}$)/g,
      '\n  } catch (error) {\n    console.error("Error:", error);\n  }\n}'
    );
  }

  return content;
}

function getLayerName(layerId) {
  const names = {
    1: 'Configuration',
    2: 'Pattern Recognition',
    3: 'Component Enhancement', 
    4: 'Hydration & SSR',
    5: 'Next.js App Router',
    6: 'Testing & Validation'
  };
  return names[layerId] || `Layer ${layerId}`;
}

// Problem detection system
class ProblemDetector {
  constructor() {
    this.problems = [];
    this.fixes = [];
  }
  
  async detectProblems() {
    log('🔍 Detecting problems across codebase...', 'info');
    
    // Check TypeScript configuration
    await this.checkTypeScriptConfig();
    
    // Check Next.js configuration
    await this.checkNextJsConfig();
    
    // Check for common code issues
    await this.checkCodeIssues();
    
    // Check for missing dependencies
    await this.checkDependencies();
    
    // Check for HTML entity corruption
    await this.checkHtmlEntityCorruption();
    
    // Check for hydration issues
    await this.checkHydrationIssues();
    
    // Check for missing files
    await this.checkMissingFiles();
    
    log(`Found ${this.problems.length} problems`, this.problems.length > 0 ? 'warning' : 'success');
    return this.problems;
  }
  
  async checkTypeScriptConfig() {
    const tsConfigPath = path.join(config.targetDir, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      if (!tsConfig.compilerOptions?.downlevelIteration) {
        this.problems.push({
          type: 'config',
          severity: 'medium',
          file: 'tsconfig.json',
          issue: 'Missing downlevelIteration option',
          fix: 'Add downlevelIteration: true to compilerOptions'
        });
      }
      
      if (tsConfig.compilerOptions?.target === 'es5') {
        this.problems.push({
          type: 'config',
          severity: 'high',
          file: 'tsconfig.json',
          issue: 'Outdated ES5 target',
          fix: 'Update target to ES2020 or higher'
        });
      }
    }
  }
  
  async checkNextJsConfig() {
    const nextConfigPath = path.join(config.targetDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (content.includes('appDir')) {
        this.problems.push({
          type: 'config',
          severity: 'medium',
          file: 'next.config.js',
          issue: 'Deprecated appDir option in experimental',
          fix: 'Remove appDir from experimental options'
        });
      }
    }
  }
  
  async checkCodeIssues() {
    const glob = require('glob');
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
    
    for (const file of files.slice(0, 50)) { // Limit for performance
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for HTML entity corruption
        if (content.includes('&quot;') || content.includes('&#x27;')) {
          this.problems.push({
            type: 'corruption',
            severity: 'high',
            file,
            issue: 'HTML entity corruption detected',
            fix: 'Replace HTML entities with proper characters'
          });
        }
        
        // Check for missing key props
        if (content.includes('.map(') && !content.includes('key=')) {
          this.problems.push({
            type: 'react',
            severity: 'medium',
            file,
            issue: 'Missing key props in map functions',
            fix: 'Add key props to mapped elements'
          });
        }
        
        // Check for unused imports
        const importMatches = content.match(/import.*from/g) || [];
        if (importMatches.length > 10) {
          this.problems.push({
            type: 'imports',
            severity: 'low',
            file,
            issue: 'Potentially many unused imports',
            fix: 'Clean up unused imports'
          });
        }
        
        // Check for corrupted import statements
        if (/import\s*{\s*$|import\s*{\s*\n\s*import/m.test(content)) {
          this.problems.push({
            type: 'corruption',
            severity: 'critical',
            file,
            issue: 'Corrupted import statements detected',
            fix: 'Fix malformed import statements'
          });
        }
        
        // Check for misplaced 'use client' directives
        const lines = content.split('\n');
        const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
        if (useClientIndex > 0) {
          // Check if there are imports before 'use client'
          for (let i = 0; i < useClientIndex; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('//') && !line.startsWith('/*')) {
              this.problems.push({
                type: 'nextjs',
                severity: 'critical',
                file,
                issue: 'Misplaced "use client" directive',
                fix: 'Move "use client" to the top of the file'
              });
              break;
            }
          }
        }
        
        // Check for missing error boundaries in risky components
        if (content.includes('PDF') || content.includes('upload') || content.includes('API')) {
          if (!content.includes('ErrorBoundary') && !content.includes('try')) {
            this.problems.push({
              type: 'reliability',
              severity: 'medium',
              file,
              issue: 'Missing error handling in risky component',
              fix: 'Add error boundary or try-catch blocks'
            });
          }
        }
        
        // Check for accessibility issues
        if (content.includes('<button') && !content.includes('aria-label')) {
          this.problems.push({
            type: 'accessibility',
            severity: 'medium',
            file,
            issue: 'Missing accessibility attributes on buttons',
            fix: 'Add aria-label attributes'
          });
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
  
  async checkDependencies() {
    const packagePath = path.join(config.targetDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check for missing essential dependencies
      const essentialDeps = ['react', 'react-dom'];
      const missingDeps = essentialDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );
      
      missingDeps.forEach(dep => {
        this.problems.push({
          type: 'dependencies',
          severity: 'critical',
          file: 'package.json',
          issue: `Missing essential dependency: ${dep}`,
          fix: `Add ${dep} to dependencies`
        });
      });
    }
  }

  async checkHtmlEntityCorruption() {
    const glob = require('glob');
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
    
    for (const file of files.slice(0, 20)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        const entityCount = (content.match(/&quot;|&#x27;|&amp;|&lt;|&gt;/g) || []).length;
        if (entityCount > 0) {
          this.problems.push({
            type: 'corruption',
            severity: entityCount > 5 ? 'high' : 'medium',
            file,
            issue: `${entityCount} HTML entity corruptions found`,
            fix: 'Use Layer 2 to fix HTML entity corruption'
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  async checkHydrationIssues() {
    const glob = require('glob');
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
    
    for (const file of files.slice(0, 20)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for unguarded localStorage usage
        const localStorageMatches = content.match(/localStorage\./g) || [];
        const guardedMatches = content.match(/typeof window.*localStorage\./g) || [];
        
        if (localStorageMatches.length > guardedMatches.length) {
          this.problems.push({
            type: 'hydration',
            severity: 'high',
            file,
            issue: `${localStorageMatches.length - guardedMatches.length} unguarded localStorage calls`,
            fix: 'Use Layer 4 to add SSR guards'
          });
        }
        
        // Check for unguarded window usage
        const windowMatches = content.match(/\bwindow\./g) || [];
        const guardedWindowMatches = content.match(/typeof window.*window\./g) || [];
        
        if (windowMatches.length > guardedWindowMatches.length) {
          this.problems.push({
            type: 'hydration', 
            severity: 'medium',
            file,
            issue: `${windowMatches.length - guardedWindowMatches.length} unguarded window calls`,
            fix: 'Use Layer 4 to add SSR guards'
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  async checkMissingFiles() {
    const missingFiles = [
      { path: 'public/site.webmanifest', severity: 'low', fix: 'Layer 4 will create web manifest' },
      { path: 'public/robots.txt', severity: 'low', fix: 'Layer 4 will create robots.txt' },
      { path: 'src/components/NoSSR.tsx', severity: 'medium', fix: 'Layer 4 will create NoSSR component' }
    ];
    
    missingFiles.forEach(({ path: filePath, severity, fix }) => {
      if (!fs.existsSync(path.join(config.targetDir, filePath))) {
        this.problems.push({
          type: 'missing-files',
          severity,
          file: filePath,
          issue: `Missing file: ${filePath}`,
          fix
        });
      }
    });
  }

  generateReport() {
    const report = {
      summary: {
        totalProblems: this.problems.length,
        critical: this.problems.filter(p => p.severity === 'critical').length,
        high: this.problems.filter(p => p.severity === 'high').length,
        medium: this.problems.filter(p => p.severity === 'medium').length,
        low: this.problems.filter(p => p.severity === 'low').length
      },
      problems: this.problems,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  generateRecommendations() {
    const recommendations = [];
    const problemTypes = [...new Set(this.problems.map(p => p.type))];
    
    if (problemTypes.includes('corruption')) {
      recommendations.push('Run Layer 2 to fix HTML entity corruption and import issues');
    }
    
    if (problemTypes.includes('react')) {
      recommendations.push('Run Layer 3 to fix React component issues');
    }
    
    if (problemTypes.includes('hydration')) {
      recommendations.push('Run Layer 4 to fix SSR and hydration issues');
    }
    
    if (problemTypes.includes('nextjs')) {
      recommendations.push('Run Layer 5 to fix Next.js App Router issues');
    }
    
    if (problemTypes.includes('config')) {
      recommendations.push('Run Layer 1 to fix configuration issues');
    }
    
    return recommendations;
  }
}

async function executeLayer(layerNumber, description, scriptName) {
  const startTime = Date.now();
  
  log(`Starting ${description}...`, 'info');
  
  try {
    const scriptPath = path.join(__dirname, scriptName);
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${scriptName}`);
    }
    
    const result = runCommand(`node ${scriptPath}`, description);
    const executionTime = Date.now() - startTime;
    
    return {
      layer: layerNumber,
      success: result !== null,
      executionTime,
      description
    };
  } catch (error) {
    return {
      layer: layerNumber,
      success: false,
      executionTime: Date.now() - startTime,
      error: error.message,
      description
    };
  }
}

async function main() {
  try {
    // Handle single file mode (for API)
    if (config.inputFile) {
      const result = await processSingleFile(config.inputFile);
      
      if (config.outputJson) {
        console.log(JSON.stringify(result));
        return;
      }
      
      log(`Transformation completed for ${config.inputFile}`, 'success');
      log(`Changes applied by ${result.successfulLayers} layers`, 'info');
      return;
    }

    // Original directory-wide processing
    const detector = new ProblemDetector();
    const problems = await detector.detectProblems();
    
    if (problems.length === 0) {
      log('No problems detected! Your codebase looks good.', 'success');
      return;
    }
    
    log(`\nDetected ${problems.length} problems. Running fixes...`, 'info');
    
    const results = [];
    
    // Layer 1: Configuration fixes
    if (config.enabledLayers.includes(1) && !config.skipLayers.includes('1')) {
      const result = await executeLayer(1, 'Configuration Fixes', 'fix-layer-1-config.js');
      results.push(result);
    }
    
    // Layer 2: Pattern fixes  
    if (config.enabledLayers.includes(2) && !config.skipLayers.includes('2')) {
      const result = await executeLayer(2, 'Pattern Fixes', 'fix-layer-2-patterns.js');
      results.push(result);
    }
    
    // Layer 3: Component fixes
    if (config.enabledLayers.includes(3) && !config.skipLayers.includes('3')) {
      const result = await executeLayer(3, 'Component Fixes', 'fix-layer-3-components.js');
      results.push(result);
    }
    
    // Layer 4: Hydration fixes
    if (config.enabledLayers.includes(4) && !config.skipLayers.includes('4')) {
      const result = await executeLayer(4, 'Hydration Fixes', 'fix-layer-4-hydration.js');
      results.push(result);
    }
    
    // Layer 5: Next.js fixes
    if (config.enabledLayers.includes(5) && !config.skipLayers.includes('5')) {
      const result = await executeLayer(5, 'Next.js Fixes', 'fix-layer-5-nextjs.js');
      results.push(result);
    }
    
    // Layer 6: Testing fixes
    if (config.enabledLayers.includes(6) && !config.skipLayers.includes('6')) {
      const result = await executeLayer(6, 'Testing Fixes', 'fix-layer-6-testing.js');
      results.push(result);
    }
    
    // Generate final report
    const successfulLayers = results.filter(r => r.success).length;
    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    
    log(`\n🎉 Fixing completed!`, 'success');
    log(`Successfully executed ${successfulLayers} of ${results.length} layers`, 'success');
    log(`Total execution time: ${(totalExecutionTime / 1000).toFixed(2)} seconds`, 'info');
    
    if (config.outputJson) {
      const jsonOutput = {
        originalCode: '',
        finalCode: '',
        results: results.map(r => ({
          layerId: r.layer,
          layerName: getLayerName(r.layer),
          success: r.success,
          executionTime: r.executionTime,
          changeCount: r.success ? 1 : 0,
          error: r.error,
          improvements: r.success ? [r.description] : []
        })),
        successfulLayers,
        totalExecutionTime
      };
      console.log(JSON.stringify(jsonOutput));
    }
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processSingleFile, applyLayerToContent }; 