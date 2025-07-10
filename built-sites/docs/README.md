# NeuroLint Documentation Site

> **Comprehensive documentation for the NeuroLint platform at [docs.neurolint.dev](https://docs.neurolint.dev)**

This repository contains the complete documentation site for NeuroLint, built with [Docusaurus](https://docusaurus.io/). The site provides comprehensive guides, API references, tutorials, and examples for all NeuroLint tools and features.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The site will open at `http://localhost:3000`. Most changes are reflected live without restarting the server.

### Build for Production

```bash
# Generate static files
npm run build

# Serve built site locally
npm run serve
```

## 📁 Project Structure

```
docs/
├── docs/                          # Documentation content (Markdown)
│   ├── getting-started/            # Getting started guides
│   │   ├── introduction.md          # Platform introduction
│   │   ├── quick-start.md           # 5-minute quick start
│   │   ├── installation.md          # Installation guides
│   │   ├── first-analysis.md        # First analysis tutorial
│   │   └── understanding-layers.md  # Layer system overview
│   ├── concepts/                    # Core concepts and architecture
│   ├── web-app/                     # Web application guides
│   ├── cli/                         # CLI tool documentation
│   ├── vscode/                      # VS Code extension docs
│   ├── api/                         # REST API reference
│   │   └── overview.md              # API overview and examples
│   ├── guides/                      # Step-by-step tutorials
│   ├── examples/                    # Code examples and use cases
│   ├── integrations/                # Third-party integrations
│   ├── enterprise/                  # Enterprise features
│   ├── troubleshooting/             # Common issues and solutions
│   └── reference/                   # Reference materials
├── src/                            # React components and pages
│   ├── components/                  # Custom components
│   ├── css/                         # Custom styles
│   │   └── custom.css               # NeuroLint branded styling
│   └── pages/                       # Custom pages
├── static/                         # Static assets
│   ├── img/                         # Images and logos
│   └── ...                         # Other static files
├── docusaurus.config.ts            # Docusaurus configuration
├── sidebars.ts                     # Sidebar navigation structure
└── package.json                   # Dependencies and scripts
```

## 🎨 Design & Branding

### Theme
The documentation site uses a **dark terminal-inspired theme** that matches the NeuroLint brand:

- **Colors**: Black/zinc backgrounds with blue accent colors
- **Typography**: Inter font for text, JetBrains Mono for code
- **Components**: Custom-styled cards, buttons, and code blocks
- **Navigation**: Responsive sidebar with emoji categories

### Key Features
- ✅ **Dark theme by default** with light theme option
- ✅ **Responsive design** for mobile and desktop
- ✅ **Search functionality** (Algolia integration ready)
- ✅ **Code syntax highlighting** with VS Code Dark theme
- ✅ **Interactive examples** with copy-to-clipboard
- ✅ **Cross-linking** to all NeuroLint properties

## 📝 Content Structure

### Main Sections

1. **🚀 Getting Started** - Quick start and installation guides
2. **📚 Core Concepts** - Understanding NeuroLint's architecture
3. **🌐 Web Application** - Using the web interface
4. **⚡ CLI Tool** - Command-line interface documentation
5. **🔌 VS Code Extension** - Editor integration guides
6. **🔧 API Reference** - REST API documentation
7. **📖 Guides & Tutorials** - Step-by-step workflows
8. **💡 Examples** - Real-world code examples
9. **🔗 Integrations** - Third-party tool integration
10. **🏢 Enterprise** - Advanced features for teams
11. **🔍 Troubleshooting** - Common issues and solutions
12. **📋 Reference** - Complete specifications and configs

### Content Guidelines

- **Clear headings** with emoji indicators for easy scanning
- **Code examples** for every feature and API endpoint
- **Before/after transformations** to show NeuroLint's value
- **Cross-references** between related topics
- **Progressive disclosure** from basic to advanced topics

## 🔧 Configuration

### Key Configuration Files

#### `docusaurus.config.ts`
Main site configuration with:
- **URL**: `https://docs.neurolint.dev`
- **Branding**: NeuroLint logos and titles
- **Navigation**: Links to all NeuroLint properties
- **Footer**: Comprehensive site-wide links
- **Search**: Algolia integration (configured)
- **Analytics**: Ready for Google Analytics

#### `sidebars.ts`
Comprehensive sidebar structure with:
- **11 main categories** covering all aspects
- **Generated index pages** for each section
- **Logical progression** from basic to advanced
- **Visual indicators** using emojis

#### `src/css/custom.css`
Custom styling featuring:
- **NeuroLint brand colors** (blue accent, black/zinc backgrounds)
- **Terminal-inspired design** with custom fonts
- **Enhanced components** (cards, buttons, code blocks)
- **Responsive layout** for all screen sizes

## 🌐 Deployment

### GitHub Pages
The site is configured for deployment to GitHub Pages:

```bash
# Build and deploy
npm run deploy
```

### Custom Domain
The site is configured to serve from `docs.neurolint.dev`:

1. **DNS Setup**: Point `docs.neurolint.dev` to GitHub Pages
2. **Custom Domain**: Configure in repository settings
3. **HTTPS**: Automatically enabled via GitHub Pages

### Environment Variables
For search and analytics features:

```bash
# Algolia Search (optional)
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_api_key
ALGOLIA_INDEX_NAME=neurolint

# Google Analytics (optional)
GA_TRACKING_ID=your_tracking_id
```

## 🔗 Cross-linking Strategy

The documentation site is fully integrated with the NeuroLint ecosystem:

### Navigation Links
- **Main Site**: [neurolint.dev](https://neurolint.dev)
- **Web App**: [app.neurolint.dev](https://app.neurolint.dev)
- **VS Code Extension**: [vs.neurolint.dev](https://vs.neurolint.dev)
- **CLI Tool**: [cli.neurolint.dev](https://cli.neurolint.dev)
- **Community Forum**: [forum.neurolint.dev](https://forum.neurolint.dev)

### Footer Links
Comprehensive footer with organized sections:
- **Documentation** - Links to key docs sections
- **Tools** - Links to all NeuroLint tools
- **Community** - Forum, GitHub, main website
- **Enterprise** - Business features and contact

### Content Cross-references
- **API examples** link to web app and CLI docs
- **Getting started** guides reference all tools
- **Tutorials** include links to relevant API endpoints
- **Troubleshooting** links to support channels

## 🤝 Contributing

### Content Updates
1. **Fork** the repository
2. **Create** a new branch for your changes
3. **Edit** Markdown files in the `docs/` directory
4. **Test** locally with `npm start`
5. **Submit** a pull request

### Style Guide
- Use **clear, concise language**
- Include **code examples** for technical content
- Add **cross-references** to related topics
- Follow **existing formatting** patterns
- Use **emoji indicators** in headings for consistency

### Adding New Pages
1. Create Markdown file in appropriate `docs/` subdirectory
2. Add to `sidebars.ts` configuration
3. Include **frontmatter** with position and metadata
4. Link from related pages

## 📊 Analytics & Performance

### Metrics to Track
- **Page views** and popular content
- **Search queries** and common searches
- **External link clicks** to NeuroLint tools
- **Time on page** and engagement

### Performance Optimizations
- **Static generation** for fast loading
- **Image optimization** with WebP format
- **Code splitting** for smaller bundles
- **CDN deployment** via GitHub Pages

## 📞 Support

### For Documentation Issues
- **📧 Email**: [docs@neurolint.dev](mailto:docs@neurolint.dev)
- **🐛 Issues**: [GitHub Issues](https://github.com/Alcatecable/docs/issues)
- **💬 Discussion**: [Community Forum](https://forum.neurolint.dev)

### For NeuroLint Features
- **📖 Documentation**: This site
- **💬 Community**: [forum.neurolint.dev](https://forum.neurolint.dev)
- **📧 Support**: [founder@neurolint.dev](mailto:founder@neurolint.dev)

---

## 🏆 What's Built

This documentation site provides:

✅ **Comprehensive coverage** of all NeuroLint features  
✅ **Professional design** matching NeuroLint branding  
✅ **Interactive examples** with real code transformations  
✅ **Complete API reference** with authentication and examples  
✅ **Cross-linking** to all NeuroLint properties  
✅ **Mobile-responsive** design for all devices  
✅ **Search functionality** (Algolia integration ready)  
✅ **Fast performance** with static site generation  

**Ready to help users master NeuroLint!** 🚀

Built with ❤️ for the NeuroLint community.
