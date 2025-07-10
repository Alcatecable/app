import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'NeuroLint Documentation',
  tagline: 'Advanced rule-based code analysis and transformation platform',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.neurolint.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'Alcatecable', // Your GitHub org/user name.
  projectName: 'docs', // Your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/Alcatecable/docs/tree/main/',
          routeBasePath: '/', // Serve docs at site root
        },
        blog: false, // Disable blog since we'll have a separate blog.neurolint.dev
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/neurolint-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'NeuroLint',
      logo: {
        alt: 'NeuroLint Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'dropdown',
          label: 'Tools',
          position: 'left',
          items: [
            {
              label: 'VS Code Extension',
              href: 'https://vs.neurolint.dev',
            },
            {
              label: 'CLI Tool',
              href: 'https://cli.neurolint.dev',
            },
            {
              label: 'Web App',
              href: 'https://app.neurolint.dev',
            },
          ],
        },
        {
          href: 'https://forum.neurolint.dev',
          label: 'Forum',
          position: 'left',
        },
        {
          href: 'https://api.neurolint.dev',
          label: 'API',
          position: 'right',
        },
        {
          href: 'https://neurolint.dev',
          label: 'Main Site',
          position: 'right',
        },
        {
          href: 'https://github.com/Alcatecable',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started',
            },
            {
              label: 'API Reference',
              to: '/api',
            },
            {
              label: 'CLI Guide',
              to: '/cli',
            },
            {
              label: 'VS Code Extension',
              to: '/vscode',
            },
          ],
        },
        {
          title: 'Tools',
          items: [
            {
              label: 'Web Application',
              href: 'https://app.neurolint.dev',
            },
            {
              label: 'VS Code Extension',
              href: 'https://vs.neurolint.dev',
            },
            {
              label: 'CLI Tool',
              href: 'https://cli.neurolint.dev',
            },
            {
              label: 'API Playground',
              href: 'https://api.neurolint.dev',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Forum',
              href: 'https://forum.neurolint.dev',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Alcatecable',
            },
            {
              label: 'Main Website',
              href: 'https://neurolint.dev',
            },
          ],
        },
        {
          title: 'Enterprise',
          items: [
            {
              label: 'Enterprise Features',
              to: '/enterprise',
            },
            {
              label: 'Contact Sales',
              href: 'mailto:founder@neurolint.dev?subject=Enterprise%20Inquiry',
            },
            {
              label: 'Support',
              href: 'https://app.neurolint.dev/contact',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NeuroLint. Built with ❤️ for developers.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'jsx', 'tsx'],
    },
    algolia: {
      // The application ID provided by Algolia
      appId: 'YOUR_APP_ID',
      
      // Public API key: it is safe to commit it
      apiKey: 'YOUR_SEARCH_API_KEY',
      
      indexName: 'neurolint',
      
      // Optional: see doc section below
      contextualSearch: true,
      
      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      externalUrlRegex: 'external\\.com|domain\\.com',
      
      // Optional: Algolia search parameters
      searchParameters: {},
      
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
      
      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
