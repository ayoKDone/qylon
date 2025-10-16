describe('Complete User Journey Tests', () => {
  it('should complete setup flow', () => {
    // Start at setup welcome - this should show "We are Qylon" and "Get started" button
    cy.visit('/setup');
    cy.contains('We are Qylon').should('be.visible');
    cy.contains('Get started').should('be.visible');

    // Click "Get started" to go to profile step
    cy.contains('Get started').click();
    cy.url().should('include', '/setup/profile');

    // Profile step: fill in the actual form fields that exist
    cy.get('#names').type('Test User');
    cy.get('#company_name').type('Test Company');
    cy.get('#role_selection').select('Project Manager');
    cy.get('#team_size').select('1 - 10');
    cy.get('#industry_selection').select('Project Manager'); // Note: this has wrong options in the actual code

    // Upload a test image file (required field)
    cy.get('#image').selectFile('cypress/fixtures/test-image.png', { force: true });

    // Submit the profile form
    cy.contains('Complete Profile').click();
    cy.url().should('include', '/setup/add-calendar');

    // Google Calendar integration step
    cy.contains('Connect Your Google Calendar').should('be.visible');
    cy.contains('Integrate Google Calendar').should('be.visible');

    // For testing purposes, just verify the integration page loads
    // In a real test, we would mock the OAuth flow
    cy.url().should('include', '/setup/add-calendar');
  });

  it('should navigate to dashboard meetings', () => {
    cy.visit('/dashboard');
    // Use the actual navigation link text that exists
    cy.contains('Live Meetings').click();
    cy.url().should('include', '/dashboard/live-meetings');

    // Navigate back and try meeting history
    cy.contains('Meeting History').click();
    cy.url().should('include', '/dashboard/meeting-history');
  });
});
