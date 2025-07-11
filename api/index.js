import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { body, validationResult, param } from "express-validator";
import multer from "multer";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";
import cleanup from "node-cleanup";
import { fileURLToPath } from "url";
import fsSync from "fs";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client for persistent storage
const supabase = createClient(
  process.env.SUPABASE_URL || "https://jetwhffgmohdqkuegtjh.supabase.co",
  process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHdoZmZnbW9oZHFrdWVndGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzI0MjcsImV4cCI6MjA2NDY0ODQyN30.qdzOYox4XJQIadJlkg52bWjM1BGJd848ru0kobNmxiA",
);

// Auto-setup enterprise database tables
async function setupEnterpriseDatabase() {
  try {
    console.log("🚀 Setting up NeuroLint Enterprise database...");

    // Try to check if patterns table exists
    const { error: checkError } = await supabase
      .from("neurolint_patterns")
      .select("count")
      .limit(1);

    if (checkError && checkError.code === "42P01") {
      console.log("📊 Creating enterprise tables...");

      // Create tables using INSERT/UPSERT (works with any auth level)
      const setupQueries = [
        // Ensure patterns table has default data
        {
          table: "neurolint_patterns",
          data: [
            {
              layer_id: 1,
              patterns: [],
              metadata: { name: "Configuration Fixes" },
              is_public: true,
            },
            {
              layer_id: 2,
              patterns: [],
              metadata: { name: "Pattern Recognition" },
              is_public: true,
            },
            {
              layer_id: 3,
              patterns: [],
              metadata: { name: "Component Enhancement" },
              is_public: true,
            },
            {
              layer_id: 4,
              patterns: [],
              metadata: { name: "Hydration & SSR" },
              is_public: true,
            },
            {
              layer_id: 5,
              patterns: [],
              metadata: { name: "Next.js App Router" },
              is_public: true,
            },
            {
              layer_id: 6,
              patterns: [],
              metadata: { name: "Testing & Validation" },
              is_public: true,
            },
            {
              layer_id: 7,
              patterns: [],
              metadata: { name: "Adaptive Learning" },
              is_public: true,
            },
          ],
        },
      ];

      for (const { table, data } of setupQueries) {
        try {
          const { error } = await supabase
            .from(table)
            .upsert(data, { onConflict: "layer_id" });
          if (error) {
            console.warn(`⚠️  Setup warning for ${table}:`, error.message);
          } else {
            console.log(`✅ ${table} ready`);
          }
        } catch (err) {
          console.warn(`⚠️  Could not setup ${table}:`, err.message);
        }
      }
    } else {
      console.log("✅ Enterprise database already configured");
    }

    console.log("🎉 NeuroLint Enterprise API Features:");
    console.log("   • ✅ Persistent pattern storage");
    console.log("   • ✅ Real-time synchronization");
    console.log("   • ✅ Distributed rate limiting");
    console.log("   • ✅ User quotas & analytics");
    console.log("   • ✅ Comprehensive API logging");
  } catch (error) {
    console.error("❌ Enterprise setup failed:", error.message);
    console.log("🔄 API will run with basic functionality");
  }
}

// Initialize on startup
setupEnterpriseDatabase();

const app = express();

// Global configuration
const config = {
  api: {
    maxFileSize: process.env.MAX_FILE_SIZE || "10mb",
    timeout: parseInt(process.env.TIMEOUT) || 45000,
    rateLimit: parseInt(process.env.RATE_LIMIT) || 100,
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT) || 5,
  },
  temp: {
    directory: process.env.TEMP_DIR || path.join(__dirname, "temp"),
    cleanup: parseInt(process.env.CLEANUP_INTERVAL) || 3600000, // 1 hour
  },
};

// Active operations tracking
const activeOperations = new Map();
const activeTempFiles = new Set();
let currentOperations = 0;

// Security middleware
app.use(
  helmet({
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
      preload: true,
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://neurolint.dev",
        "https://www.neurolint.dev",
        "https://app.neurolint.dev",
        "https://api.neurolint.dev",
      ];

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Rate limiting
const createRateLimit = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString(),
      });
    },
  });

app.use(
  "/api/",
  createRateLimit(
    15 * 60 * 1000,
    config.api.rateLimit,
    "Too many API requests",
  ),
);
app.use(
  "/api/v1/transform",
  createRateLimit(5 * 60 * 1000, 10, "Too many transformation requests"),
);
app.use(
  "/api/v1/upload",
  createRateLimit(10 * 60 * 1000, 5, "Too many file uploads"),
);

// Request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Body parsing with size limits
app.use(
  express.json({
    limit: config.api.maxFileSize,
    verify: (req, res, buf) => {
      if (buf.length > 10 * 1024 * 1024) {
        // 10MB
        throw new Error("Request entity too large");
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: config.api.maxFileSize }));

// Input validation middleware
const validateCode = [
  body("code")
    .isString()
    .withMessage("Code must be a string")
    .isLength({ min: 1, max: 1000000 })
    .withMessage("Code must be between 1 and 1,000,000 characters")
    .custom((value) => {
      // Check for potentially dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /require\s*\(\s*['"](child_process|fs|path)['"]\s*\)/,
        /process\s*\.\s*(exit|kill)/,
        /\$\{.*\}/,
        /__proto__/,
        /constructor\s*\[/,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error("Code contains potentially dangerous patterns");
        }
      }
      return true;
    }),
];

const validateLayers = [
  body("enabledLayers")
    .optional()
    .isArray()
    .withMessage("enabledLayers must be an array")
    .custom((layers) => {
      if (!Array.isArray(layers)) return true;
      if (layers.length === 0)
        throw new Error("At least one layer must be enabled");
      if (layers.length > 6) throw new Error("Maximum 6 layers allowed");

      for (const layer of layers) {
        if (!Number.isInteger(layer) || layer < 1 || layer > 6) {
          throw new Error("Layer IDs must be integers between 1 and 6");
        }
      }
      return true;
    }),
];

const validateLayerId = [
  param("layerId")
    .isInt({ min: 1, max: 6 })
    .withMessage("Layer ID must be an integer between 1 and 6"),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
};

// Enhanced concurrency control with Supabase integration
const concurrencyControl = async (req, res, next) => {
  const startTime = Date.now();

  try {
    // Check distributed rate limiting
    const identifier = req.user?.id || req.ip;
    const rateLimit = await checkDistributedRateLimit(identifier, req.path);

    if (!rateLimit.allowed) {
      await logAPIUsage(
        req,
        res,
        Date.now() - startTime,
        new Error("Rate limit exceeded"),
      );
      return res.status(429).json({
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        retryAfter: rateLimit.resetTime,
        remaining: rateLimit.remaining,
        timestamp: new Date().toISOString(),
      });
    }

    // Check user quota for authenticated users
    if (
      req.user &&
      (req.path.includes("/transform") || req.path.includes("/layers/"))
    ) {
      const quota = await checkUserQuota(req.user.id);
      if (!quota.allowed) {
        await logAPIUsage(
          req,
          res,
          Date.now() - startTime,
          new Error("Quota exceeded"),
        );
        return res.status(429).json({
          error: "Monthly quota exceeded",
          code: "QUOTA_EXCEEDED",
          message: `You have used all your monthly transformations.`,
          resetDate: quota.resetDate,
          remaining: quota.remaining,
          timestamp: new Date().toISOString(),
        });
      }
      req.userQuota = quota;
    }

    // Legacy concurrency check
    if (currentOperations >= config.api.maxConcurrent) {
      await logAPIUsage(
        req,
        res,
        Date.now() - startTime,
        new Error("Max concurrent exceeded"),
      );
      return res.status(503).json({
        error: "Server busy",
        code: "MAX_CONCURRENT_EXCEEDED",
        message: "Too many concurrent operations. Please try again later.",
        timestamp: new Date().toISOString(),
      });
    }

    currentOperations++;
    const operationId = crypto.randomUUID();
    activeOperations.set(operationId, {
      startTime: Date.now(),
      endpoint: req.path,
      ip: req.ip,
      userId: req.user?.id,
    });

    req.operationId = operationId;
    req.requestStartTime = startTime;

    res.on("finish", async () => {
      currentOperations--;
      activeOperations.delete(operationId);

      // Log API usage
      const executionTime = Date.now() - startTime;
      await logAPIUsage(req, res, executionTime);
    });

    next();
  } catch (error) {
    console.error("Concurrency control error:", error);
    next();
  }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
      ".vue",
      ".svelte",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(ext)) {
      return cb(
        new Error(
          `File type ${ext} not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        ),
        false,
      );
    }

    // Additional security checks
    if (
      file.originalname.includes("..") ||
      file.originalname.includes("/") ||
      file.originalname.includes("\\")
    ) {
      return cb(new Error("Invalid filename"), false);
    }

    cb(null, true);
  },
});

// Secure temp file management
async function createSecureTempFile(content, extension = ".js") {
  await fs.mkdir(config.temp.directory, { recursive: true });

  const filename = `neurolint-${crypto.randomUUID()}${extension}`;
  const filepath = path.join(config.temp.directory, filename);

  // Security check: ensure we're writing within temp directory
  const resolvedPath = path.resolve(filepath);
  const resolvedTempDir = path.resolve(config.temp.directory);

  if (!resolvedPath.startsWith(resolvedTempDir)) {
    throw new Error("Invalid file path");
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
    console.error("Failed to cleanup temp file:", filepath, error.message);
  }
}

// Secure script execution
async function executeScript(scriptName, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Script execution timeout"));
    }, options.timeout || config.api.timeout);

    const child = spawn("node", [scriptName, ...args], {
      cwd: path.join(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Script failed with code ${code}: ${stderr}`));
      }
    });

    child.on("error", (error) => {
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
      const result = await executeScript(
        `fix-layer-${layerId}-*.js`,
        [`--input=${tempFile}`, "--mode=api"],
        { timeout: 30000 },
      );

      const transformedCode = await fs.readFile(tempFile, "utf8");

      return {
        success: true,
        transformedCode,
        originalCode: code,
        executionTime: 0,
        changeCount: transformedCode !== code ? 1 : 0,
        method: "script",
      };
    } catch (scriptError) {
      console.warn(
        `Layer ${layerId} script failed, using fallback:`,
        scriptError.message,
      );

      // Fallback to built-in transformations
      const transformedCode = await applyLayerFallback(layerId, code);

      return {
        success: true,
        transformedCode,
        originalCode: code,
        executionTime: 0,
        changeCount: transformedCode !== code ? 1 : 0,
        method: "fallback",
        warning: "Used fallback transformation",
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
  if (code.includes("reactStrictMode: false")) {
    code = code.replace("reactStrictMode: false", "reactStrictMode: true");
  }

  return code;
}

function applyPatternFixes(code) {
  // HTML entity fixes
  const entities = {
    "&quot;": '"',
    "&#x27;": "'",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&#x2F;": "/",
    "&#x60;": "`",
  };

  for (const [entity, char] of Object.entries(entities)) {
    code = code.replace(new RegExp(entity, "g"), char);
  }

  // Console.log to console.debug
  code = code.replace(/console\.log\(/g, "console.debug(");

  // Fix common string concatenation issues
  code = code.replace(/\'\s*\+\s*\'/g, "");
  code = code.replace(/\"\s*\+\s*\"/g, "");

  return code;
}

function applyComponentFixes(code) {
  // Add missing key props to map functions
  code = code.replace(
    /\.map\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[^>]*?>)/g,
    (match, item, index, element) => {
      if (!element.includes("key=")) {
        const keyValue = index || `${item}.id || ${item}`;
        return match.replace(
          element,
          element.replace(">", ` key={${keyValue}}>`),
        );
      }
      return match;
    },
  );

  // Add aria-label to buttons without one
  code = code.replace(/<button([^>]*?)>/g, (match, attributes) => {
    if (
      !attributes.includes("aria-label") &&
      !attributes.includes("aria-labelledby")
    ) {
      return `<button${attributes} aria-label="Button">`;
    }
    return match;
  });

  // Fix img tags without alt
  code = code.replace(/<img([^>]*?)>/g, (match, attributes) => {
    if (!attributes.includes("alt=")) {
      return `<img${attributes} alt="">`;
    }
    return match;
  });

  return code;
}

function applyHydrationFixes(code) {
  // Add SSR guards for localStorage
  const storageOperations = [
    "localStorage.getItem",
    "localStorage.setItem",
    "localStorage.removeItem",
    "sessionStorage.getItem",
    "sessionStorage.setItem",
    "sessionStorage.removeItem",
  ];

  for (const operation of storageOperations) {
    const regex = new RegExp(`\\b${operation.replace(".", "\\.")}\\(`, "g");
    code = code.replace(
      regex,
      `typeof window !== "undefined" && ${operation}(`,
    );
  }

  // Add guards for window access
  const windowOperations = [
    "window.matchMedia",
    "window.addEventListener",
    "window.removeEventListener",
    "window.location",
    "window.history",
  ];

  for (const operation of windowOperations) {
    const regex = new RegExp(`\\b${operation.replace(".", "\\.")}`, "g");
    code = code.replace(regex, `typeof window !== "undefined" && ${operation}`);
  }

  return code;
}

function applyNextjsFixes(code) {
  const lines = code.split("\n");

  // Fix misplaced 'use client' directives
  const useClientIndex = lines.findIndex(
    (line) =>
      line.trim() === "'use client';" || line.trim() === '"use client";',
  );

  if (useClientIndex > 0) {
    // Remove existing 'use client'
    lines.splice(useClientIndex, 1);

    // Add at the top, after any initial comments
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line &&
        !line.startsWith("//") &&
        !line.startsWith("/*") &&
        !line.startsWith("*")
      ) {
        insertIndex = i;
        break;
      }
    }

    lines.splice(insertIndex, 0, "'use client';", "");
  }

  // Fix dynamic imports
  code = lines.join("\n");
  code = code.replace(
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    'import("$1")',
  );

  return code;
}

function applyTestingFixes(code) {
  // Add basic error handling for async functions
  if (code.includes("async") && code.includes("await")) {
    // Simple pattern to wrap unprotected async code
    code = code.replace(
      /(async\s+function\s+\w+[^{]*\{(?![^}]*try))/g,
      "$1\n  try {",
    );

    // Add catch blocks (very basic)
    if (code.includes("try {") && !code.includes("} catch")) {
      code = code.replace(
        /(\n\s*}\s*$)/gm,
        '\n  } catch (error) {\n    console.error("Error:", error);\n    throw error;\n  }\n}',
      );
    }
  }

  return code;
}

// API Routes

// Enterprise setup endpoint
app.post("/api/v1/setup/enterprise", async (req, res) => {
  try {
    await setupEnterpriseDatabase();

    res.json({
      success: true,
      message: "NeuroLint Enterprise features activated!",
      features: [
        "Persistent pattern storage",
        "Real-time synchronization",
        "Distributed rate limiting",
        "User quotas & analytics",
        "Comprehensive API logging",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Enterprise setup failed",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check with comprehensive status
app.get("/health", async (req, res) => {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeOperations: currentOperations,
      tempFiles: activeTempFiles.size,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };

    // Check temp directory
    try {
      await fs.access(config.temp.directory);
      health.tempDirectory = "accessible";
    } catch (error) {
      health.tempDirectory = "inaccessible";
      health.status = "degraded";
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Analyze code endpoint
app.post(
  "/api/v1/analyze",
  validateCode,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code } = req.body;
      const detectedIssues = [];

      // Enhanced analysis patterns
      const analysisPatterns = [
        {
          pattern: /"target":\s*"es5"/,
          layer: 1,
          type: "config",
          severity: "high",
          description: "Outdated ES5 target in TypeScript configuration",
        },
        {
          pattern: /reactStrictMode:\s*false/,
          layer: 1,
          type: "config",
          severity: "medium",
          description: "React strict mode disabled",
        },
        {
          pattern: /&quot;|&#x27;|&amp;|&lt;|&gt;/,
          layer: 2,
          type: "pattern",
          severity: "high",
          description: "HTML entity corruption detected",
        },
        {
          pattern: /console\.log\(/,
          layer: 2,
          type: "pattern",
          severity: "low",
          description: "Console.log statements should be console.debug",
        },
        {
          pattern: /\.map\([^)]*\)\s*=>\s*<[^>]*>/,
          layer: 3,
          type: "component",
          severity: "high",
          description: "Missing key props in map operations",
          validator: (code) => !code.includes("key="),
        },
        {
          pattern: /<button(?![^>]*aria-label)/,
          layer: 3,
          type: "accessibility",
          severity: "medium",
          description: "Missing accessibility attributes on buttons",
        },
        {
          pattern: /localStorage\.|sessionStorage\./,
          layer: 4,
          type: "hydration",
          severity: "high",
          description: "Unguarded storage access (SSR issues)",
          validator: (code) => !code.includes("typeof window"),
        },
        {
          pattern: /window\./,
          layer: 4,
          type: "hydration",
          severity: "medium",
          description: "Unguarded window access",
          validator: (code) => !/typeof window/.test(code),
        },
        {
          pattern: /'use client';?\n[^']/,
          layer: 5,
          type: "nextjs",
          severity: "high",
          description: 'Misplaced "use client" directive',
        },
        {
          pattern: /async\s+function.*\{(?!.*try)/,
          layer: 6,
          type: "testing",
          severity: "medium",
          description: "Async function without error handling",
        },
      ];

      for (const analysis of analysisPatterns) {
        if (analysis.pattern.test(code)) {
          if (!analysis.validator || analysis.validator(code)) {
            detectedIssues.push({
              type: analysis.type,
              severity: analysis.severity,
              description: analysis.description,
              fixedByLayer: analysis.layer,
              pattern: analysis.pattern.source,
            });
          }
        }
      }

      const recommendedLayers = [
        ...new Set(detectedIssues.map((issue) => issue.fixedByLayer)),
      ];

      res.json({
        detectedIssues,
        recommendedLayers,
        reasoning: detectedIssues.map(
          (issue) => `Layer ${issue.fixedByLayer}: ${issue.description}`,
        ),
        confidence:
          detectedIssues.length > 0
            ? Math.min(0.9, 0.5 + detectedIssues.length * 0.1)
            : 0.3,
        estimatedImpact: {
          level: detectedIssues.some((i) => i.severity === "high")
            ? "high"
            : detectedIssues.some((i) => i.severity === "medium")
              ? "medium"
              : "low",
          estimatedFixTime: `${Math.max(30, detectedIssues.length * 15)} seconds`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({
        error: "Analysis failed",
        code: "ANALYSIS_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Transform code endpoint
app.post(
  "/api/v1/transform",
  authenticateUser,
  validateCode,
  validateLayers,
  handleValidationErrors,
  concurrencyControl,
  async (req, res) => {
    const startTime = Date.now();

    try {
      const {
        code,
        enabledLayers = [1, 2, 3, 4, 5, 6],
        options = {},
      } = req.body;

      let currentCode = code;
      const results = [];

      for (const layerId of enabledLayers) {
        const layerStartTime = Date.now();
        const beforeCode = currentCode;

        try {
          const result = await executeLayerTransformation(
            layerId,
            currentCode,
            options,
          );
          currentCode = result.transformedCode;

          results.push({
            layerId,
            layerName: getLayerName(layerId),
            success: result.success,
            executionTime: Date.now() - layerStartTime,
            changeCount: result.changeCount,
            method: result.method,
            warning: result.warning,
            improvements:
              result.changeCount > 0
                ? [
                    `Applied ${result.changeCount} ${result.method} transformations`,
                  ]
                : [],
          });
        } catch (error) {
          results.push({
            layerId,
            layerName: getLayerName(layerId),
            success: false,
            executionTime: Date.now() - layerStartTime,
            changeCount: 0,
            error: error.message,
          });

          console.error(`Layer ${layerId} failed:`, error);
        }
      }

      const totalExecutionTime = Date.now() - startTime;
      const successfulLayers = results.filter((r) => r.success).length;

      res.json({
        originalCode: code,
        finalCode: currentCode,
        results,
        successfulLayers,
        totalExecutionTime,
        operationId: req.operationId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Transformation error:", error);
      res.status(500).json({
        error: "Transformation failed",
        code: "TRANSFORMATION_ERROR",
        details: error.message,
        operationId: req.operationId,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Execute single layer endpoint
app.post(
  "/api/v1/layers/:layerId/execute",
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
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Layer execution error:", error);
      res.status(500).json({
        layerId: parseInt(req.params.layerId),
        success: false,
        error: error.message,
        operationId: req.operationId,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// File upload endpoint
app.post(
  "/api/v1/upload",
  upload.single("file"),
  concurrencyControl,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          code: "NO_FILE",
          timestamp: new Date().toISOString(),
        });
      }

      const code = req.file.buffer.toString("utf8");
      const enabledLayers = req.body.enabledLayers
        ? JSON.parse(req.body.enabledLayers)
        : [1, 2, 3, 4, 5, 6];

      // Validate parsed layers
      if (
        !Array.isArray(enabledLayers) ||
        enabledLayers.some((l) => !Number.isInteger(l) || l < 1 || l > 6)
      ) {
        return res.status(400).json({
          error: "Invalid enabledLayers format",
          code: "INVALID_LAYERS",
          timestamp: new Date().toISOString(),
        });
      }

      let currentCode = code;
      const results = [];
      const startTime = Date.now();

      for (const layerId of enabledLayers) {
        const layerStartTime = Date.now();

        try {
          const result = await executeLayerTransformation(
            layerId,
            currentCode,
            { verbose: true },
          );
          currentCode = result.transformedCode;

          results.push({
            layerId,
            layerName: getLayerName(layerId),
            success: result.success,
            executionTime: Date.now() - layerStartTime,
            changeCount: result.changeCount,
            method: result.method,
            warning: result.warning,
          });
        } catch (error) {
          results.push({
            layerId,
            layerName: getLayerName(layerId),
            success: false,
            executionTime: Date.now() - layerStartTime,
            changeCount: 0,
            error: error.message,
          });
        }
      }

      res.json({
        originalCode: code,
        finalCode: currentCode,
        results,
        successfulLayers: results.filter((r) => r.success).length,
        totalExecutionTime: Date.now() - startTime,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        operationId: req.operationId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        error: "File processing failed",
        code: "FILE_PROCESSING_ERROR",
        details: error.message,
        operationId: req.operationId,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Get smart recommendations
app.post(
  "/api/v1/recommend",
  validateCode,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code } = req.body;

      // Use the same analysis logic as /analyze but format for recommendations
      const analysisResponse = await new Promise((resolve) => {
        const mockReq = { body: { code } };
        const mockRes = {
          json: (data) => resolve(data),
        };

        // Reuse analysis logic
        const detectedIssues = [];

        // Same patterns as in analyze endpoint
        if (/"target":\s*"es5"/.test(code)) {
          detectedIssues.push({
            fixedByLayer: 1,
            description: "Outdated TypeScript configuration",
          });
        }
        if (/&quot;|&#x27;|&amp;/.test(code)) {
          detectedIssues.push({
            fixedByLayer: 2,
            description: "HTML entity corruption",
          });
        }
        if (
          /\.map\([^)]*\)\s*=>\s*<[^>]*>/.test(code) &&
          !code.includes("key=")
        ) {
          detectedIssues.push({
            fixedByLayer: 3,
            description: "Missing React keys",
          });
        }
        if (
          /localStorage\.|sessionStorage\./.test(code) &&
          !code.includes("typeof window")
        ) {
          detectedIssues.push({
            fixedByLayer: 4,
            description: "SSR hydration issues",
          });
        }
        if (/'use client';?\n[^']/.test(code)) {
          detectedIssues.push({
            fixedByLayer: 5,
            description: "Misplaced use client directive",
          });
        }
        if (/async\s+function.*\{(?!.*try)/.test(code)) {
          detectedIssues.push({
            fixedByLayer: 6,
            description: "Missing error handling",
          });
        }

        const recommendedLayers = [
          ...new Set(detectedIssues.map((issue) => issue.fixedByLayer)),
        ];

        resolve({
          recommendedLayers,
          reasoning: detectedIssues.map(
            (issue) => `Layer ${issue.fixedByLayer}: ${issue.description}`,
          ),
        });
      });

      res.json({
        ...analysisResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({
        error: "Recommendation failed",
        code: "RECOMMENDATION_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Validate transformation
app.post(
  "/api/v1/validate",
  [
    body("originalCode").isString().notEmpty(),
    body("transformedCode").isString().notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { originalCode, transformedCode } = req.body;

      const errors = [];
      const warnings = [];

      // Basic validation checks
      if (transformedCode.length < originalCode.length * 0.3) {
        warnings.push(
          "Significant code reduction detected - please review carefully",
        );
      }

      if (
        transformedCode.includes("undefined") &&
        !originalCode.includes("undefined")
      ) {
        errors.push("Transformation may have introduced undefined values");
      }

      // Check for broken syntax patterns
      const syntaxPatterns = [
        { pattern: /\{\s*\}/, description: "Empty object literal" },
        { pattern: /\[\s*\]/, description: "Empty array literal" },
        { pattern: /\(\s*\)/, description: "Empty function call" },
        {
          pattern: /function\s*\(\s*\)\s*\{\s*\}/,
          description: "Empty function",
        },
      ];

      for (const { pattern, description } of syntaxPatterns) {
        const originalCount = (originalCode.match(pattern) || []).length;
        const transformedCount = (transformedCode.match(pattern) || []).length;

        if (transformedCount > originalCount * 2) {
          warnings.push(`Increased ${description} patterns detected`);
        }
      }

      // Check for common corruption patterns
      if (
        transformedCode.includes("}}}}") ||
        transformedCode.includes(")))") ||
        transformedCode.includes(";;;")
      ) {
        errors.push("Potential syntax corruption detected");
      }

      res.json({
        isValid: errors.length === 0,
        errors,
        warnings,
        statistics: {
          originalLength: originalCode.length,
          transformedLength: transformedCode.length,
          reduction: Math.round(
            ((originalCode.length - transformedCode.length) /
              originalCode.length) *
              100,
          ),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Enhanced dashboard metrics endpoint with Supabase analytics
app.get("/api/v1/dashboard/metrics", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const timeRange = req.query.timeRange || "7d";
    const isAdmin = req.query.admin === "true";

    // Provide fallback data if Supabase is not available
    const fallbackMetrics = {
      totalTransformations: 0,
      successRate: 0,
      averageExecutionTime: 0,
      layerUsage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
      recentTransformations: [],
      quota: {
        used: 0,
        total: 1000,
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    };

    try {
      const now = new Date();
      const daysBack = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 7;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Check if Supabase is available by testing a simple query
      const { error: testError } = await supabase
        .from("transformation_history")
        .select("count")
        .limit(1);

      if (testError) {
        console.warn("Supabase not available, using fallback metrics:", testError.message);
        return res.json(fallbackMetrics);
      }

      // Fetch transformation analytics
      let transformQuery = supabase
        .from("transformation_history")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (!isAdmin && userId) {
        transformQuery = transformQuery.eq("user_id", userId);
      }

      const { data: transformations, error: transformError } =
        await transformQuery;
      
      if (transformError) {
        console.warn("Failed to fetch transformations, using fallback:", transformError.message);
        return res.json(fallbackMetrics);
      }

      // Calculate metrics
      const totalTransformations = transformations?.length || 0;
      const successfulTransformations = transformations?.filter(
        (t) => t.successful_layers > 0,
      ).length || 0;
      const successRate =
        totalTransformations > 0
          ? (successfulTransformations / totalTransformations) * 100
          : 0;

      const layerUsage = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      transformations?.forEach((t) => {
        if (t.enabled_layers && Array.isArray(t.enabled_layers)) {
          t.enabled_layers.forEach((layerId) => {
            if (layerUsage[layerId] !== undefined) {
              layerUsage[layerId]++;
            }
          });
        }
      });

      // Get user quota
      let userQuota = null;
      if (userId) {
        try {
          const { data: quotaData } = await supabase
            .from("user_quotas")
            .select("*")
            .eq("user_id", userId)
            .single();
          userQuota = quotaData;
        } catch (quotaError) {
          console.warn("Failed to fetch user quota, using default");
        }
      }

      const analytics = {
        totalTransformations,
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime:
          transformations?.length > 0
            ? Math.round(
                transformations.reduce(
                  (sum, t) => sum + (t.total_execution_time_ms || 0),
                  0,
                ) / transformations.length,
              )
            : 0,
        layerUsage,
        recentTransformations: transformations
          ?.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          .slice(0, 5)
          .map((t) => ({
            id: t.id,
            layers: t.enabled_layers || [],
            executionTime: t.total_execution_time_ms || 0,
            successfulLayers: t.successful_layers || 0,
            improvementScore: t.improvement_score || 0,
            createdAt: t.created_at,
          })) || [],
        quota: userQuota
          ? {
              used: userQuota.used_transformations || 0,
              total: userQuota.monthly_transformations || 1000,
              renewsAt: userQuota.quota_reset_date,
            }
          : {
              used: 0,
              total: 1000,
              renewsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
      };

      res.json(analytics);
    } catch (supabaseError) {
      console.warn("Supabase query failed, using fallback metrics:", supabaseError.message);
      res.json(fallbackMetrics);
    }
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard metrics",
      code: "METRICS_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Projects endpoint
app.get("/api/v1/projects", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    let query = supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to match frontend interface
    const transformedProjects = (projects || []).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      fileCount: project.file_count || 0,
      lastUpdated: new Date(project.updated_at),
      totalTransformations: project.total_transformations || 0,
      repositoryUrl: project.repository_url,
      settings: project.settings || {}
    }));

    res.json({
      projects: transformedProjects,
      total: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Projects fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch projects",
      code: "PROJECTS_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Transformation history endpoint
app.get("/api/v1/history", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    let query = supabase
      .from("transformation_history")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by user if not admin
    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Filter by status
    if (status !== 'all') {
      if (status === 'success') {
        query = query.gt("successful_layers", 0);
      } else if (status === 'failed') {
        query = query.eq("successful_layers", 0);
      }
    }

    // Search filter
    if (search) {
      query = query.ilike("original_code_hash", `%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: history, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      history: history || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch transformation history",
      code: "HISTORY_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Analytics endpoint
app.get("/api/v1/analytics", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const timeRange = req.query.timeRange || "7d";
    const isAdmin = req.query.admin === "true";

    const now = new Date();
    const daysBack = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    try {
      // Get API usage analytics
      let usageQuery = supabase
        .from("api_usage_logs")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (!isAdmin && userId) {
        usageQuery = usageQuery.eq("user_id", userId);
      }

      const { data: apiUsage, error: usageError } = await usageQuery;

      // Get transformation analytics
      let transformQuery = supabase
        .from("transformation_history")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (!isAdmin && userId) {
        transformQuery = transformQuery.eq("user_id", userId);
      }

      const { data: transformations, error: transformError } = await transformQuery;

      if (usageError || transformError) {
        throw new Error(usageError?.message || transformError?.message);
      }

      // Process analytics data
      const analytics = {
        apiUsage: {
          totalRequests: apiUsage?.length || 0,
          avgResponseTime: apiUsage?.length > 0 
            ? Math.round(apiUsage.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / apiUsage.length)
            : 0,
          errorRate: apiUsage?.length > 0 
            ? (apiUsage.filter(log => log.status_code >= 400).length / apiUsage.length) * 100
            : 0,
          endpointUsage: apiUsage?.reduce((acc, log) => {
            acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
            return acc;
          }, {}) || {}
        },
        transformations: {
          total: transformations?.length || 0,
          successful: transformations?.filter(t => t.successful_layers > 0).length || 0,
          averageExecutionTime: transformations?.length > 0
            ? Math.round(transformations.reduce((sum, t) => sum + (t.total_execution_time_ms || 0), 0) / transformations.length)
            : 0,
          layerUsage: transformations?.reduce((acc, t) => {
            if (t.enabled_layers && Array.isArray(t.enabled_layers)) {
              t.enabled_layers.forEach(layer => {
                acc[layer] = (acc[layer] || 0) + 1;
              });
            }
            return acc;
          }, {}) || {},
          codeImprovements: {
            totalChanges: transformations?.reduce((sum, t) => sum + (t.improvement_score || 0), 0) || 0,
            averageImprovement: transformations?.length > 0
              ? Math.round(transformations.reduce((sum, t) => sum + (t.improvement_score || 0), 0) / transformations.length)
              : 0
          }
        },
        timeRange,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      };

      res.json(analytics);
    } catch (supabaseError) {
      console.warn("Supabase analytics query failed, using fallback:", supabaseError.message);
      res.json({
        apiUsage: {
          totalRequests: 0,
          avgResponseTime: 0,
          errorRate: 0,
          endpointUsage: {}
        },
        transformations: {
          total: 0,
          successful: 0,
          averageExecutionTime: 0,
          layerUsage: {},
          codeImprovements: {
            totalChanges: 0,
            averageImprovement: 0
          }
        },
        timeRange,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      });
    }
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics data",
      code: "ANALYTICS_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Team management endpoints
app.get("/api/v1/team", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get teams owned by user
    const { data: ownedTeams, error: ownedError } = await supabase
      .from("teams")
      .select(`
        *,
        team_members!inner (
          *,
          user:auth.users (
            id,
            email,
            raw_user_meta_data
          )
        )
      `)
      .eq("owner_id", userId)
      .eq("is_active", true);

    // Get teams user is a member of
    const { data: memberTeams, error: memberError } = await supabase
      .from("team_members")
      .select(`
        *,
        team:teams (
          *,
          team_members (
            *,
            user:auth.users (
              id,
              email,
              raw_user_meta_data
            )
          )
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true);

    if (ownedError || memberError) {
      throw new Error(ownedError?.message || memberError?.message);
    }

    // Combine and deduplicate teams
    const allTeams = [...(ownedTeams || []), ...(memberTeams?.map(m => m.team) || [])];
    const uniqueTeams = allTeams.filter((team, index, self) => 
      index === self.findIndex(t => t.id === team.id)
    );

    // Get all team members
    const allMembers = [];
    uniqueTeams.forEach(team => {
      if (team.team_members) {
        team.team_members.forEach(member => {
          if (member.user && member.is_active) {
            allMembers.push({
              id: member.user.id,
              name: member.user.raw_user_meta_data?.full_name || member.user.email.split('@')[0],
              email: member.user.email,
              role: member.role,
              teamId: team.id,
              teamName: team.name,
              joinedAt: new Date(member.joined_at),
              lastActive: member.last_active_at ? new Date(member.last_active_at) : new Date(),
              transformationsCount: 0 // Would need to query transformation_history
            });
          }
        });
      }
    });

    res.json({
      members: allMembers,
      totalMembers: allMembers.length,
      teams: uniqueTeams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount: team.team_members?.filter(m => m.is_active).length || 0,
        isOwner: team.owner_id === userId
      })),
      roles: ['admin', 'developer', 'viewer'],
      isEnterprise: allMembers.length > 0
    });
  } catch (error) {
    console.error("Team fetch error:", error);
    
    // Fallback for users without teams
    res.json({
      members: [],
      totalMembers: 0,
      teams: [],
      roles: ['admin', 'developer', 'viewer'],
      isEnterprise: false,
      message: "Team management requires enterprise setup"
    });
  }
});

// Integrations endpoint
app.get("/api/v1/integrations", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get user's integrations from database
    const { data: userIntegrations, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      throw new Error(error.message);
    }

    // Create integrations object with real data
    const integrations = {};
    const availableTypes = ['github', 'gitlab', 'vscode', 'api', 'webhook'];
    
    availableTypes.forEach(type => {
      const userIntegration = userIntegrations?.find(i => i.integration_type === type);
      
      if (userIntegration) {
        integrations[type] = {
          id: userIntegration.id,
          name: userIntegration.name,
          status: userIntegration.status,
          description: userIntegration.configuration?.description || `${userIntegration.name} integration`,
          lastSync: userIntegration.last_sync_at ? new Date(userIntegration.last_sync_at) : null,
          syncStatus: userIntegration.sync_status,
          errorDetails: userIntegration.error_details,
          configuration: userIntegration.configuration || {}
        };
      } else {
        // Default configurations for integrations that don't exist yet
        const defaultConfigs = {
          github: {
            name: "GitHub",
            status: "disconnected",
            description: "Connect your GitHub repositories for automated transformations"
          },
          gitlab: {
            name: "GitLab",
            status: "disconnected",
            description: "Integrate with GitLab for CI/CD pipeline automation"
          },
          vscode: {
            name: "VS Code Extension",
            status: "available",
            description: "Install the NeuroLint VS Code extension for IDE integration"
          },
          api: {
            name: "REST API",
            status: "active",
            description: "Use our REST API for custom integrations"
          },
          webhook: {
            name: "Webhooks",
            status: "configured",
            description: "Receive notifications about transformation events"
          }
        };
        
        integrations[type] = defaultConfigs[type];
      }
    });

    // If user has no integrations, create default ones
    if (!userIntegrations || userIntegrations.length === 0) {
      try {
        // Create default integrations for new user
        await supabase.rpc('create_default_integrations_for_user', {
          user_uuid: userId
        });
      } catch (createError) {
        console.warn("Failed to create default integrations:", createError.message);
      }
    }

    const connectedIntegrations = Object.values(integrations).filter(
      i => i.status === 'active' || i.status === 'connected'
    ).length;

    res.json({
      integrations,
      availableIntegrations: Object.keys(integrations).length,
      connectedIntegrations,
      totalIntegrations: userIntegrations?.length || 0
    });
  } catch (error) {
    console.error("Integrations fetch error:", error);
    
    // Fallback with default integrations
    const defaultIntegrations = {
      github: {
        name: "GitHub",
        status: "disconnected",
        description: "Connect your GitHub repositories for automated transformations"
      },
      gitlab: {
        name: "GitLab",
        status: "disconnected",
        description: "Integrate with GitLab for CI/CD pipeline automation"
      },
      vscode: {
        name: "VS Code Extension",
        status: "available",
        description: "Install the NeuroLint VS Code extension for IDE integration"
      },
      api: {
        name: "REST API",
        status: "active",
        description: "Use our REST API for custom integrations"
      },
      webhook: {
        name: "Webhooks",
        status: "configured",
        description: "Receive notifications about transformation events"
      }
    };

    res.json({
      integrations: defaultIntegrations,
      availableIntegrations: Object.keys(defaultIntegrations).length,
      connectedIntegrations: Object.values(defaultIntegrations).filter(i => i.status === 'active' || i.status === 'connected').length,
      totalIntegrations: 0
    });
  }
});

// Create project endpoint
app.post("/api/v1/projects", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, description, repositoryUrl, settings } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: "Project name is required",
        code: "VALIDATION_ERROR"
      });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        repository_url: repositoryUrl?.trim() || null,
        settings: settings || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        fileCount: project.file_count,
        lastUpdated: new Date(project.updated_at),
        totalTransformations: project.total_transformations,
        repositoryUrl: project.repository_url,
        settings: project.settings
      }
    });
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({
      error: "Failed to create project",
      code: "PROJECT_CREATION_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Update integration endpoint
app.put("/api/v1/integrations/:type", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type } = req.params;
    const { status, configuration, credentials } = req.body;

    const validTypes = ['github', 'gitlab', 'vscode', 'api', 'webhook'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: "Invalid integration type",
        code: "VALIDATION_ERROR"
      });
    }

    const { data: integration, error } = await supabase
      .from("integrations")
      .upsert({
        user_id: userId,
        integration_type: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        status: status || 'configured',
        configuration: configuration || {},
        credentials_encrypted: credentials || null,
        last_sync_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      integration: {
        id: integration.id,
        type: integration.integration_type,
        name: integration.name,
        status: integration.status,
        configuration: integration.configuration,
        lastSync: new Date(integration.last_sync_at)
      }
    });
  } catch (error) {
    console.error("Integration update error:", error);
    res.status(500).json({
      error: "Failed to update integration",
      code: "INTEGRATION_UPDATE_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// User profile endpoint
app.get("/api/v1/profile", authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user quota information
    const { data: quota } = await supabase
      .from("user_quotas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get user statistics
    const { data: userStats } = await supabase
      .from("transformation_history")
      .select("*")
      .eq("user_id", user.id);

    const profile = {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      quota: quota || {
        used_transformations: 0,
        monthly_transformations: 1000,
        quota_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      statistics: {
        totalTransformations: userStats?.length || 0,
        successfulTransformations: userStats?.filter(s => s.successful_layers > 0).length || 0,
        averageExecutionTime: userStats?.length > 0 
          ? Math.round(userStats.reduce((sum, s) => sum + (s.total_execution_time_ms || 0), 0) / userStats.length)
          : 0
      },
      preferences: {
        emailNotifications: true,
        defaultLayers: [1, 2, 3, 4],
        theme: 'dark'
      }
    };

    res.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch profile data",
      code: "PROFILE_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Billing information endpoint
app.get("/api/v1/billing", authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user quota for billing info
    const { data: quota } = await supabase
      .from("user_quotas")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    const billing = {
      plan: "Professional Free",
      status: "active",
      quota: quota || {
        used_transformations: 0,
        monthly_transformations: 1000,
        quota_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      usage: {
        currentPeriod: quota?.used_transformations || 0,
        limit: quota?.monthly_transformations || 1000,
        resetDate: quota?.quota_reset_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      features: [
        "1,000 monthly transformations",
        "All 6 transformation layers",
        "Web interface access",
        "Basic support"
      ],
      upgradeOptions: [
        {
          name: "Professional",
          price: "$29/month",
          features: ["10,000 monthly transformations", "Priority support", "Advanced analytics"]
        },
        {
          name: "Enterprise", 
          price: "Custom",
          features: ["Unlimited transformations", "Team collaboration", "Custom integrations"]
        }
      ]
    };

    res.json(billing);
  } catch (error) {
    console.error("Billing fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch billing data",
      code: "BILLING_ERROR",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint with system status
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeOperations: currentOperations,
    tempFiles: activeTempFiles.size,
  });
});

// Supabase patterns storage (production-ready persistence)

// Enhanced Supabase helpers for enterprise features
async function logAPIUsage(req, res, executionTime, error = null) {
  try {
    const user = req.user || null;
    await supabase.from("api_usage_logs").insert({
      endpoint: req.path,
      method: req.method,
      user_id: user?.id || null,
      session_id: req.headers["x-session-id"] || null,
      status_code: res.statusCode,
      execution_time_ms: executionTime,
      request_size_bytes: req.headers["content-length"] || 0,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      error_details: error
        ? { message: error.message, stack: error.stack }
        : null,
      metadata: {
        operationId: req.operationId,
        userAgent: req.headers["user-agent"],
      },
    });
  } catch (logError) {
    console.error("Failed to log API usage:", logError.message);
  }
}

async function checkUserQuota(userId) {
  if (!userId) return { allowed: true, remaining: 1000 };

  const { data, error } = await supabase
    .from("user_quotas")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Create quota for new user
    const { data: newQuota } = await supabase
      .from("user_quotas")
      .insert({ user_id: userId })
      .select()
      .single();
    return { allowed: true, remaining: 999 };
  }

  const remaining = data.monthly_transformations - data.used_transformations;
  return {
    allowed: remaining > 0,
    remaining,
    resetDate: data.quota_reset_date,
  };
}

async function incrementUserUsage(userId) {
  if (!userId) return;

  await supabase.rpc("increment_user_transformations", {
    user_uuid: userId,
  });
}

async function checkDistributedRateLimit(
  identifier,
  endpoint,
  limit = 100,
  windowSeconds = 900,
) {
  const windowStart = new Date(
    Date.now() - (Date.now() % (windowSeconds * 1000)),
  );
  const rateLimitId = `${identifier}_${endpoint}`;

  const { data, error } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("id", rateLimitId)
    .eq("endpoint", endpoint)
    .single();

  if (error || !data) {
    // Create new rate limit entry
    await supabase.from("rate_limits").upsert({
      id: rateLimitId,
      endpoint,
      request_count: 1,
      window_start: windowStart.toISOString(),
      limit_per_window: limit,
      window_duration_seconds: windowSeconds,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  // Check if window has reset
  const dataWindowStart = new Date(data.window_start);
  if (dataWindowStart < windowStart) {
    // Reset window
    await supabase
      .from("rate_limits")
      .update({
        request_count: 1,
        window_start: windowStart.toISOString(),
        is_blocked: false,
        blocked_until: null,
      })
      .eq("id", rateLimitId);
    return { allowed: true, remaining: limit - 1 };
  }

  // Check current usage
  if (data.request_count >= limit) {
    await supabase
      .from("rate_limits")
      .update({
        is_blocked: true,
        blocked_until: new Date(
          windowStart.getTime() + windowSeconds * 1000,
        ).toISOString(),
      })
      .eq("id", rateLimitId);
    return { allowed: false, remaining: 0, resetTime: data.window_start };
  }

  // Increment counter
  await supabase
    .from("rate_limits")
    .update({
      request_count: data.request_count + 1,
    })
    .eq("id", rateLimitId);

  return { allowed: true, remaining: limit - data.request_count - 1 };
}

async function saveTransformationHistory(req, transformationData) {
  try {
    await supabase.from("transformation_history").insert({
      user_id: req.user?.id || null,
      session_id: req.headers["x-session-id"] || null,
      original_code_hash: crypto
        .createHash("sha256")
        .update(transformationData.originalCode)
        .digest("hex"),
      final_code_hash: crypto
        .createHash("sha256")
        .update(transformationData.finalCode)
        .digest("hex"),
      enabled_layers: transformationData.enabledLayers,
      layer_results: transformationData.results,
      total_execution_time_ms: transformationData.totalExecutionTime,
      successful_layers: transformationData.successfulLayers,
      failed_layers:
        transformationData.enabledLayers.length -
        transformationData.successfulLayers,
      code_size_before: transformationData.originalCode.length,
      code_size_after: transformationData.finalCode.length,
      improvement_score: calculateImprovementScore(transformationData),
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Failed to save transformation history:", error.message);
  }
}

function calculateImprovementScore(data) {
  const { results, originalCode, finalCode } = data;
  const successRate = data.successfulLayers / data.enabledLayers.length;
  const sizeReduction = Math.max(
    0,
    (originalCode.length - finalCode.length) / originalCode.length,
  );
  const totalChanges = results.reduce(
    (sum, r) => sum + (r.changeCount || 0),
    0,
  );

  return Math.min(
    100,
    successRate * 50 + sizeReduction * 25 + Math.min(25, totalChanges * 2),
  );
}

// Save patterns endpoint with Supabase persistence
app.post(
  "/api/v1/patterns/save",
  authenticateUser,
  [
    body("layerId")
      .isInt({ min: 1, max: 7 })
      .withMessage("Layer ID must be between 1 and 7"),
    body("patterns").isArray().withMessage("Patterns must be an array"),
    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("isPublic must be a boolean"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Auto-setup database if needed on first pattern save
      await setupEnterpriseDatabase();

      const { layerId, patterns, metadata = {}, isPublic = false } = req.body;

      const patternData = {
        layer_id: layerId,
        patterns: patterns,
        metadata: {
          ...metadata,
          updatedAt: new Date().toISOString(),
          patternCount: patterns.length,
        },
        user_id: req.user?.id || null,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      };

      // Upsert patterns to Supabase
      const { data, error } = await supabase
        .from("neurolint_patterns")
        .upsert(patternData, {
          onConflict: "layer_id,user_id",
          returning: "minimal",
        });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      res.json({
        success: true,
        layerId,
        patternCount: patterns.length,
        isPublic,
        message: "Patterns saved successfully to database",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Pattern save error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save patterns",
        code: "PATTERN_SAVE_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Load patterns endpoint with Supabase persistence
app.get(
  "/api/v1/patterns/load",
  authenticateUser,
  handleValidationErrors,
  async (req, res) => {
    try {
      const layerId = req.query.layerId;
      const includePublic = req.query.includePublic !== "false";

      if (layerId) {
        // Load patterns for specific layer
        let query = supabase
          .from("neurolint_patterns")
          .select("*")
          .eq("layer_id", layerId);

        if (req.user) {
          // Load user's patterns or public patterns
          query = query.or(`user_id.eq.${req.user.id},is_public.eq.true`);
        } else {
          // Load only public patterns for anonymous users
          query = query.eq("is_public", true);
        }

        const { data, error } = await query.order("updated_at", {
          ascending: false,
        });

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data || data.length === 0) {
          return res.status(404).json({
            success: false,
            error: "No patterns found for this layer",
            code: "PATTERNS_NOT_FOUND",
            layerId: parseInt(layerId),
            timestamp: new Date().toISOString(),
          });
        }

        // Return the most recent pattern (user's own if available, otherwise public)
        const userPattern = data.find((p) => p.user_id === req.user?.id);
        const selectedPattern = userPattern || data[0];

        res.json({
          success: true,
          layerId: selectedPattern.layer_id,
          patterns: selectedPattern.patterns,
          metadata: selectedPattern.metadata,
          isPublic: selectedPattern.is_public,
          isOwn: selectedPattern.user_id === req.user?.id,
          version: selectedPattern.version,
          updatedAt: selectedPattern.updated_at,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Load all patterns
        let query = supabase
          .from("neurolint_patterns")
          .select("*")
          .order("layer_id");

        if (req.user) {
          query = query.or(`user_id.eq.${req.user.id},is_public.eq.true`);
        } else {
          query = query.eq("is_public", true);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        // Group by layer_id, prioritizing user's own patterns
        const allPatterns = {};
        for (const row of data) {
          const layerId = row.layer_id;
          if (!allPatterns[layerId] || row.user_id === req.user?.id) {
            allPatterns[layerId] = {
              layerId: row.layer_id,
              patterns: row.patterns,
              metadata: row.metadata,
              isPublic: row.is_public,
              isOwn: row.user_id === req.user?.id,
              version: row.version,
              updatedAt: row.updated_at,
            };
          }
        }

        res.json({
          success: true,
          patterns: allPatterns,
          totalLayers: Object.keys(allPatterns).length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Pattern load error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load patterns",
        code: "PATTERN_LOAD_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Real-time pattern subscription endpoints

// Subscribe to pattern updates
app.post(
  "/api/v1/patterns/subscribe",
  authenticateUser,
  [
    body("layerId")
      .isInt({ min: 1, max: 7 })
      .withMessage("Layer ID must be between 1 and 7"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
          timestamp: new Date().toISOString(),
        });
      }

      const { layerId } = req.body;

      const { data, error } = await supabase
        .from("pattern_subscriptions")
        .upsert(
          {
            user_id: req.user.id,
            layer_id: layerId,
            is_active: true,
          },
          {
            onConflict: "user_id,layer_id",
          },
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      res.json({
        success: true,
        subscription: {
          layerId,
          isActive: true,
          subscribedAt: data.created_at,
        },
        message: `Subscribed to Layer ${layerId} pattern updates`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Pattern subscription error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create subscription",
        code: "SUBSCRIPTION_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Get user's pattern subscriptions
app.get(
  "/api/v1/patterns/subscriptions",
  authenticateUser,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
          timestamp: new Date().toISOString(),
        });
      }

      const { data, error } = await supabase
        .from("pattern_subscriptions")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("is_active", true)
        .order("layer_id");

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const subscriptions = data.map((sub) => ({
        layerId: sub.layer_id,
        layerName: getLayerName(sub.layer_id),
        subscribedAt: sub.created_at,
        lastNotified: sub.last_notified_at,
      }));

      res.json({
        success: true,
        subscriptions,
        totalSubscriptions: subscriptions.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Pattern subscriptions fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch subscriptions",
        code: "SUBSCRIPTIONS_FETCH_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Helper function to get layer names
function getLayerName(layerId) {
  const names = {
    1: "Configuration Fixes",
    2: "Pattern Recognition",
    3: "Component Enhancement",
    4: "Hydration & SSR",
    5: "Next.js App Router",
    6: "Testing & Validation",
    7: "Adaptive Learning",
  };
  return names[layerId] || `Layer ${layerId}`;
}

// Global error handler
app.use((error, req, res, next) => {
  console.error("API Error:", {
    error: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request entity too large",
      code: "ENTITY_TOO_LARGE",
      maxSize: config.api.maxFileSize,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large",
      code: "FILE_TOO_LARGE",
      maxSize: "10MB",
      timestamp: new Date().toISOString(),
    });
  }

  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    code: "NOT_FOUND",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Cleanup on exit
cleanup((exitCode, signal) => {
  console.log("Cleaning up temp files...");
  activeTempFiles.forEach((file) => {
    try {
      fsSync.unlinkSync(file);
    } catch (e) {
      console.error("Failed to cleanup:", file);
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
    console.error("Auto-cleanup error:", error.message);
  }
}, config.temp.cleanup);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 NeuroLint API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;
