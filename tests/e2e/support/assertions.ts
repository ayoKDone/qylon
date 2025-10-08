/**
 * Custom Cypress Assertions
 *
 * Custom assertions for end-to-end testing of the Qylon platform.
 */

/// <reference types="cypress" />

// Custom assertions for form validation
Cypress.Commands.add('shouldHaveFormErrors', (formTestId: string, expectedErrors: string[]) => {
  cy.get(`[data-testid="${formTestId}"]`).within(() => {
    expectedErrors.forEach(error => {
      cy.get(`[data-testid="error-${error}"]`).should('be.visible');
    });
  });
});

Cypress.Commands.add('shouldNotHaveFormErrors', (formTestId: string) => {
  cy.get(`[data-testid="${formTestId}"]`).within(() => {
    cy.get('[data-testid^="error-"]').should('not.exist');
  });
});

// Custom assertions for table data
Cypress.Commands.add('shouldHaveTableData', (tableTestId: string, expectedData: any[]) => {
  cy.get(`[data-testid="${tableTestId}"] tbody tr`).should('have.length', expectedData.length);

  expectedData.forEach((rowData, index) => {
    cy.get(`[data-testid="${tableTestId}"] tbody tr:nth-child(${index + 1})`).within(() => {
      Object.entries(rowData).forEach(([key, value]) => {
        cy.get(`[data-testid="cell-${key}"]`).should('contain', value);
      });
    });
  });
});

Cypress.Commands.add('shouldHaveEmptyTable', (tableTestId: string) => {
  cy.get(`[data-testid="${tableTestId}"] tbody tr`).should('not.exist');
  cy.get(`[data-testid="${tableTestId}"] [data-testid="no-data"]`).should('be.visible');
});

// Custom assertions for API responses
Cypress.Commands.add(
  'shouldHaveAPIResponse',
  (alias: string, expectedStatus: number, expectedData?: any) => {
    cy.wait(alias).then(interception => {
      expect(interception.response.statusCode).to.equal(expectedStatus);

      if (expectedData) {
        expect(interception.response.body).to.deep.include(expectedData);
      }
    });
  }
);

Cypress.Commands.add(
  'shouldHaveAPIError',
  (alias: string, expectedStatus: number, expectedError?: string) => {
    cy.wait(alias).then(interception => {
      expect(interception.response.statusCode).to.equal(expectedStatus);

      if (expectedError) {
        expect(interception.response.body.error).to.include(expectedError);
      }
    });
  }
);

// Custom assertions for user authentication
Cypress.Commands.add('shouldBeLoggedIn', (expectedUser?: any) => {
  cy.get('[data-testid="user-menu"]').should('be.visible');
  cy.get('[data-testid="logout-button"]').should('be.visible');

  if (expectedUser) {
    cy.get('[data-testid="user-email"]').should('contain', expectedUser.email);
    cy.get('[data-testid="user-name"]').should('contain', expectedUser.name);
  }
});

Cypress.Commands.add('shouldBeLoggedOut', () => {
  cy.url().should('include', '/login');
  cy.get('[data-testid="login-form"]').should('be.visible');
  cy.get('[data-testid="user-menu"]').should('not.exist');
});

// Custom assertions for navigation
Cypress.Commands.add('shouldBeOnPage', (expectedPath: string) => {
  cy.url().should('include', expectedPath);
});

Cypress.Commands.add('shouldHaveActiveNavItem', (navItemTestId: string) => {
  cy.get(`[data-testid="${navItemTestId}"]`).should('have.class', 'active');
});

// Custom assertions for loading states
Cypress.Commands.add('shouldShowLoading', (testId: string) => {
  cy.get(`[data-testid="${testId}"] [data-testid="loading"]`).should('be.visible');
});

Cypress.Commands.add('shouldHideLoading', (testId: string) => {
  cy.get(`[data-testid="${testId}"] [data-testid="loading"]`).should('not.be.visible');
});

// Custom assertions for modals
Cypress.Commands.add('shouldShowModal', (modalTestId: string) => {
  cy.get(`[data-testid="${modalTestId}"]`).should('be.visible');
  cy.get(`[data-testid="${modalTestId}"]`).should('have.class', 'modal-open');
});

Cypress.Commands.add('shouldHideModal', (modalTestId: string) => {
  cy.get(`[data-testid="${modalTestId}"]`).should('not.be.visible');
});

// Custom assertions for notifications
Cypress.Commands.add('shouldShowSuccessNotification', (message: string) => {
  cy.get('[data-testid="notification-success"]').should('be.visible');
  cy.get('[data-testid="notification-success"]').should('contain', message);
});

Cypress.Commands.add('shouldShowErrorNotification', (message: string) => {
  cy.get('[data-testid="notification-error"]').should('be.visible');
  cy.get('[data-testid="notification-error"]').should('contain', message);
});

Cypress.Commands.add('shouldShowWarningNotification', (message: string) => {
  cy.get('[data-testid="notification-warning"]').should('be.visible');
  cy.get('[data-testid="notification-warning"]').should('contain', message);
});

Cypress.Commands.add('shouldShowInfoNotification', (message: string) => {
  cy.get('[data-testid="notification-info"]').should('be.visible');
  cy.get('[data-testid="notification-info"]').should('contain', message);
});

// Custom assertions for form fields
Cypress.Commands.add('shouldHaveFieldValue', (fieldTestId: string, expectedValue: string) => {
  cy.get(`[data-testid="${fieldTestId}"]`).should('have.value', expectedValue);
});

Cypress.Commands.add('shouldHaveFieldError', (fieldTestId: string, expectedError: string) => {
  cy.get(`[data-testid="${fieldTestId}"]`).should('have.class', 'error');
  cy.get(`[data-testid="${fieldTestId}"] + [data-testid="field-error"]`).should(
    'contain',
    expectedError
  );
});

Cypress.Commands.add('shouldNotHaveFieldError', (fieldTestId: string) => {
  cy.get(`[data-testid="${fieldTestId}"]`).should('not.have.class', 'error');
  cy.get(`[data-testid="${fieldTestId}"] + [data-testid="field-error"]`).should('not.exist');
});

// Custom assertions for buttons
Cypress.Commands.add('shouldHaveDisabledButton', (buttonTestId: string) => {
  cy.get(`[data-testid="${buttonTestId}"]`).should('be.disabled');
});

Cypress.Commands.add('shouldHaveEnabledButton', (buttonTestId: string) => {
  cy.get(`[data-testid="${buttonTestId}"]`).should('not.be.disabled');
});

// Custom assertions for checkboxes and radio buttons
Cypress.Commands.add('shouldHaveCheckedCheckbox', (checkboxTestId: string) => {
  cy.get(`[data-testid="${checkboxTestId}"]`).should('be.checked');
});

Cypress.Commands.add('shouldHaveUncheckedCheckbox', (checkboxTestId: string) => {
  cy.get(`[data-testid="${checkboxTestId}"]`).should('not.be.checked');
});

Cypress.Commands.add('shouldHaveSelectedRadio', (radioTestId: string) => {
  cy.get(`[data-testid="${radioTestId}"]`).should('be.checked');
});

// Custom assertions for select elements
Cypress.Commands.add('shouldHaveSelectedOption', (selectTestId: string, expectedValue: string) => {
  cy.get(`[data-testid="${selectTestId}"]`).should('have.value', expectedValue);
});

// Custom assertions for file uploads
Cypress.Commands.add('shouldHaveUploadedFile', (inputTestId: string, fileName: string) => {
  cy.get(`[data-testid="${inputTestId}"]`).should('contain', fileName);
});

// Custom assertions for pagination
Cypress.Commands.add(
  'shouldHavePagination',
  (paginationTestId: string, currentPage: number, totalPages: number) => {
    cy.get(`[data-testid="${paginationTestId}"]`).should('be.visible');
    cy.get(`[data-testid="${paginationTestId}"] [data-testid="current-page"]`).should(
      'contain',
      currentPage
    );
    cy.get(`[data-testid="${paginationTestId}"] [data-testid="total-pages"]`).should(
      'contain',
      totalPages
    );
  }
);

// Custom assertions for search
Cypress.Commands.add('shouldHaveSearchResults', (searchTestId: string, expectedCount: number) => {
  cy.get(`[data-testid="${searchTestId}"] [data-testid="search-results"]`).should(
    'have.length',
    expectedCount
  );
});

Cypress.Commands.add('shouldHaveNoSearchResults', (searchTestId: string) => {
  cy.get(`[data-testid="${searchTestId}"] [data-testid="no-results"]`).should('be.visible');
});

// Custom assertions for data validation
Cypress.Commands.add('shouldHaveValidEmail', (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(email).to.match(emailRegex);
});

Cypress.Commands.add('shouldHaveValidUUID', (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(uuid).to.match(uuidRegex);
});

Cypress.Commands.add('shouldHaveValidDate', (date: string) => {
  const dateObj = new Date(date);
  expect(dateObj).to.be.a('date');
  expect(dateObj.getTime()).to.not.be.NaN;
});

// Custom assertions for performance
Cypress.Commands.add('shouldLoadWithinTime', (testId: string, maxTime: number) => {
  const startTime = Date.now();

  cy.get(`[data-testid="${testId}"]`)
    .should('be.visible')
    .then(() => {
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(maxTime);
    });
});

// Custom assertions for accessibility
Cypress.Commands.add('shouldBeAccessible', (testId?: string) => {
  if (testId) {
    cy.get(`[data-testid="${testId}"]`).checkA11y();
  } else {
    cy.checkA11y();
  }
});

// Custom assertions for responsive design
Cypress.Commands.add('shouldBeResponsive', (testId: string) => {
  // Test mobile viewport
  cy.viewport(375, 667);
  cy.get(`[data-testid="${testId}"]`).should('be.visible');

  // Test tablet viewport
  cy.viewport(768, 1024);
  cy.get(`[data-testid="${testId}"]`).should('be.visible');

  // Test desktop viewport
  cy.viewport(1280, 720);
  cy.get(`[data-testid="${testId}"]`).should('be.visible');
});

// Type definitions for custom assertions
declare global {
  namespace Cypress {
    interface Chainable {
      // Form validation assertions
      shouldHaveFormErrors(formTestId: string, expectedErrors: string[]): Chainable<void>;
      shouldNotHaveFormErrors(formTestId: string): Chainable<void>;

      // Table data assertions
      shouldHaveTableData(tableTestId: string, expectedData: any[]): Chainable<void>;
      shouldHaveEmptyTable(tableTestId: string): Chainable<void>;

      // API response assertions
      shouldHaveAPIResponse(
        alias: string,
        expectedStatus: number,
        expectedData?: any
      ): Chainable<void>;
      shouldHaveAPIError(
        alias: string,
        expectedStatus: number,
        expectedError?: string
      ): Chainable<void>;

      // Authentication assertions
      shouldBeLoggedIn(expectedUser?: any): Chainable<void>;
      shouldBeLoggedOut(): Chainable<void>;

      // Navigation assertions
      shouldBeOnPage(expectedPath: string): Chainable<void>;
      shouldHaveActiveNavItem(navItemTestId: string): Chainable<void>;

      // Loading state assertions
      shouldShowLoading(testId: string): Chainable<void>;
      shouldHideLoading(testId: string): Chainable<void>;

      // Modal assertions
      shouldShowModal(modalTestId: string): Chainable<void>;
      shouldHideModal(modalTestId: string): Chainable<void>;

      // Notification assertions
      shouldShowSuccessNotification(message: string): Chainable<void>;
      shouldShowErrorNotification(message: string): Chainable<void>;
      shouldShowWarningNotification(message: string): Chainable<void>;
      shouldShowInfoNotification(message: string): Chainable<void>;

      // Form field assertions
      shouldHaveFieldValue(fieldTestId: string, expectedValue: string): Chainable<void>;
      shouldHaveFieldError(fieldTestId: string, expectedError: string): Chainable<void>;
      shouldNotHaveFieldError(fieldTestId: string): Chainable<void>;

      // Button assertions
      shouldHaveDisabledButton(buttonTestId: string): Chainable<void>;
      shouldHaveEnabledButton(buttonTestId: string): Chainable<void>;

      // Checkbox and radio assertions
      shouldHaveCheckedCheckbox(checkboxTestId: string): Chainable<void>;
      shouldHaveUncheckedCheckbox(checkboxTestId: string): Chainable<void>;
      shouldHaveSelectedRadio(radioTestId: string): Chainable<void>;

      // Select assertions
      shouldHaveSelectedOption(selectTestId: string, expectedValue: string): Chainable<void>;

      // File upload assertions
      shouldHaveUploadedFile(inputTestId: string, fileName: string): Chainable<void>;

      // Pagination assertions
      shouldHavePagination(
        paginationTestId: string,
        currentPage: number,
        totalPages: number
      ): Chainable<void>;

      // Search assertions
      shouldHaveSearchResults(searchTestId: string, expectedCount: number): Chainable<void>;
      shouldHaveNoSearchResults(searchTestId: string): Chainable<void>;

      // Data validation assertions
      shouldHaveValidEmail(email: string): Chainable<void>;
      shouldHaveValidUUID(uuid: string): Chainable<void>;
      shouldHaveValidDate(date: string): Chainable<void>;

      // Performance assertions
      shouldLoadWithinTime(testId: string, maxTime: number): Chainable<void>;

      // Accessibility assertions
      shouldBeAccessible(testId?: string): Chainable<void>;

      // Responsive design assertions
      shouldBeResponsive(testId: string): Chainable<void>;
    }
  }
}
