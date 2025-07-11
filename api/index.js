const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param } = require('express-validator');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');
const cleanup = require('node-cleanup');

const app = express();

// Global configuration
const config = {
  api: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    timeout: parseInt(process.env.TIMEOUT) || 45000,
    rateLimit: parseInt(process.env.RATE_LIMIT) || 100,
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT) || 5
  },
  temp: {
    directory: process.env.TEMP_DIR || path.join(__dirname, 'temp'),
    cleanup: parseInt(process.env.CLEANUP_INTERVAL) || 3600000 // 1 hour
  }
};

// Active operations tracking
const activeOperations = new Map();
const activeTempFiles = new Set();
let currentOperations = 0;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://neurolint.dev',
      'https://www.neurolint.dev',
      'https://app.neurolint.dev',
      'https://api.neurolint.dev'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/', createRateLimit(15 * 60 * 1000, config.api.rateLimit, 'Too many API requests'));
app.use('/api/v1/transform', createRateLimit(5 * 60 * 1000, 10, 'Too many transformation requests'));
app.use('/api/v1/upload', createRateLimit(10 * 60 * 1000, 5, 'Too many file uploads'));

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing with size limits
app.use(express.json({ 
  limit: config.api.maxFileSize,
  verify: (req, res, buf) => {
    if (buf.length > 10 * 1024 * 1024) { // 10MB
      throw new Error('Request entity too large');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: config.api.maxFileSize }));

// Input validation middleware
const validateCode = [
  body('code')
    .isString()
    .withMessage('Code must be a string')
    .isLength({ min: 1, max: 1000000 })
    .withMessage('Code must be between 1 and 1,000,000 characters')
    .custom((value) => {
      // Check for potentially dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /require\s*\(\s*['"](child_process|fs|path)['"]\s*\)/,
        /process\s*\.\s*(exit|kill)/,
        /\$\{.*\}/,
        /__proto__/,
        /constructor\s*\[/
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Code contains potentially dangerous patterns');
        }
      }
      return true;
    })
];

const validateLayers = [
  body('enabledLayers')
    .optional()
    .isArray()
    .withMessage('enabledLayers must be an array')
    .custom((layers) => {
      if (!Array.isArray(layers)) return true;
      if (layers.length === 0) throw new Error('At least one layer must be enabled');
      if (layers.length > 6) throw new Error('Maximum 6 layers allowed');
      
      for (const layer of layers) {
        if (!Number.isInteger(layer) || layer < 1 || layer > 6) {
          throw new Error('Layer IDs must be integers between 1 and 6');
        }
      }
      return true;
    })
];

const validateLayerId = [
  param('layerId')
    .isInt({ min: 1, max: 6 })
    .withMessage('Layer ID must be an integer between 1 and 6')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Concurrency control middleware
const concurrencyControl = (req, res, next) => {
  if (currentOperations >= config.api.maxConcurrent) {
    return res.status(503).json({
      error: 'Server busy',
      code: 'MAX_CONCURRENT_EXCEEDED',
      message: 'Too many concurrent operations. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  
  currentOperations++;
  const operationId = crypto.randomUUID();
  activeOperations.set(operationId, {
    startTime: Date.now(),
    endpoint: req.path,
    ip: req.ip
  });
  
  req.operationId = operationId;
  
  res.on('finish', () => {
    currentOperations--;
    activeOperations.delete(operationId);
  });
  
  next();
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue', '.svelte'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      return cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
    
    // Additional security checks
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename'), false);
    }
    
    cb(null, true);
  }
});

// Secure temp file management
async function createSecureTempFile(content, extension = '.js') {
  await fs.mkdir(config.temp.directory, { recursive: true });
  
  const filename = `neurolint-${crypto.randomUUID()}${extension}`;
  const filepath = path.join(config.temp.directory, filename);
  
  // Security check: ensure we're writing within temp directory
  const resolvedPath = path.resolve(filepath);
  const resolvedTempDir = path.resolve(config.temp.directory);
  
  if (!resolvedPath.startsWith(resolvedTempDir)) {
    throw new Error('Invalid file path');
  }
  
  await fs.writeFile(filepath, content, { mode: 0o600 }); // Owner read/write only
  activeTempFiles.add(filepath);
  
  return filepath;
}

async function cleanupTempFile(filepath) {
  try {
    await fs.unlink(filepath);
    activeTempFiles.delete(filepath);
  } catch (error) {
    console.error('Failed to cleanup temp file:', filepath, error.message);
  }
}

// Secure script execution
async function executeScript(scriptName, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Script execution timeout'));
    }, options.timeout || config.api.timeout);
    
    const child = spawn('node', [scriptName, ...args], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Script failed with code ${code}: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Script execution failed: ${error.message}`));
    });
  });
}

// Layer script integration with fallback transformations
async function executeLayerTransformation(layerId, code, options = {}) {
  const tempFile = await createSecureTempFile(code);
  
  try {
    // First try to execute the actual layer script
    try {
      const result = await executeScript(`fix-layer-${layerId}-*.js`, [
        `--input=${tempFile}`,
        '--mode=api'
      ], { timeout: 30000 });
      
      const transformedCode = await fs.readFile(tempFile, 'utf8');
      
      return {
        success: true,
        transformedCode,
        originalCode: code,
        executionTime: 0,
        changeCount: transformedCode !== code ? 1 : 0,
        method: 'script'
      };
    } catch (scriptError) {
      console.warn(`Layer ${layerId} script failed, using fallback:`, scriptError.message);
      
      // Fallback to built-in transformations
      const transformedCode = await applyLayerFallback(layerId, code);
      
      return {
        success: true,
        transformedCode,
        originalCode: code,
        executionTime: 0,
        changeCount: transformedCode !== code ? 1 : 0,
        method: 'fallback',
        warning: 'Used fallback transformation'
      };
    }
  } finally {
    await cleanupTempFile(tempFile);
  }
}

// Fallback transformations for each layer
async function applyLayerFallback(layerId, code) {
  switch (layerId) {
    case 1: // Configuration
      return applyConfigurationFixes(code);
    case 2: // Pattern Recognition
      return applyPatternFixes(code);
    case 3: // Component Enhancement
      return applyComponentFixes(code);
    case 4: // Hydration & SSR
      return applyHydrationFixes(code);
    case 5: // Next.js App Router
      return applyNextjsFixes(code);
    case 6: // Testing & Validation
      return applyTestingFixes(code);
    default:
      return code;
  }
}

function applyConfigurationFixes(code) {
  // TypeScript target upgrade
  if (code.includes('"target": "es5"')) {
    code = code.replace('"target": "es5"', '"target": "ES2020"');
  }
  
  // React strict mode
  if (code.includes('reactStrictMode: false')) {
    code = code.replace('reactStrictMode: false', 'reactStrictMode: true');
  }
  
  return code;
}

function applyPatternFixes(code) {
  // HTML entity fixes
  const entities = {
    '&quot;': '"',
    '&#x27;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#x2F;': '/',
    '&#x60;': '`'
  };
  
  for (const [entity, char] of Object.entries(entities)) {
    code = code.replace(new RegExp(entity, 'g'), char);
  }
  
  // Console.log to console.debug
  code = code.replace(/console\.log\(/g, 'console.debug(');
  
  // Fix common string concatenation issues
  code = code.replace(/\'\s*\+\s*\'/g, '');
  code = code.replace(/\"\s*\+\s*\"/g, '');
  
  return code;
}

function applyComponentFixes(code) {
  // Add missing key props to map functions
  code = code.replace(
    /\.map\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[^>]*?>)/g,
    (match, item, index, element) => {
      if (!element.includes('key=')) {
        const keyValue = index || `${item}.id || ${item}`;
        return match.replace(element, element.replace('>', ` key={${keyValue}}>`));
      }
      return match;
    }
  );
  
  // Add aria-label to buttons without one
  code = code.replace(
    /<button([^>]*?)>/g,
    (match, attributes) => {
      if (!attributes.includes('aria-label') && !attributes.includes('aria-labelledby')) {
        return `<button${attributes} aria-label="Button">`;
      }
      return match;
    }
  );
  
  // Fix img tags without alt
  code = code.replace(
    /<img([^>]*?)>/g,
    (match, attributes) => {
      if (!attributes.includes('alt=')) {
        return `<img${attributes} alt="">`;
      }
      return match;
    }
  );
  
  return code;
}

function applyHydrationFixes(code) {
  // Add SSR guards for localStorage
  const storageOperations = [
    'localStorage.getItem',
    'localStorage.setItem',
    'localStorage.removeItem',
    'sessionStorage.getItem',
    'sessionStorage.setItem',
    'sessionStorage.removeItem'
  ];
  
  for (const operation of storageOperations) {
    const regex = new RegExp(`\\b${operation.replace('.', '\\.')}\\(`, 'g');
    code = code.replace(regex, `typeof window !== "undefined" && ${operation}(`);
  }
  
  // Add guards for window access
  const windowOperations = [
    'window.matchMedia',
    'window.addEventListener',
    'window.removeEventListener',
    'window.location',
    'window.history'
  ];
  
  for (const operation of windowOperations) {
    const regex = new RegExp(`\\b${operation.replace('.', '\\.')}`, 'g');
    code = code.replace(regex, `typeof window !== "undefined" && ${operation}`);
  }
  
  return code;
}

function applyNextjsFixes(code) {
  const lines = code.split('\n');
  
  // Fix misplaced 'use client' directives
  const useClientIndex = lines.findIndex(line => line.trim() === "'use client';" || line.trim() === '"use client";');
  
  if (useClientIndex > 0) {
    // Remove existing 'use client'
    lines.splice(useClientIndex, 1);
    
    // Add at the top, after any initial comments
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
        insertIndex = i;
        break;
      }
    }
    
    lines.splice(insertIndex, 0, "'use client';", '');
  }
  
  // Fix dynamic imports
  code = lines.join('\n');
  code = code.replace(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, 'import("$1")');
  
  return code;
}

function applyTestingFixes(code) {
  // Add basic error handling for async functions
  if (code.includes('async') && code.includes('await')) {
    // Simple pattern to wrap unprotected async code
    code = code.replace(
      /(async\s+function\s+\w+[^{]*\{(?![^}]*try))/g,
      '$1\n  try {'
    );
    
    // Add catch blocks (very basic)
    if (code.includes('try {') && !code.includes('} catch')) {
      code = code.replace(/(\n\s*}\s*$)/gm, '\n  } catch (error) {\n    console.error("Error:", error);\n    throw error;\n  }\n}');
    }
  }
  
  return code;
}

// API Routes

// Health check with comprehensive status
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeOperations: currentOperations,
      tempFiles: activeTempFiles.size,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Check temp directory
    try {
      await fs.access(config.temp.directory);
      health.tempDirectory = 'accessible';
    } catch (error) {
      health.tempDirectory = 'inaccessible';
      health.status = 'degraded';
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Analyze code endpoint
app.post('/api/v1/analyze', validateCode, handleValidationErrors, async (req, res) => {
  try {
    const { code } = req.body;
    const detectedIssues = [];
    
    // Enhanced analysis patterns
    const analysisPatterns = [
      {
        pattern: /"target":\s*"es5"/,
        layer: 1,
        type: 'config',
        severity: 'high',
        description: 'Outdated ES5 target in TypeScript configuration'
      },
      {
        pattern: /reactStrictMode:\s*false/,
        layer: 1,
        type: 'config',
        severity: 'medium',
        description: 'React strict mode disabled'
      },
      {
        pattern: /&quot;|&#x27;|&amp;|&lt;|&gt;/,
        layer: 2,
        type: 'pattern',
        severity: 'high',
        description: 'HTML entity corruption detected'
      },
      {
        pattern: /console\.log\(/,
        layer: 2,
        type: 'pattern',
        severity: 'low',
        description: 'Console.log statements should be console.debug'
      },
      {
        pattern: /\.map\([^)]*\)\s*=>\s*<[^>]*>/,
        layer: 3,
        type: 'component',
        severity: 'high',
        description: 'Missing key props in map operations',
        validator: (code) => !code.includes('key=')
      },
      {
        pattern: /<button(?![^>]*aria-label)/,
        layer: 3,
        type: 'accessibility',
        severity: 'medium',
        description: 'Missing accessibility attributes on buttons'
      },
      {
        pattern: /localStorage\.|sessionStorage\./,
        layer: 4,
        type: 'hydration',
        severity: 'high',
        description: 'Unguarded storage access (SSR issues)',
        validator: (code) => !code.includes('typeof window')
      },
      {
        pattern: /window\./,
        layer: 4,
        type: 'hydration',
        severity: 'medium',
        description: 'Unguarded window access',
        validator: (code) => !/typeof window/.test(code)
      },
      {
        pattern: /'use client';?\n[^']/,
        layer: 5,
        type: 'nextjs',
        severity: 'high',
        description: 'Misplaced "use client" directive'
      },
      {
        pattern: /async\s+function.*\{(?!.*try)/,
        layer: 6,
        type: 'testing',
        severity: 'medium',
        description: 'Async function without error handling'
      }
    ];
    
    for (const analysis of analysisPatterns) {
      if (analysis.pattern.test(code)) {
        if (!analysis.validator || analysis.validator(code)) {
          detectedIssues.push({
            type: analysis.type,
            severity: analysis.severity,
            description: analysis.description,
            fixedByLayer: analysis.layer,
            pattern: analysis.pattern.source
          });
        }
      }
    }
    
    const recommendedLayers = [...new Set(detectedIssues.map(issue => issue.fixedByLayer))];
    
    res.json({
      detectedIssues,
      recommendedLayers,
      reasoning: detectedIssues.map(issue => `Layer ${issue.fixedByLayer}: ${issue.description}`),
      confidence: detectedIssues.length > 0 ? Math.min(0.9, 0.5 + (detectedIssues.length * 0.1)) : 0.3,
      estimatedImpact: {
        level: detectedIssues.some(i => i.severity === 'high') ? 'high' : 
               detectedIssues.some(i => i.severity === 'medium') ? 'medium' : 'low',
        estimatedFixTime: `${Math.max(30, detectedIssues.length * 15)} seconds`
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      code: 'ANALYSIS_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Transform code endpoint
app.post('/api/v1/transform', 
  validateCode, 
  validateLayers, 
  handleValidationErrors, 
  concurrencyControl,
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { code, enabledLayers = [1, 2, 3, 4, 5, 6], options = {} } = req.body;
      
      let currentCode = code;
      const results = [];
      
      for (const layerId of enabledLayers) {
        const layerStartTime = Date.now();
        const beforeCode = currentCode;
        
        try {
          const result = await executeLayerTransformation(layerId, currentCode, options);
          currentCode = result.transformedCode;
          
          results.push({
            layerId,
            layerName: getLayerName(layerId),
            success: result.success,
            executionTime: Date.now() - layerStartTime,
            changeCount: result.changeCount,
            method: result.method,
            warning: result.warning,
            improvements: result.changeCount > 0 ? 
              [`Applied ${result.changeCount} ${result.method} transformations`] : []
          });
          
        } catch (error) {
          results.push({
            layerId,
            layerName: getLayerName(layerId),
            success: false,
            executionTime: Date.now() - layerStartTime,
            changeCount: 0,
            error: error.message
          });
          
          console.error(`Layer ${layerId} failed:`, error);
        }
      }
      
      const totalExecutionTime = Date.now() - startTime;
      const successfulLayers = results.filter(r => r.success).length;
      
      res.json({
        originalCode: code,
        finalCode: currentCode,
        results,
        successfulLayers,
        totalExecutionTime,
        operationId: req.operationId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Transformation error:', error);
      res.status(500).json({
        error: 'Transformation failed',
        code: 'TRANSFORMATION_ERROR',
        details: error.message,
        operationId: req.operationId,
        timestamp: new Date().toISOString()
      });
    }
  });

// Execute single layer endpoint
app.post('/api/v1/layers/:layerId/execute',
  validateLayerId,
  validateCode,
  handleValidationErrors,
  concurrencyControl,
  async (req, res) => {
    try {
      const layerId = parseInt(req.params.layerId);
      const { code, options = {} } = req.body;
      
      const result = await executeLayerTransformation(layerId, code, options);
      
      res.json({
        layerId,
        layerName: getLayerName(layerId),
        success: result.success,
        transformedCode: result.transformedCode,
        originalCode: result.originalCode,
        executionTime: result.executionTime,
        changeCount: result.changeCount,
        method: result.method,
        warning: result.warning,
        operationId: req.operationId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Layer execution error:', error);
      res.status(500).json({
        layerId: parseInt(req.params.layerId),
        success: false,
        error: error.message,
        operationId: req.operationId,
        timestamp: new Date().toISOString()
      });
    }
  });

// File upload endpoint
app.post('/api/v1/upload', upload.single('file'), concurrencyControl, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE',
        timestamp: new Date().toISOString()
      });
    }
    
    const code = req.file.buffer.toString('utf8');
    const enabledLayers = req.body.enabledLayers ? 
      JSON.parse(req.body.enabledLayers) : [1, 2, 3, 4, 5, 6];
    
    // Validate parsed layers
    if (!Array.isArray(enabledLayers) || enabledLayers.some(l => !Number.isInteger(l) || l < 1 || l > 6)) {
      return res.status(400).json({
        error: 'Invalid enabledLayers format',
        code: 'INVALID_LAYERS',
        timestamp: new Date().toISOString()
      });
    }
    
    let currentCode = code;
    const results = [];
    const startTime = Date.now();
    
    for (const layerId of enabledLayers) {
      const layerStartTime = Date.now();
      
      try {
        const result = await executeLayerTransformation(layerId, currentCode, { verbose: true });
        currentCode = result.transformedCode;
        
        results.push({
          layerId,
          layerName: getLayerName(layerId),
          success: result.success,
          executionTime: Date.now() - layerStartTime,
          changeCount: result.changeCount,
          method: result.method,
          warning: result.warning
        });
        
      } catch (error) {
        results.push({
          layerId,
          layerName: getLayerName(layerId),
          success: false,
          executionTime: Date.now() - layerStartTime,
          changeCount: 0,
          error: error.message
        });
      }
    }
    
    res.json({
      originalCode: code,
      finalCode: currentCode,
      results,
      successfulLayers: results.filter(r => r.success).length,
      totalExecutionTime: Date.now() - startTime,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      operationId: req.operationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'File processing failed',
      code: 'FILE_PROCESSING_ERROR',
      details: error.message,
      operationId: req.operationId,
      timestamp: new Date().toISOString()
    });
  }
});

// Get smart recommendations
app.post('/api/v1/recommend', validateCode, handleValidationErrors, async (req, res) => {
  try {
    const { code } = req.body;
    
    // Use the same analysis logic as /analyze but format for recommendations
    const analysisResponse = await new Promise((resolve) => {
      const mockReq = { body: { code } };
      const mockRes = {
        json: (data) => resolve(data)
      };
      
      // Reuse analysis logic
      const detectedIssues = [];
      
      // Same patterns as in analyze endpoint
      if (/"target":\s*"es5"/.test(code)) {
        detectedIssues.push({ fixedByLayer: 1, description: 'Outdated TypeScript configuration' });
      }
      if (/&quot;|&#x27;|&amp;/.test(code)) {
        detectedIssues.push({ fixedByLayer: 2, description: 'HTML entity corruption' });
      }
      if (/\.map\([^)]*\)\s*=>\s*<[^>]*>/.test(code) && !code.includes('key=')) {
        detectedIssues.push({ fixedByLayer: 3, description: 'Missing React keys' });
      }
      if (/localStorage\.|sessionStorage\./.test(code) && !code.includes('typeof window')) {
        detectedIssues.push({ fixedByLayer: 4, description: 'SSR hydration issues' });
      }
      if (/'use client';?\n[^']/.test(code)) {
        detectedIssues.push({ fixedByLayer: 5, description: 'Misplaced use client directive' });
      }
      if (/async\s+function.*\{(?!.*try)/.test(code)) {
        detectedIssues.push({ fixedByLayer: 6, description: 'Missing error handling' });
      }
      
      const recommendedLayers = [...new Set(detectedIssues.map(issue => issue.fixedByLayer))];
      
      resolve({
        recommendedLayers,
        reasoning: detectedIssues.map(issue => `Layer ${issue.fixedByLayer}: ${issue.description}`)
      });
    });
    
    res.json({
      ...analysisResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Recommendation failed',
      code: 'RECOMMENDATION_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Validate transformation
app.post('/api/v1/validate', [
  body('originalCode').isString().notEmpty(),
  body('transformedCode').isString().notEmpty()
], handleValidationErrors, async (req, res) => {
  try {
    const { originalCode, transformedCode } = req.body;
    
    const errors = [];
    const warnings = [];
    
    // Basic validation checks
    if (transformedCode.length < originalCode.length * 0.3) {
      warnings.push('Significant code reduction detected - please review carefully');
    }
    
    if (transformedCode.includes('undefined') && !originalCode.includes('undefined')) {
      errors.push('Transformation may have introduced undefined values');
    }
    
    // Check for broken syntax patterns
    const syntaxPatterns = [
      { pattern: /\{\s*\}/, description: 'Empty object literal' },
      { pattern: /\[\s*\]/, description: 'Empty array literal' },
      { pattern: /\(\s*\)/, description: 'Empty function call' },
      { pattern: /function\s*\(\s*\)\s*\{\s*\}/, description: 'Empty function' }
    ];
    
    for (const { pattern, description } of syntaxPatterns) {
      const originalCount = (originalCode.match(pattern) || []).length;
      const transformedCount = (transformedCode.match(pattern) || []).length;
      
      if (transformedCount > originalCount * 2) {
        warnings.push(`Increased ${description} patterns detected`);
      }
    }
    
    // Check for common corruption patterns
    if (transformedCode.includes('}}}}') || transformedCode.includes(')))') || transformedCode.includes(';;;')) {
      errors.push('Potential syntax corruption detected');
    }
    
    res.json({
      isValid: errors.length === 0,
      errors,
      warnings,
      statistics: {
        originalLength: originalCode.length,
        transformedLength: transformedCode.length,
        reduction: Math.round(((originalCode.length - transformedCode.length) / originalCode.length) * 100)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Dashboard metrics endpoint
app.get('/api/v1/dashboard/metrics', (req, res) => {
  // In a real implementation, this would query a database
  const now = new Date();
  const mockData = {
    totalTransformations: 0,
    successRate: 0,
    averageExecutionTime: 0,
    layerUsage: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    },
    recentTransformations: [],
    quota: {
      used: 0,
      total: 1000,
      renewsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  };

  res.json(mockData);
});

// Projects endpoint
app.get('/api/v1/projects', (req, res) => {
  // In a real implementation, this would query a database
  const mockProjects = [];
  
  res.json({ 
    projects: mockProjects,
    total: mockProjects.length
  });
});

// Health check endpoint with system status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeOperations: currentOperations,
    tempFiles: activeTempFiles.size
  });
});

// Helper function to get layer names
function getLayerName(layerId) {
  const names = {
    1: 'Configuration Fixes',
    2: 'Pattern Recognition',
    3: 'Component Enhancement',
    4: 'Hydration & SSR',
    5: 'Next.js App Router',
    6: 'Testing & Validation'
  };
  return names[layerId] || `Layer ${layerId}`;
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('API Error:', {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request entity too large',
      code: 'ENTITY_TOO_LARGE',
      maxSize: config.api.maxFileSize,
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      code: 'FILE_TOO_LARGE',
      maxSize: '10MB',
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Cleanup on exit
cleanup((exitCode, signal) => {
  console.log('Cleaning up temp files...');
  activeTempFiles.forEach(file => {
    try {
      require('fs').unlinkSync(file);
    } catch (e) {
      console.error('Failed to cleanup:', file);
    }
  });
});

// Auto-cleanup temp files periodically
setInterval(async () => {
  try {
    const files = await fs.readdir(config.temp.directory);
    const now = Date.now();
    
    for (const file of files) {
      const filepath = path.join(config.temp.directory, file);
      const stats = await fs.stat(filepath);
      
      // Delete files older than 1 hour
      if (now - stats.mtime.getTime() > config.temp.cleanup) {
        await cleanupTempFile(filepath);
      }
    }
  } catch (error) {
    console.error('Auto-cleanup error:', error.message);
  }
}, config.temp.cleanup);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 NeuroLint API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;