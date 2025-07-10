# NeuroLint Unified Design System

## Overview

This document outlines the unified design system implemented across all NeuroLint subdomains to ensure consistent branding and user experience.

## Affected Domains

- **app.neurolint.dev** - Main Application
- **docs.neurolint.dev** - Documentation Site  
- **forum.neurolint.dev** - Community Forum
- **cli.neurolint.dev** - CLI Tool Site
- **vs.neurolint.dev** - VS Code Extension Site

## Design Philosophy

### Minimal & Clean
- **Primary buttons**: White background with black text
- **Minimal blue usage**: Electric blue (#0066FF) reserved for accents only
- **Pure black backgrounds** with clean white text
- **Terminal-inspired aesthetics** with modern typography

### Color Palette

#### Core Colors
```css
--background: #000000;           /* Pure Black */
--foreground: #FAFAFA;           /* Clean White */
--primary: #FFFFFF;              /* White buttons */
--primary-foreground: #000000;   /* Black text on buttons */
--blue-accent: #0066FF;          /* Electric Blue - minimal usage */
```

#### Surface Colors
```css
--card: #1A1A1A;                 /* Dark Surface */
--surface: #1A1A1A;              /* Card backgrounds */
--border: #333333;               /* Dark borders */
--muted: #A6A6A6;                /* Muted text */
```

## Typography

### Font Stack
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for code)

### Hierarchy
```css
h1: 2.5rem, font-weight: 800
h2: 2rem, font-weight: 700  
h3: 1.5rem, font-weight: 700
body: 1rem, font-weight: 400
```

## Button System

### Primary Buttons
```css
.btn-primary {
  background: #FFFFFF;
  color: #000000;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
}

.btn-primary:hover {
  background: #F5F5F5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}
```

### Secondary Buttons
```css
.btn-secondary {
  background: transparent;
  border: 1px solid #333333;
  color: #FAFAFA;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #0066FF;
}
```

## Blue Accent Usage

The electric blue (#0066FF) should be used **sparingly** and only for:

✅ **Appropriate Usage:**
- Active navigation states
- Focus indicators
- Icon backgrounds (small elements)
- Hover states on borders
- Links and interactive elements
- Progress indicators

❌ **Avoid Using For:**
- Primary buttons (use white instead)
- Large background areas
- Main call-to-action elements
- Headers and titles

## Component Examples

### Navigation
```html
<nav class="bg-black border-b border-gray-800">
  <a href="#" class="text-white hover:text-blue-accent">Link</a>
</nav>
```

### Cards
```html
<div class="bg-gray-900 border border-gray-800 hover:border-white/20 rounded-xl p-6">
  <h3 class="text-white font-bold">Card Title</h3>
  <p class="text-gray-400">Card content</p>
</div>
```

### Buttons
```html
<!-- Primary action -->
<button class="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold">
  Primary Action
</button>

<!-- Secondary action -->
<button class="border border-gray-600 text-white hover:border-blue-accent px-6 py-3 rounded-lg">
  Secondary Action
</button>
```

## Implementation Files

### Main Application
- `src/index.css` - Core design system
- `tailwind.config.ts` - Tailwind configuration
- `src/main.tsx` - Dark theme enforcement

### Built Sites
- `built-sites/forum/index.html` - Forum styling
- `built-sites/cli/index.html` - CLI site styling  
- `built-sites/vs/index.html` - VS Code extension styling
- `built-sites/docs/src/css/custom.css` - Docusaurus theme

## Logo Usage

All sites use the unified bee logo (`Bee logo.png`) with consistent sizing:
- **Standard size**: 32x32px with 8px border radius
- **Large size**: 48x48px for hero sections

## Terminal Aesthetic

Code blocks and terminal elements use:
```css
background: #141414;
color: #22C55E;  /* Terminal green */
font-family: 'JetBrains Mono';
border: 1px solid #333333;
border-radius: 12px;
```

## Responsive Design

- Mobile-first approach
- Consistent breakpoints across all sites
- Optimized touch targets (minimum 44px)
- Readable typography at all screen sizes

## Accessibility

- High contrast ratios (white on black)
- Focus indicators using blue accent
- Semantic HTML structure
- Screen reader friendly

## Maintenance

When updating the design system:

1. **Update core variables** in `src/index.css`
2. **Propagate changes** to all built-sites
3. **Test across all subdomains**
4. **Update this documentation**

## Migration Notes

### Previous vs Current
- **Before**: Heavy blue branding with blue buttons
- **After**: Minimal design with white buttons and strategic blue accents

### Key Changes Made
- Changed primary buttons from blue to white
- Reduced blue color usage by 80%
- Unified typography across all sites
- Standardized spacing and border radius
- Implemented consistent logo usage

---

*Last updated: January 2025*
*Version: 1.0*