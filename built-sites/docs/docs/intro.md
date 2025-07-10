---
sidebar_position: 1
slug: /
---

# Welcome to NeuroLint

**Advanced rule-based code analysis and transformation platform using AST parsing and sophisticated pattern matching.**

<div className="terminal">
<div className="terminal-content">

```bash
# Quick start with NeuroLint
npm install -g @neurolint/cli
neurolint analyze src/
neurolint fix src/ --layers=1,2,3,4
```

</div>
</div>

## What is NeuroLint?

NeuroLint is a cutting-edge platform designed to revolutionize how developers approach code quality and transformation. Our sophisticated **6-layer analysis engine** combines rule-based transformations with advanced AST parsing to deliver unparalleled code improvement capabilities.

### 🎯 **Perfect for:**
- **React & Next.js** developers seeking code optimization
- **TypeScript** projects requiring modernization
- **Teams** wanting consistent code quality
- **Legacy codebases** needing systematic improvement
- **Enterprise** environments requiring compliance and standards

## Core Features

### 🔧 **6-Layer Analysis Engine**

Our proprietary layer system provides comprehensive code analysis:

| Layer | Focus | Benefits |
|-------|-------|----------|
| **Layer 1** | Configuration | TypeScript & Next.js setup optimization |
| **Layer 2** | Pattern Cleanup | HTML entities, import cleanup, type assertions |
| **Layer 3** | Component Best Practices | React keys, accessibility, form structure |
| **Layer 4** | Hydration & SSR | Browser API guards, client-only components |
| **Layer 5** | Next.js App Router | 'use client' directives, import optimization |
| **Layer 6** | Testing & Validation | Error boundaries, prop validation, performance |

### 🚀 **Multiple Access Methods**

Choose the approach that fits your workflow:

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '2rem 0'}}>

<div className="card">
<div className="card__header">
<h3>🌐 Web Application</h3>
</div>
<div className="card__body">
Interactive browser-based interface with real-time analysis, GitHub integration, and smart mode recommendations.
<br/><br/>
<a href="https://app.neurolint.dev" className="button button--primary">Try Web App</a>
</div>
</div>

<div className="card">
<div className="card__header">
<h3>⚡ CLI Tool</h3>
</div>
<div className="card__body">
Command-line interface perfect for CI/CD integration, automation, and batch processing.
<br/><br/>
<a href="/cli/installation" className="button button--secondary">Install CLI</a>
</div>
</div>

<div className="card">
<div className="card__header">
<h3>🔌 VS Code Extension</h3>
</div>
<div className="card__body">
Real-time analysis directly in your editor with instant feedback and one-click fixes.
<br/><br/>
<a href="https://vs.neurolint.dev" className="button button--secondary">Get Extension</a>
</div>
</div>

<div className="card">
<div className="card__header">
<h3>🔧 REST API</h3>
</div>
<div className="card__body">
Integrate NeuroLint into custom applications and workflows with our comprehensive API.
<br/><br/>
<a href="/api/overview" className="button button--secondary">API Docs</a>
</div>
</div>

</div>

## Quick Start

Get up and running with NeuroLint in minutes:

### 1. **Try the Web Interface**

The fastest way to experience NeuroLint:

```bash
# Visit https://app.neurolint.dev
# 1. Paste your code or upload files
# 2. Enable Smart Mode for automatic layer selection
# 3. Click "Process Code" and see the magic happen!
```

### 2. **Install the CLI** (Recommended for developers)

```bash
# Install globally
npm install -g @neurolint/cli

# Authenticate (optional, for advanced features)
neurolint login

# Analyze your project
neurolint analyze src/

# Apply fixes automatically
neurolint fix src/ --backup
```

### 3. **Add to Your Editor**

Install the VS Code extension for real-time analysis:

```bash
# Search for "NeuroLint" in VS Code extensions
# Or visit: https://vs.neurolint.dev
```

## Real-World Examples

See NeuroLint in action with these before/after transformations:

:::info Before Transformation

```jsx
// Common React issues
const items = data.map(item => 
  <div>{item.name}</div>  // ❌ Missing key prop
);

const value = localStorage.getItem('key');  // ❌ SSR unsafe
```

:::

:::success After NeuroLint

```jsx
// Optimized and safe
const items = data.map(item => 
  <div key={item.id}>{item.name}</div>  // ✅ Proper key prop
);

// ✅ SSR-safe with proper guards
const value = typeof window !== 'undefined' 
  ? localStorage.getItem('key') 
  : null;
```

:::

## Why Choose NeuroLint?

### 🛡️ **Production-Ready Safety**
- **AST-based transformations** ensure syntax correctness
- **Automatic rollback** on validation failures  
- **Incremental validation** prevents cascading errors
- **Error recovery** with detailed reporting

### 🧠 **Intelligent Analysis**
- **Smart Mode** automatically selects optimal layers
- **Pattern learning** improves with each transformation
- **Context-aware** fixes based on your codebase
- **Confidence scoring** for recommendations

### ⚡ **High Performance**
- **Sub-100ms** response times for API calls
- **Parallel processing** for large codebases
- **Efficient caching** reduces processing time
- **Global CDN** for optimal performance

### 🏢 **Enterprise Features**
- **Team management** and role-based access
- **Custom rule configuration** for company standards
- **Audit logging** and compliance reporting
- **SOC 2 Type II** security compliance
- **SLA guarantees** with dedicated support

## Community & Support

Join thousands of developers already using NeuroLint:

- 🌐 **[Main Website](https://neurolint.dev)** - Learn more about NeuroLint
- 💬 **[Community Forum](https://forum.neurolint.dev)** - Get help and share experiences  
- 📧 **[Email Support](mailto:founder@neurolint.dev)** - Direct support from our team
- 🔧 **[GitHub](https://github.com/Alcatecable)** - Source code and issues

## Next Steps

Ready to dive deeper? Choose your path:

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '2rem 0'}}>

<a href="/getting-started/quick-start" className="card" style={{textDecoration: 'none', color: 'inherit'}}>
<div className="card__header">
<h4>🚀 Quick Start Guide</h4>
</div>
<div className="card__body">
Get started with NeuroLint in 5 minutes
</div>
</a>

<a href="/concepts/layer-system" className="card" style={{textDecoration: 'none', color: 'inherit'}}>
<div className="card__header">
<h4>📚 Learn the Concepts</h4>
</div>
<div className="card__body">
Understand how NeuroLint works
</div>
</a>

<a href="/api/overview" className="card" style={{textDecoration: 'none', color: 'inherit'}}>
<div className="card__header">
<h4>🔧 API Reference</h4>
</div>
<div className="card__body">
Integrate NeuroLint into your apps
</div>
</a>

<a href="/guides/react-optimization" className="card" style={{textDecoration: 'none', color: 'inherit'}}>
<div className="card__header">
<h4>📖 Practical Guides</h4>
</div>
<div className="card__body">
Specific use cases and tutorials
</div>
</a>

</div>

---

**Ready to transform your code?** Start with our [Quick Start Guide](/getting-started/quick-start) or jump straight into the [Web Application](https://app.neurolint.dev).

*Built with ❤️ for developers by developers.*
