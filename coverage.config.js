/**
 * Code Coverage Configuration for Qylon Platform
 *
 * Comprehensive coverage configuration with thresholds and reporting.
 * Ensures 95%+ coverage across all services and components.
 */

module.exports = {
  // Coverage collection configuration
  collectCoverage: true,
  collectCoverageFrom: [
    // Include all source files
    'services/**/*.{ts,tsx,js,jsx}',
    'shared/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,tsx,js,jsx}',

    // Exclude test files, config files, and generated files
    '!**/*.test.{ts,tsx,js,jsx}',
    '!**/*.spec.{ts,tsx,js,jsx}',
    '!**/*.config.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/cypress/**',
    '!**/tests/**',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/index.js',
  ],

  // Coverage thresholds - 95%+ as per requirements
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // Service-specific thresholds
    'services/api-gateway/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'services/security/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'services/meeting-intelligence/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'services/workflow-automation/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'services/integration-management/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'services/notification-service/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'services/analytics-reporting/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'shared/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary',
    'clover',
    'cobertura',
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage report formats
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary',
    'clover',
    'cobertura',
  ],

  // HTML coverage report configuration
  coverageReporters: [
    ['html', { subdir: 'html' }],
    ['lcov', { subdir: 'lcov' }],
    ['json', { subdir: 'json' }],
    ['text', { subdir: 'text' }],
    ['text-summary', { subdir: 'text-summary' }],
  ],

  // Coverage provider
  coverageProvider: 'v8',

  // Coverage environment
  testEnvironment: 'node',

  // Coverage setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Coverage transform
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Coverage module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Coverage test match patterns
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)',
  ],

  // Coverage ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/cypress/',
    '/tests/performance/',
  ],

  // Coverage transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(module-that-needs-to-be-transformed)/)',
  ],

  // Coverage module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Coverage globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // Coverage verbose output
  verbose: true,

  // Coverage clear mocks
  clearMocks: true,

  // Coverage restore mocks
  restoreMocks: true,

  // Coverage reset mocks
  resetMocks: true,

  // Coverage reset modules
  resetModules: true,

  // Coverage error on deprecated
  errorOnDeprecated: true,

  // Coverage force exit
  forceExit: true,

  // Coverage detect open handles
  detectOpenHandles: true,

  // Coverage detect leaks
  detectLeaks: true,

  // Coverage max workers
  maxWorkers: '50%',

  // Coverage cache
  cache: true,

  // Coverage cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Coverage watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Coverage notification
  notify: true,

  // Coverage notification mode
  notifyMode: 'failure-change',

  // Coverage reporters for CI
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Qylon Platform Test Report',
        logoImgPath: undefined,
        darkTheme: false,
      },
    ],
  ],
};
