/**
 * Custom Cypress Commands
 *
 * Reusable commands for end-to-end testing of the Qylon platform.
 */

/// <reference types="cypress" />

// Authentication commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('TEST_ADMIN_EMAIL'), Cypress.env('TEST_ADMIN_PASSWORD'));
});

Cypress.Commands.add('loginAsUser', () => {
  cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Navigation commands
Cypress.Commands.add('navigateTo', (path: string) => {
  cy.visit(path);
  cy.url().should('include', path);
});

Cypress.Commands.add('navigateToDashboard', () => {
  cy.navigateTo('/dashboard');
  cy.get('[data-testid="dashboard-title"]').should('be.visible');
});

Cypress.Commands.add('navigateToMeetings', () => {
  cy.navigateTo('/meetings');
  cy.get('[data-testid="meetings-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToClients', () => {
  cy.navigateTo('/clients');
  cy.get('[data-testid="clients-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToSettings', () => {
  cy.navigateTo('/settings');
  cy.get('[data-testid="settings-page"]').should('be.visible');
});

// Data management commands
Cypress.Commands.add('createTestUser', (userData: any) => {
  cy.task('user:create', userData).then(user => {
    return user;
  });
});

Cypress.Commands.add('createTestClient', (clientData: any) => {
  cy.task('client:create', clientData).then(client => {
    return client;
  });
});

Cypress.Commands.add('createTestMeeting', (meetingData: any) => {
  cy.task('meeting:create', meetingData).then(meeting => {
    return meeting;
  });
});

Cypress.Commands.add('deleteTestUser', (userId: string) => {
  cy.task('user:delete', userId);
});

Cypress.Commands.add('deleteTestClient', (clientId: string) => {
  cy.task('client:delete', clientId);
});

Cypress.Commands.add('deleteTestMeeting', (meetingId: string) => {
  cy.task('meeting:delete', meetingId);
});

// Form interaction commands
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}"]`).clear().type(value);
  });
});

Cypress.Commands.add('submitForm', (formTestId: string) => {
  cy.get(`[data-testid="${formTestId}"]`).submit();
});

Cypress.Commands.add('selectOption', (selectTestId: string, optionValue: string) => {
  cy.get(`[data-testid="${selectTestId}"]`).select(optionValue);
});

Cypress.Commands.add('checkCheckbox', (checkboxTestId: string) => {
  cy.get(`[data-testid="${checkboxTestId}"]`).check();
});

Cypress.Commands.add('uncheckCheckbox', (checkboxTestId: string) => {
  cy.get(`[data-testid="${checkboxTestId}"]`).uncheck();
});

// Table interaction commands
Cypress.Commands.add('getTableRow', (rowIndex: number) => {
  return cy.get(`[data-testid="table-row-${rowIndex}"]`);
});

Cypress.Commands.add('getTableHeader', (columnName: string) => {
  return cy.get(`[data-testid="table-header-${columnName}"]`);
});

Cypress.Commands.add('sortTableBy', (columnName: string) => {
  cy.get(`[data-testid="table-header-${columnName}"]`).click();
});

Cypress.Commands.add('filterTableBy', (columnName: string, value: string) => {
  cy.get(`[data-testid="table-filter-${columnName}"]`).type(value);
});

Cypress.Commands.add('selectTableRow', (rowIndex: number) => {
  cy.get(`[data-testid="table-row-${rowIndex}"] input[type="checkbox"]`).check();
});

// Modal interaction commands
Cypress.Commands.add('openModal', (modalTestId: string) => {
  cy.get(`[data-testid="${modalTestId}-trigger"]`).click();
  cy.get(`[data-testid="${modalTestId}"]`).should('be.visible');
});

Cypress.Commands.add('closeModal', (modalTestId: string) => {
  cy.get(`[data-testid="${modalTestId}"] [data-testid="close-button"]`).click();
  cy.get(`[data-testid="${modalTestId}"]`).should('not.be.visible');
});

Cypress.Commands.add('confirmModal', (modalTestId: string) => {
  cy.get(`[data-testid="${modalTestId}"] [data-testid="confirm-button"]`).click();
  cy.get(`[data-testid="${modalTestId}"]`).should('not.be.visible');
});

// Notification commands
Cypress.Commands.add(
  'expectNotification',
  (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    cy.get(`[data-testid="notification-${type}"]`).should('be.visible');
    cy.get(`[data-testid="notification-${type}"]`).should('contain', message);
  }
);

Cypress.Commands.add(
  'dismissNotification',
  (type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    cy.get(`[data-testid="notification-${type}"] [data-testid="dismiss-button"]`).click();
    cy.get(`[data-testid="notification-${type}"]`).should('not.be.visible');
  }
);

// Loading state commands
Cypress.Commands.add('waitForLoading', (testId: string) => {
  cy.get(`[data-testid="${testId}"] [data-testid="loading"]`).should('be.visible');
  cy.get(`[data-testid="${testId}"] [data-testid="loading"]`).should('not.be.visible');
});

Cypress.Commands.add('waitForDataLoad', (testId: string) => {
  cy.get(`[data-testid="${testId}"] [data-testid="no-data"]`).should('not.be.visible');
  cy.get(`[data-testid="${testId}"] [data-testid="data-loaded"]`).should('be.visible');
});

// API interaction commands
Cypress.Commands.add('interceptAPI', (method: string, url: string, response: any) => {
  cy.intercept(method, url, response);
});

Cypress.Commands.add('waitForAPI', (alias: string) => {
  cy.wait(alias);
});

Cypress.Commands.add(
  'mockAPIResponse',
  (method: string, url: string, statusCode: number, response: any) => {
    cy.intercept(method, url, {
      statusCode,
      body: response,
    }).as(`${method.toLowerCase()}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`);
  }
);

// File upload commands
Cypress.Commands.add('uploadFile', (inputTestId: string, filePath: string) => {
  cy.get(`[data-testid="${inputTestId}"]`).selectFile(filePath);
});

Cypress.Commands.add('uploadMultipleFiles', (inputTestId: string, filePaths: string[]) => {
  cy.get(`[data-testid="${inputTestId}"]`).selectFile(filePaths);
});

// Date and time commands
Cypress.Commands.add('selectDate', (dateInputTestId: string, date: string) => {
  cy.get(`[data-testid="${dateInputTestId}"]`).clear().type(date);
});

Cypress.Commands.add('selectTime', (timeInputTestId: string, time: string) => {
  cy.get(`[data-testid="${timeInputTestId}"]`).clear().type(time);
});

Cypress.Commands.add('selectDateTime', (dateTimeInputTestId: string, dateTime: string) => {
  cy.get(`[data-testid="${dateTimeInputTestId}"]`).clear().type(dateTime);
});

// Search commands
Cypress.Commands.add('searchFor', (searchInputTestId: string, query: string) => {
  cy.get(`[data-testid="${searchInputTestId}"]`).clear().type(query);
  cy.get(`[data-testid="${searchInputTestId}"]`).type('{enter}');
});

Cypress.Commands.add('clearSearch', (searchInputTestId: string) => {
  cy.get(`[data-testid="${searchInputTestId}"]`).clear();
});

// Pagination commands
Cypress.Commands.add('goToNextPage', () => {
  cy.get('[data-testid="pagination-next"]').click();
});

Cypress.Commands.add('goToPreviousPage', () => {
  cy.get('[data-testid="pagination-previous"]').click();
});

Cypress.Commands.add('goToPage', (pageNumber: number) => {
  cy.get(`[data-testid="pagination-page-${pageNumber}"]`).click();
});

// Accessibility commands
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('checkA11yWithOptions', (options: any) => {
  cy.injectAxe();
  cy.checkA11y(null, null, options);
});

// Performance commands
Cypress.Commands.add('measurePerformance', (testName: string) => {
  cy.window().then(win => {
    const performance = win.performance;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    cy.log(`Performance metrics for ${testName}:`, {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    });
  });
});

// Custom assertions
Cypress.Commands.add('shouldHaveValidForm', (formTestId: string) => {
  cy.get(`[data-testid="${formTestId}"]`).should('have.attr', 'novalidate', false);
  cy.get(`[data-testid="${formTestId}"] input[required]`).should('have.attr', 'required');
  cy.get(`[data-testid="${formTestId}"] input[type="email"]`).should('have.attr', 'type', 'email');
});

Cypress.Commands.add('shouldHaveValidTable', (tableTestId: string) => {
  cy.get(`[data-testid="${tableTestId}"]`).should('be.visible');
  cy.get(`[data-testid="${tableTestId}"] thead`).should('be.visible');
  cy.get(`[data-testid="${tableTestId}"] tbody`).should('be.visible');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication
      login(email: string, password: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsUser(): Chainable<void>;
      logout(): Chainable<void>;

      // Navigation
      navigateTo(path: string): Chainable<void>;
      navigateToDashboard(): Chainable<void>;
      navigateToMeetings(): Chainable<void>;
      navigateToClients(): Chainable<void>;
      navigateToSettings(): Chainable<void>;

      // Data management
      createTestUser(userData: any): Chainable<any>;
      createTestClient(clientData: any): Chainable<any>;
      createTestMeeting(meetingData: any): Chainable<any>;
      deleteTestUser(userId: string): Chainable<void>;
      deleteTestClient(clientId: string): Chainable<void>;
      deleteTestMeeting(meetingId: string): Chainable<void>;

      // Form interactions
      fillForm(formData: Record<string, string>): Chainable<void>;
      submitForm(formTestId: string): Chainable<void>;
      selectOption(selectTestId: string, optionValue: string): Chainable<void>;
      checkCheckbox(checkboxTestId: string): Chainable<void>;
      uncheckCheckbox(checkboxTestId: string): Chainable<void>;

      // Table interactions
      getTableRow(rowIndex: number): Chainable<JQuery<HTMLElement>>;
      getTableHeader(columnName: string): Chainable<JQuery<HTMLElement>>;
      sortTableBy(columnName: string): Chainable<void>;
      filterTableBy(columnName: string, value: string): Chainable<void>;
      selectTableRow(rowIndex: number): Chainable<void>;

      // Modal interactions
      openModal(modalTestId: string): Chainable<void>;
      closeModal(modalTestId: string): Chainable<void>;
      confirmModal(modalTestId: string): Chainable<void>;

      // Notifications
      expectNotification(
        message: string,
        type?: 'success' | 'error' | 'warning' | 'info'
      ): Chainable<void>;
      dismissNotification(type?: 'success' | 'error' | 'warning' | 'info'): Chainable<void>;

      // Loading states
      waitForLoading(testId: string): Chainable<void>;
      waitForDataLoad(testId: string): Chainable<void>;

      // API interactions
      interceptAPI(method: string, url: string, response: any): Chainable<void>;
      waitForAPI(alias: string): Chainable<void>;
      mockAPIResponse(
        method: string,
        url: string,
        statusCode: number,
        response: any
      ): Chainable<void>;

      // File uploads
      uploadFile(inputTestId: string, filePath: string): Chainable<void>;
      uploadMultipleFiles(inputTestId: string, filePaths: string[]): Chainable<void>;

      // Date and time
      selectDate(dateInputTestId: string, date: string): Chainable<void>;
      selectTime(timeInputTestId: string, time: string): Chainable<void>;
      selectDateTime(dateTimeInputTestId: string, dateTime: string): Chainable<void>;

      // Search
      searchFor(searchInputTestId: string, query: string): Chainable<void>;
      clearSearch(searchInputTestId: string): Chainable<void>;

      // Pagination
      goToNextPage(): Chainable<void>;
      goToPreviousPage(): Chainable<void>;
      goToPage(pageNumber: number): Chainable<void>;

      // Accessibility
      checkA11y(): Chainable<void>;
      checkA11yWithOptions(options: any): Chainable<void>;

      // Performance
      measurePerformance(testName: string): Chainable<void>;

      // Custom assertions
      shouldHaveValidForm(formTestId: string): Chainable<void>;
      shouldHaveValidTable(tableTestId: string): Chainable<void>;
    }
  }
}
