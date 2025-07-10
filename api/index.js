const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue', '.svelte'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Utility function to execute layer scripts
async function executeLayerScript(layerId, code, tempDir) {
  const scriptPath = path.join(__dirname, '..', `fix-layer-${layerId}-*.js`);
  const scriptFiles = require('glob').sync(scriptPath);
  
  if (scriptFiles.length === 0) {
    throw new Error(`Layer ${layerId} script not found`);
  }

  const scriptFile = scriptFiles[0];
  const tempFile = path.join(tempDir, `temp-${Date.now()}.js`);
  
  // Write code to temp file
  await fs.writeFile(tempFile, code);
  
  try {
    // Execute the layer script
    const result = execSync(`node ${scriptFile} --file=${tempFile} --output=json`, {
      encoding: 'utf8',
      timeout: 30000,
      cwd: path.join(__dirname, '..')
    });
    
    // Read the transformed code
    const transformedCode = await fs.readFile(tempFile, 'utf8');
    
    return {
      success: true,
      transformedCode,
      metadata: result ? JSON.parse(result) : {}
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      transformedCode: code // Return original code on failure
    };
  } finally {
    // Cleanup temp file
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Execute master script with all layers
async function executeMasterScript(code, enabledLayers = [1, 2, 3, 4, 5, 6], options = {}) {
  const tempDir = path.join(__dirname, 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  const tempFile = path.join(tempDir, `master-${Date.now()}.js`);
  
  try {
    // Write code to temp file
    await fs.writeFile(tempFile, code);
    
    const layerArgs = enabledLayers.join(',');
    const dryRun = options.dryRun ? '--dry-run' : '';
    const verbose = options.verbose ? '--verbose' : '';
    
    const command = `node fix-master.js --file=${tempFile} --layers=${layerArgs} ${dryRun} ${verbose} --output=json`;
    
    const result = execSync(command, {
      encoding: 'utf8',
      timeout: 60000,
      cwd: path.join(__dirname, '..')
    });
    
    // Read the transformed code
    const transformedCode = await fs.readFile(tempFile, 'utf8');
    
    return {
      success: true,
      finalCode: transformedCode,
      originalCode: code,
      results: JSON.parse(result || '[]'),
      successfulLayers: enabledLayers.length,
      totalExecutionTime: 0 // Will be calculated by master script
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      finalCode: code,
      originalCode: code,
      results: [],
      successfulLayers: 0,
      totalExecutionTime: 0
    };
  } finally {
    // Cleanup
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analyze code endpoint
app.post('/api/v1/analyze', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required and must be a string' });
    }

    // Simple analysis - detect issues that each layer can fix
    const detectedIssues = [];
    
    // Layer 1 issues
    if (code.includes('"target": "es5"') || code.includes('reactStrictMode: false')) {
      detectedIssues.push({
        type: 'config',
        severity: 'high',
        description: 'Outdated configuration detected',
        fixedByLayer: 1
      });
    }
    
    // Layer 2 issues
    if (code.includes('&quot;') || code.includes('&amp;') || code.includes('console.log')) {
      detectedIssues.push({
        type: 'pattern',
        severity: 'medium',
        description: 'HTML entities and patterns need cleanup',
        fixedByLayer: 2
      });
    }
    
    // Layer 3 issues
    if (code.includes('.map(') && !code.includes('key=')) {
      detectedIssues.push({
        type: 'component',
        severity: 'high',
        description: 'Missing key props in map operations',
        fixedByLayer: 3
      });
    }
    
    // Layer 4 issues
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      detectedIssues.push({
        type: 'hydration',
        severity: 'high',
        description: 'Unguarded localStorage usage',
        fixedByLayer: 4
      });
    }
    
    // Layer 5 issues
    const lines = code.split('\n');
    const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
    if (useClientIndex > 0) {
      detectedIssues.push({
        type: 'nextjs',
        severity: 'medium',
        description: 'Misplaced "use client" directive',
        fixedByLayer: 5
      });
    }
    
    const recommendedLayers = [...new Set(detectedIssues.map(issue => issue.fixedByLayer))];
    
    res.json({
      detectedIssues,
      recommendedLayers,
      reasoning: detectedIssues.map(issue => `Layer ${issue.fixedByLayer}: ${issue.description}`),
      confidence: detectedIssues.length > 0 ? 0.8 : 0.3
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// Transform code endpoint
app.post('/api/v1/transform', async (req, res) => {
  try {
    const { code, enabledLayers = [1, 2, 3, 4, 5, 6], options = {} } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required and must be a string' });
    }

    const result = await executeMasterScript(code, enabledLayers, options);
    
    res.json(result);
    
  } catch (error) {
    console.error('Transformation error:', error);
    res.status(500).json({ error: 'Transformation failed', details: error.message });
  }
});

// Execute single layer endpoint
app.post('/api/v1/layers/:layerId/execute', async (req, res) => {
  try {
    const { layerId } = req.params;
    const { code, options = {} } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required and must be a string' });
    }

    const layerNum = parseInt(layerId);
    if (isNaN(layerNum) || layerNum < 1 || layerNum > 6) {
      return res.status(400).json({ error: 'Invalid layer ID. Must be 1-6' });
    }

    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const result = await executeLayerScript(layerNum, code, tempDir);
    
    res.json({
      layerId: layerNum,
      success: result.success,
      transformedCode: result.transformedCode,
      error: result.error,
      executionTime: 0,
      changeCount: result.transformedCode !== code ? 1 : 0
    });
    
  } catch (error) {
    console.error('Layer execution error:', error);
    res.status(500).json({ 
      layerId: parseInt(req.params.layerId),
      success: false,
      error: error.message,
      executionTime: 0,
      changeCount: 0
    });
  }
});

// File upload endpoint
app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const code = req.file.buffer.toString('utf8');
    const enabledLayers = req.body.enabledLayers ? 
      JSON.parse(req.body.enabledLayers) : [1, 2, 3, 4, 5, 6];
    
    const result = await executeMasterScript(code, enabledLayers, {
      verbose: true,
      dryRun: false
    });
    
    res.json({
      ...result,
      originalFileName: req.file.originalname,
      fileSize: req.file.size
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File processing failed', details: error.message });
  }
});

// Get smart recommendations
app.post('/api/v1/recommend', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required and must be a string' });
    }

    // Analyze and recommend layers based on detected issues
    const analysisResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    const analysis = await analysisResponse.json();
    
    res.json({
      recommendedLayers: analysis.recommendedLayers,
      reasoning: analysis.reasoning
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Recommendation failed', details: error.message });
  }
});

// Validate transformation
app.post('/api/v1/validate', async (req, res) => {
  try {
    const { originalCode, transformedCode } = req.body;
    
    if (!originalCode || !transformedCode) {
      return res.status(400).json({ error: 'Both originalCode and transformedCode are required' });
    }

    // Basic validation
    const errors = [];
    const warnings = [];
    
    // Check if code is still valid
    try {
      // Simple syntax check for common issues
      if (transformedCode.includes('undefined') && !originalCode.includes('undefined')) {
        errors.push('Transformation may have introduced undefined values');
      }
      
      if (transformedCode.length < originalCode.length * 0.5) {
        warnings.push('Significant code reduction detected - please review');
      }
      
    } catch (e) {
      errors.push('Syntax validation failed');
    }
    
    res.json({
      isValid: errors.length === 0,
      errors,
      warnings
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed', details: error.message });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`NeuroLint API server running on port ${PORT}`);
  });
}

module.exports = app;