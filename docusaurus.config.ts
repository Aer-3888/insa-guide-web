import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'INSA Guide',
  tagline: 'Interactive Study Guide for INSA Rennes 3A Informatique',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://insa-guide.vercel.app',
  baseUrl: '/',

  organizationName: 'Aer-3888',
  projectName: 'InsaGuide',

  onBrokenLinks: 'warn',


  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },


  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 's5',
        path: 'docs/S5',
        routeBasePath: 's5',
        sidebarPath: './sidebars.ts',
        sidebarCollapsed: true,
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        editUrl: 'https://github.com/Aer-3888/InsaGuide/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 's6',
        path: 'docs/S6',
        routeBasePath: 's6',
        sidebarPath: './sidebars.ts',
        sidebarCollapsed: true,
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        editUrl: 'https://github.com/Aer-3888/InsaGuide/tree/main/',
      },
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-nB0miv6/jRmo5LUSRN0LLHkPbOxEfEGBJg1RqQcEB7sagxB4LncoFnYKOICFOJR',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'INSA Guide',
      items: [
        {
          type: 'dropdown',
          label: 'S5',
          position: 'left',
          items: [
            {label: 'ADFD', to: '/s5/ADFD/'},
            {label: 'CLP', to: '/s5/CLP/'},
            {label: 'CPOO', to: '/s5/CPOO/'},
            {label: 'ITI', to: '/s5/ITI/'},
            {label: 'Langage C', to: '/s5/Langage_C/'},
            {label: 'Probabilites', to: '/s5/Probabilites/'},
            {label: 'Prog. Fonctionnelle', to: '/s5/Programmation_Fonctionnelle/'},
            {label: 'Prog. Logique', to: '/s5/Programmation_Logique/'},
            {label: 'SDD', to: '/s5/SDD/'},
          ],
        },
        {
          type: 'dropdown',
          label: 'S6',
          position: 'left',
          items: [
            {label: 'Apprentissage Auto.', to: '/s6/Apprentissage_Automatique/'},
            {label: 'Bases de Donnees', to: '/s6/Bases_de_Donnees/'},
            {label: 'Complexite', to: '/s6/Complexite/'},
            {label: 'Graphes', to: '/s6/Graphes_Algorithmique/'},
            {label: 'Ingenierie Web', to: '/s6/Ingenierie_Web/'},
            {label: 'Parallelisme', to: '/s6/Parallelisme/'},
            {label: 'Props. et Predicats', to: '/s6/Propositions_Predicats/'},
            {label: 'Reseaux', to: '/s6/Reseaux/'},
            {label: 'Statistiques', to: '/s6/Statistiques_Descriptives/'},
            {label: 'TAL', to: '/s6/TAL/'},
            {label: 'Vulnerabilites', to: '/s6/Vulnerabilites/'},
          ],
        },
        {
          href: 'https://github.com/Aer-3888/InsaGuide',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `INSA Rennes - 3A Informatique Study Guide. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'java',
        'python',
        'c',
        'ocaml',
        'prolog',
        'r',
        'sql',
        'bash',
        'armasm',
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
