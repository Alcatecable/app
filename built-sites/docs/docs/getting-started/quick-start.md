---
sidebar_position: 2
---

# Quick Start Guide

Get NeuroLint up and running in **5 minutes**! This guide will walk you through the fastest ways to start analyzing and improving your code.

## Method 1: Web Application (No Installation Required) ⭐

**Perfect for:** First-time users, quick testing, sharing results with team members

### Step 1: Open NeuroLint Web App

Navigate to [**app.neurolint.dev**](https://app.neurolint.dev) in your browser.

### Step 2: Add Your Code

Choose one of these methods to add your code:

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '1rem 0'}}>

<div className="card">
<div className="card__header">
<h4>📝 Paste Code</h4>
</div>
<div className="card__body">
Copy and paste your code directly into the editor. Perfect for quick testing specific functions or components.
</div>
</div>

<div className="card">
<div className="card__header">
<h4>📁 Upload Files</h4>
</div>
<div className="card__body">
Drag and drop files or click to browse. Supports `.js`, `.jsx`, `.ts`, `.tsx`, and `.json` files.
</div>
</div>

<div className="card">
<div className="card__header">
<h4>🐙 GitHub Import</h4>
</div>
<div className="card__body">
Connect your GitHub repository and import files directly. Great for analyzing existing projects.
</div>
</div>

</div>

### Step 3: Enable Smart Mode (Recommended)

Toggle on **Smart Mode** to let NeuroLint automatically select the best layers for your code:

```bash
✅ Smart Mode ON
🤖 NeuroLint will analyze your code and recommend optimal layers
📊 Confidence scores show how certain we are about recommendations
```

### Step 4: Process Your Code

Click **"Process Code"** and watch NeuroLint work its magic:

- 🔍 **Analysis Phase** - Code is parsed and examined
- 🧠 **Layer Selection** - Optimal layers are chosen (if Smart Mode is on)
- ⚡ **Transformation** - Improvements are applied
- ✅ **Validation** - Results are verified for safety

### Step 5: Review Results

Explore your results in the comprehensive dashboard:

- **📊 Summary Tab** - Overview of changes and improvements
- **🔍 Details Tab** - Layer-by-layer breakdown
- **💾 Code Tab** - View and copy the improved code
- **📈 Performance** - Metrics and execution times

:::tip Pro Tip
Use the **copy button** to grab your improved code, or **download** it as a file for immediate use!
:::

---

## Method 2: CLI Installation (For Developers) 🚀

**Perfect for:** Regular use, CI/CD integration, automation, batch processing

### Step 1: Install NeuroLint CLI

<div className="terminal">
<div className="terminal-content">

```bash
# Install globally via npm
npm install -g @neurolint/cli

# Verify installation
neurolint --version
# Output: @neurolint/cli v1.0.0
```

</div>
</div>

### Step 2: Navigate to Your Project

<div className="terminal">
<div className="terminal-content">

```bash
# Navigate to your project directory
cd /path/to/your/project

# Example: React project
cd my-react-app
```

</div>
</div>

### Step 3: Run Your First Analysis

<div className="terminal">
<div className="terminal-content">

```bash
# Analyze your source code
neurolint analyze src/

# For more detailed output
neurolint analyze src/ --verbose

# Analyze specific files
neurolint analyze src/components/Header.tsx
```

</div>
</div>

**Sample Output:**
```bash
🔍 NeuroLint Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Files analyzed: 15
🔧 Issues found: 8
📊 Recommended layers: [1, 2, 3, 4]

🏷️  Issues by Layer:
   Layer 1 (Config): 2 issues
   Layer 2 (Patterns): 3 issues  
   Layer 3 (Components): 2 issues
   Layer 4 (Hydration): 1 issue

💡 Run 'neurolint fix src/' to apply automatic fixes
```

### Step 4: Apply Fixes

<div className="terminal">
<div className="terminal-content">

```bash
# Apply fixes with backup (recommended)
neurolint fix src/ --backup

# Preview changes without applying them
neurolint fix src/ --dry-run

# Fix specific layers only
neurolint fix src/ --layers=1,2,3
```

</div>
</div>

### Step 5: Verify Results

<div className="terminal">
<div className="terminal-content">

```bash
# Check if your project still builds
npm run build

# Run tests to ensure nothing broke
npm test

# Run another analysis to see improvements
neurolint analyze src/
```

</div>
</div>

---

## Method 3: VS Code Extension (Real-time Analysis) 🔌

**Perfect for:** Real-time feedback, learning best practices, continuous improvement

### Step 1: Install Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "**NeuroLint**"
4. Click **Install**
5. Reload VS Code

**Or visit:** [vs.neurolint.dev](https://vs.neurolint.dev)

### Step 2: Open a Supported File

Open any `.js`, `.jsx`, `.ts`, or `.tsx` file to see NeuroLint in action:

```jsx
// Open this file in VS Code with NeuroLint extension
function MyComponent({ items }) {
  return (
    <div>
      {items.map(item => (
        <div>{item.name}</div>  // ⚠️ NeuroLint will highlight missing key
      ))}
    </div>
  );
}
```

### Step 3: See Real-time Analysis

- **🔴 Red squiggles** - Critical issues that need fixing
- **🟡 Yellow squiggles** - Warnings and improvements
- **💡 Light bulb** - Quick fix suggestions available

### Step 4: Apply Quick Fixes

1. Click on any highlighted issue
2. Look for the **💡 light bulb** icon  
3. Click it to see available fixes
4. Select **"NeuroLint: Fix this issue"**

---

## Example: Your First Transformation

Here's a real example of what NeuroLint can do for your code:

### Before NeuroLint:

```jsx
import React from 'react';

function UserList({ users }) {
  const handleClick = () => {
    const data = localStorage.getItem('userPrefs');
    console.log('User clicked', data);
  };

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div onClick={handleClick}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
}
```

### After NeuroLint (Layers 2, 3, 4):

```jsx
import React from 'react';

function UserList({ users }) {
  const handleClick = () => {
    // ✅ Layer 4: Added SSR safety guard
    const data = typeof window !== 'undefined' 
      ? localStorage.getItem('userPrefs') 
      : null;
    // ✅ Layer 2: Changed console.log to console.debug
    console.debug('User clicked', data);
  };

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        {/* ✅ Layer 3: Added missing key prop */}
        <div key={user.id} onClick={handleClick}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
}
```

**Improvements Made:**
- ✅ **SSR Safety** - Added `typeof window` guard for localStorage
- ✅ **Performance** - Changed `console.log` to `console.debug`
- ✅ **React Best Practices** - Added missing `key` prop to mapped elements

---

## What's Next?

Now that you've got NeuroLint running, here's what to explore next:

### 🎯 **Learn the Fundamentals**
- **[Understanding Layers](/getting-started/understanding-layers)** - How the 6-layer system works
- **[First Analysis](/getting-started/first-analysis)** - Deep dive into analysis results
- **[Core Concepts](/concepts/layer-system)** - Technical details and architecture

### ⚙️ **Customize Your Workflow**
- **[CLI Configuration](/cli/configuration)** - Set up project-specific settings
- **[Smart Mode](/web-app/smart-mode)** - Master automatic layer selection
- **[Integration Patterns](/integrations/github-actions)** - Add to your CI/CD pipeline

### 📚 **Explore Advanced Features**
- **[API Reference](/api/overview)** - Build custom integrations
- **[Enterprise Features](/enterprise/overview)** - Team management and reporting
- **[Custom Rules](/guides/custom-rules)** - Create organization-specific rules

## Need Help?

Stuck on something? We're here to help:

- **🐛 Found a bug?** [Report it on GitHub](https://github.com/Alcatecable)
- **💬 Have questions?** [Join our forum](https://forum.neurolint.dev)
- **📧 Need direct support?** [Email us](mailto:founder@neurolint.dev)
- **💡 Feature request?** [Share your ideas](https://forum.neurolint.dev)

---

**🎉 Congratulations!** You've successfully started your NeuroLint journey. Happy coding!