module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/__tests__/setup.ts'],

  // Test directories
  roots: ['<rootDir>/src'],

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        transpilation: true,
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // TypeScript configuration
  preset: 'ts-jest',

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/node_modules/**',
    '!src/**/dist/**',
    '!src/**/build/**',
    '!src/**/__tests__/**',
  ],

  // Setup files
  setupFilesAfterEnv: [],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,
};
