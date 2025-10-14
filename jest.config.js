module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)'],

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

  // Test directories - include services and tests for our microservices architecture
  roots: ['<rootDir>/services', '<rootDir>/tests'],

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

  // Coverage configuration - include services for our microservices architecture
  collectCoverageFrom: [
    'services/**/*.{js,jsx,ts,tsx}',
    '!services/**/*.d.ts',
    '!services/**/node_modules/**',
    '!services/**/dist/**',
    '!services/**/build/**',
    '!**/__tests__/**',
    '!**/cypress/**',
  ],

  // Setup files - use our test setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform ignore patterns - Allow transformation of specific node_modules
  transformIgnorePatterns: ['node_modules/(?!(uuid|jsonwebtoken)/)'],

  // Global setup
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
};
