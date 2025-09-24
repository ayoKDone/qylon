module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],

  // Exclude Cypress files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/cypress/',
    '.*\\.cy\\.ts$',
    '.*\\.cy\\.tsx$',
  ],

  // Test directories
  roots: ['<rootDir>/tests', '<rootDir>/shared'],

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // TypeScript configuration
  preset: 'ts-jest',

  // Coverage configuration
  collectCoverageFrom: [
    'services/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!services/**/*.d.ts',
    '!shared/**/*.d.ts',
    '!services/**/node_modules/**',
    '!shared/**/node_modules/**',
    '!services/**/dist/**',
    '!shared/**/dist/**',
    '!services/**/build/**',
    '!shared/**/build/**',
    '!**/tests/**',
    '!**/cypress/**',
  ],

  // Coverage thresholds - Realistic targets for current development phase
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
};
