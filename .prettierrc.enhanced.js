/**
 * Enhanced Prettier Configuration for Qylon Platform
 *
 * Comprehensive Prettier configuration for consistent code formatting.
 * Ensures uniform code style across the entire platform.
 */

module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        tabWidth: 2,
        htmlWhitespaceSensitivity: 'css',
      },
    },
    {
      files: '*.css',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.scss',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
  ],

  // Plugins for additional language support
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-organize-imports'],

  // Import sorting configuration
  importOrder: ['^react$', '^react-dom$', '^next$', '^@?\\w', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,

  // Organize imports
  organizeImportsSkipDestructiveCodeActions: true,
};
