import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * NeuroLint Documentation Sidebar Configuration
 * Comprehensive structure covering all aspects of the platform
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    // Getting Started Section
    {
      type: 'category',
      label: '🚀 Getting Started',
      link: {
        type: 'generated-index',
        title: 'Getting Started with NeuroLint',
        description: 'Learn how to use NeuroLint for advanced code analysis and transformation.',
        slug: '/getting-started',
      },
      items: [
        'getting-started/introduction',
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/first-analysis',
        'getting-started/understanding-layers',
      ],
    },

    // Core Concepts
    {
      type: 'category', 
      label: '📚 Core Concepts',
      link: {
        type: 'generated-index',
        title: 'Core Concepts',
        description: 'Understand the fundamental concepts behind NeuroLint\'s analysis engine.',
        slug: '/concepts',
      },
      items: [
        'concepts/layer-system',
        'concepts/ast-parsing',
        'concepts/pattern-matching',
        'concepts/transformation-engine',
        'concepts/error-recovery',
        'concepts/adaptive-learning',
      ],
    },

    // Web Application
    {
      type: 'category',
      label: '🌐 Web Application',
      link: {
        type: 'generated-index',
        title: 'Web Application Guide',
        description: 'Use NeuroLint\'s powerful web interface for interactive code analysis.',
        slug: '/web-app',
      },
      items: [
        'web-app/overview',
        'web-app/smart-mode',
        'web-app/file-upload',
        'web-app/github-integration',
        'web-app/results-analysis',
        'web-app/export-options',
      ],
    },

    // CLI Tool
    {
      type: 'category',
      label: '⚡ CLI Tool',
      link: {
        type: 'generated-index',
        title: 'Command Line Interface',
        description: 'Integrate NeuroLint into your development workflow with the CLI.',
        slug: '/cli',
      },
      items: [
        'cli/installation',
        'cli/configuration',
        'cli/basic-usage',
        'cli/advanced-options',
        'cli/ci-cd-integration',
        'cli/automation',
      ],
    },

    // VS Code Extension
    {
      type: 'category',
      label: '🔌 VS Code Extension',
      link: {
        type: 'generated-index',
        title: 'VS Code Extension',
        description: 'Get real-time code analysis directly in your editor.',
        slug: '/vscode',
      },
      items: [
        'vscode/installation',
        'vscode/features',
        'vscode/configuration',
        'vscode/real-time-analysis',
        'vscode/quick-fixes',
        'vscode/workspace-analysis',
      ],
    },

    // API Reference
    {
      type: 'category',
      label: '🔧 API Reference',
      link: {
        type: 'generated-index',
        title: 'REST API Reference',
        description: 'Comprehensive API documentation for integrating NeuroLint into your applications.',
        slug: '/api',
      },
      items: [
        'api/overview',
        'api/authentication',
        'api/endpoints',
        'api/analyze',
        'api/transform',
        'api/layers',
        'api/enterprise',
        'api/rate-limits',
        'api/errors',
      ],
    },

    // Guides & Tutorials
    {
      type: 'category',
      label: '📖 Guides & Tutorials',
      link: {
        type: 'generated-index',
        title: 'Guides & Tutorials',
        description: 'Step-by-step guides for specific use cases and scenarios.',
        slug: '/guides',
      },
      items: [
        'guides/react-optimization',
        'guides/nextjs-migration',
        'guides/typescript-upgrade',
        'guides/accessibility-fixes',
        'guides/performance-optimization',
        'guides/legacy-code-modernization',
        'guides/team-workflows',
        'guides/custom-rules',
      ],
    },

    // Examples
    {
      type: 'category',
      label: '💡 Examples',
      link: {
        type: 'generated-index',
        title: 'Code Examples',
        description: 'Real-world examples of NeuroLint transformations and integrations.',
        slug: '/examples',
      },
      items: [
        'examples/before-after',
        'examples/layer-by-layer',
        'examples/integration-patterns',
        'examples/custom-workflows',
        'examples/enterprise-setup',
      ],
    },

    // Integrations
    {
      type: 'category',
      label: '🔗 Integrations',
      link: {
        type: 'generated-index',
        title: 'Third-party Integrations',
        description: 'Connect NeuroLint with your existing development tools.',
        slug: '/integrations',
      },
      items: [
        'integrations/github-actions',
        'integrations/jenkins',
        'integrations/gitlab-ci',
        'integrations/webpack',
        'integrations/eslint',
        'integrations/prettier',
        'integrations/husky',
        'integrations/docker',
      ],
    },

    // Enterprise
    {
      type: 'category',
      label: '🏢 Enterprise',
      link: {
        type: 'generated-index',
        title: 'Enterprise Features',
        description: 'Advanced features for enterprise teams and organizations.',
        slug: '/enterprise',
      },
      items: [
        'enterprise/overview',
        'enterprise/deployment',
        'enterprise/authentication',
        'enterprise/team-management',
        'enterprise/custom-rules',
        'enterprise/reporting',
        'enterprise/compliance',
        'enterprise/support',
      ],
    },

    // Troubleshooting
    {
      type: 'category',
      label: '🔍 Troubleshooting',
      link: {
        type: 'generated-index',
        title: 'Troubleshooting Guide',
        description: 'Common issues and their solutions.',
        slug: '/troubleshooting',
      },
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/performance',
        'troubleshooting/error-messages',
        'troubleshooting/debugging',
        'troubleshooting/support',
      ],
    },

    // Reference
    {
      type: 'category',
      label: '📋 Reference',
      link: {
        type: 'generated-index',
        title: 'Reference Materials',
        description: 'Complete reference documentation and specifications.',
        slug: '/reference',
      },
      items: [
        'reference/configuration',
        'reference/layer-specifications',
        'reference/file-formats',
        'reference/environment-variables',
        'reference/changelog',
        'reference/migration-guide',
        'reference/glossary',
      ],
    },
  ],
};

export default sidebars;
