describe('Complete User Journey Tests', () => {
  it('should complete onboarding flow', () => {
    cy.visit('/onboarding');

    // Step 1: Company setup
    cy.get('[data-testid="company-name"]').type('Test Company');
    cy.get('[data-testid="company-size"]').select('10-50');
    cy.get('[data-testid="next-step"]').click();

    // Step 2: Integration setup
    cy.get('[data-testid="slack-integration"]').click();
    cy.get('[data-testid="next-step"]').click();

    // Step 3: Team setup
    cy.get('[data-testid="team-members"]').type('john@test.com, jane@test.com');
    cy.get('[data-testid="complete-onboarding"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="onboarding-complete"]').should('be.visible');
  });

  it('should create and manage meetings', () => {
    cy.visit('/dashboard/meetings');

    // Create new meeting
    cy.get('[data-testid="create-meeting"]').click();
    cy.get('[data-testid="meeting-title"]').type('Test Meeting');
    cy.get('[data-testid="meeting-date"]').type('2024-12-01');
    cy.get('[data-testid="meeting-time"]').type('14:00');
    cy.get('[data-testid="save-meeting"]').click();

    // Verify meeting was created
    cy.get('[data-testid="meeting-list"]').should('contain', 'Test Meeting');

    // Edit meeting
    cy.get('[data-testid="edit-meeting"]').first().click();
    cy.get('[data-testid="meeting-title"]').clear().type('Updated Meeting');
    cy.get('[data-testid="save-meeting"]').click();

    // Verify meeting was updated
    cy.get('[data-testid="meeting-list"]').should('contain', 'Updated Meeting');
  });
});
