/**
 * Lint-staged Configuration for Qylon Platform
 *
 * Runs linters and formatters on staged files before commits.
 * Ensures code quality and consistency across the platform.
 */

module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON files
  '*.json': ['prettier --write'],

  // Markdown files
  '*.md': ['prettier --write'],

  // YAML files
  '*.{yml,yaml}': ['prettier --write'],

  // CSS and SCSS files
  '*.{css,scss}': ['prettier --write'],

  // HTML files
  '*.html': ['prettier --write'],

  // Package.json files
  'package.json': ['prettier --write', 'npm audit --audit-level moderate'],

  // Docker files
  'Dockerfile*': ['prettier --write'],

  // Configuration files
  '*.config.{js,ts}': ['eslint --fix', 'prettier --write'],

  // Test files
  '**/*.test.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Spec files
  '**/*.spec.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Cypress test files
  'cypress/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Service files
  'services/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Shared files
  'shared/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Script files
  'scripts/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Database files
  'database/**/*.sql': ['prettier --write'],

  // Infrastructure files
  'infrastructure/**/*.{tf,hcl}': ['prettier --write'],

  // Documentation files
  'docs/**/*.md': ['prettier --write'],

  // All files (fallback)
  '*': ['prettier --write --ignore-unknown'],
};
