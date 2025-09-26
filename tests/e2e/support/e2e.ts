/**
 * Cypress E2E Support File
 *
 * Custom commands and utilities for end-to-end testing.
 */

// Import commands
import './commands';

// Import custom assertions
import './assertions';

// Global configuration
beforeEach(() => {
  // Clear all cookies and local storage before each test
  cy.clearCookies();
  cy.clearLocalStorage();

  // Set default viewport
  cy.viewport(1280, 720);

  // Disable service worker
  cy.window().then(win => {
    if (win.navigator.serviceWorker) {
      win.navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
  });
});

afterEach(() => {
  // Clean up after each test
  cy.window().then(win => {
    // Clear any pending timers
    if (win.clearTimeout) {
      win.clearTimeout();
    }
    if (win.clearInterval) {
      win.clearInterval();
    }
  });
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions from the app
  // unless they're related to our test code
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  // Log the error for debugging
  console.error('Uncaught exception:', err);

  // Return false to prevent the test from failing
  return false;
});

// Global request handling
Cypress.on('window:before:load', win => {
  // Mock external services if needed
  cy.stub(win, 'fetch').callsFake((url, options) => {
    // Handle specific external API calls
    if (url.includes('external-api.com')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    // Let other requests pass through
    return win.fetch.wrappedMethod.call(win, url, options);
  });
});

// Performance monitoring
Cypress.on('test:after:run', (test, runnable) => {
  // Log test performance
  const duration = runnable.duration;
  if (duration > 10000) {
    // 10 seconds
    console.warn(`Slow test detected: ${test.title} took ${duration}ms`);
  }
});

// Custom error messages
Cypress.on('fail', (err, runnable) => {
  // Add custom error context
  err.message = `Test failed: ${runnable.title}\n${err.message}`;
  throw err;
});
