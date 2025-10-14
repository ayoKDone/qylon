describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('GET', '/api/dashboard/overview', { fixture: 'dashboard-overview.json' }).as('getDashboard');
  });

  it('should load the dashboard page with all components', () => {
    cy.visit('/dashboard');
    cy.wait('@getUser');
    cy.wait('@getDashboard');

    // Verify all critical dashboard components are present
    cy.contains('Dashboard').should('be.visible');
    cy.get('[data-testid="nav-overview"]').should('be.visible');
    cy.get('[data-testid="nav-meetings"]').should('be.visible');
    cy.get('[data-testid="nav-integrations"]').should('be.visible');
    cy.get('[data-testid="nav-analytics"]').should('be.visible');
  });

  it('should navigate to different sections without errors', () => {
    cy.visit('/dashboard');
    cy.wait('@getUser');

    // Test navigation to each section
    cy.get('[data-testid="nav-overview"]').click();
    cy.url().should('include', '/dashboard/overview');
    cy.get('[data-testid="overview-content"]').should('be.visible');

    cy.get('[data-testid="nav-meetings"]').click();
    cy.url().should('include', '/dashboard/meetings');
    cy.get('[data-testid="meetings-content"]').should('be.visible');

    cy.get('[data-testid="nav-integrations"]').click();
    cy.url().should('include', '/dashboard/integrations');
    cy.get('[data-testid="integrations-content"]').should('be.visible');
  });

  it('should handle authentication errors gracefully', () => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 401 }).as('getUserError');
    cy.visit('/dashboard');
    cy.wait('@getUserError');

    // Should redirect to login or show error message
    cy.url().should('include', '/login');
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '/api/dashboard/overview', { statusCode: 500 }).as('getDashboardError');
    cy.visit('/dashboard');
    cy.wait('@getUser');
    cy.wait('@getDashboardError');

    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
