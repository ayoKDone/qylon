describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Stub Supabase session to avoid network auth on load
    const mockSession = {
      access_token: 'test-access',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'test-refresh',
      user: { id: 'test-user-id', email: 'test@example.com' },
    };

    cy.window({ log: false }).then(win => {
      // Attach a hook for our test to detect
      (win as any).__supabaseSession__ = mockSession;
    });
  });

  it('should load the dashboard page with all components', () => {
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        const mockSession = (win as any).__supabaseSession__;
        // Monkey patch supabase.auth.getSession to resolve immediately
        Object.defineProperty(win, 'supabase', {
          configurable: true,
          writable: true,
          value: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: mockSession } }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            },
          },
        });
      },
    });

    // Verify core dashboard nav links are present by visible text
    cy.contains(/analytics/i).should('exist');
    cy.contains(/workflow/i).should('exist');
    cy.contains(/contents?/i).should('exist');
    cy.contains(/settings/i).should('exist');
  });

  it('should navigate to different sections without errors', () => {
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        const mockSession = (win as any).__supabaseSession__;
        Object.defineProperty(win, 'supabase', {
          configurable: true,
          writable: true,
          value: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: mockSession } }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            },
          },
        });
      },
    });

    // Navigate by visible nav link text since data-testids aren’t present
    cy.contains(/analytics/i).click({ force: true });
    cy.url().should('include', '/dashboard/analytics');

    cy.contains(/workflow/i).click({ force: true });
    cy.url().should('include', '/dashboard/workflow');

    cy.contains(/contents?/i).click({ force: true });
    cy.url().should('include', '/dashboard/contents');

    cy.contains(/settings/i).click({ force: true });
    cy.url().should('include', '/dashboard/settings');
  });

  it('should display dashboard content correctly', () => {
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        const mockSession = { access_token: 'x', user: { id: 'u' } };
        Object.defineProperty(win, 'supabase', {
          configurable: true,
          writable: true,
          value: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: mockSession } }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            },
          },
        });
      },
    });

    // Check that dashboard content is displayed (use more flexible selectors)
    cy.get('body').should('contain', 'Good afternoon, Amaka');
    cy.get('body').should('contain', 'Recent Meetings');
    cy.get('body').should('contain', 'Quick Actions');
  });
});
