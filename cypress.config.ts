/**
 * Cypress E2E Testing Configuration
 *
 * Configuration for end-to-end testing of the Qylon platform.
 * Supports cross-browser testing and comprehensive user journey testing.
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  typescript: {
    configFile: 'tsconfig.cypress.json',
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Test file patterns
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Support file
    supportFile: 'tests/e2e/support/e2e.ts',

    // Fixtures directory
    fixturesFolder: 'tests/e2e/fixtures',

    // Screenshots directory
    screenshotsFolder: 'tests/e2e/screenshots',

    // Videos directory
    videosFolder: 'tests/e2e/videos',

    // Downloads directory
    downloadsFolder: 'tests/e2e/downloads',

    // Environment variables
    env: {
      // API endpoints
      API_BASE_URL: 'http://localhost:3000/api/v1',
      AUTH_SERVICE_URL: 'http://localhost:3001',
      CLIENT_SERVICE_URL: 'http://localhost:3002',
      MEETING_SERVICE_URL: 'http://localhost:3003',
      CONTENT_SERVICE_URL: 'http://localhost:3004',
      WORKFLOW_SERVICE_URL: 'http://localhost:3005',
      INTEGRATION_SERVICE_URL: 'http://localhost:3006',
      NOTIFICATION_SERVICE_URL: 'http://localhost:3007',
      ANALYTICS_SERVICE_URL: 'http://localhost:3008',

      // Test data
      TEST_USER_EMAIL: 'test@qylon.com',
      TEST_USER_PASSWORD: 'TestPassword123!',
      TEST_ADMIN_EMAIL: 'admin@qylon.com',
      TEST_ADMIN_PASSWORD: 'AdminPassword123!',

      // Feature flags
      ENABLE_ANALYTICS: true,
      ENABLE_NOTIFICATIONS: true,
      ENABLE_INTEGRATIONS: true,
    },

    // Setup and teardown
    setupNodeEvents(on, config) {
      // Custom tasks
      on('task', {
        // Database tasks
        'db:seed': () => {
          // Seed test database
          return null;
        },
        'db:clean': () => {
          // Clean test database
          return null;
        },
        'db:reset': () => {
          // Reset test database
          return null;
        },

        // User tasks
        'user:create': userData => {
          // Create test user
          return userData;
        },
        'user:delete': userId => {
          // Delete test user
          return userId;
        },

        // Meeting tasks
        'meeting:create': meetingData => {
          // Create test meeting
          return meetingData;
        },
        'meeting:delete': meetingId => {
          // Delete test meeting
          return meetingId;
        },

        // Client tasks
        'client:create': clientData => {
          // Create test client
          return clientData;
        },
        'client:delete': clientId => {
          // Delete test client
          return clientId;
        },

        // Log tasks
        log: message => {
          console.log(message);
          return null;
        },
      });

      // Custom commands
      on('before:browser:launch', (browser, launchOptions) => {
        // Browser launch options
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }

        return launchOptions;
      });

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'tests/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/component/support/component.ts',
  },
});
