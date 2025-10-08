/**
 * Onboarding E2E Tests
 *
 * Comprehensive end-to-end tests for the user onboarding flow.
 * Tests the complete user journey from registration to first meeting creation.
 */

describe('User Onboarding Flow', () => {
  beforeEach(() => {
    // Clean up before each test
    cy.task('db:clean');
    cy.task('db:seed');
  });

  afterEach(() => {
    // Clean up after each test
    cy.task('db:clean');
  });

  describe('Registration Flow', () => {
    it('should complete user registration successfully', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        company: 'Test Company',
        role: 'business_owner',
        agreeToTerms: true,
      };

      // Visit registration page
      cy.visit('/register');
      cy.shouldBeOnPage('/register');

      // Fill registration form
      cy.fillForm({
        'name-input': userData.name,
        'email-input': userData.email,
        'password-input': userData.password,
        'confirm-password-input': userData.confirmPassword,
        'company-input': userData.company,
        'role-select': userData.role,
      });

      // Check terms agreement
      cy.checkCheckbox('terms-checkbox');

      // Submit form
      cy.submitForm('registration-form');

      // Should redirect to email verification
      cy.shouldBeOnPage('/verify-email');
      cy.shouldShowInfoNotification('Please check your email to verify your account');

      // Verify email verification page elements
      cy.get('[data-testid="email-verification-title"]').should('be.visible');
      cy.get('[data-testid="email-verification-message"]').should('contain', userData.email);
      cy.get('[data-testid="resend-verification-button"]').should('be.visible');
    });

    it('should show validation errors for invalid registration data', () => {
      cy.visit('/register');

      // Try to submit empty form
      cy.submitForm('registration-form');

      // Should show validation errors
      cy.shouldHaveFormErrors('registration-form', [
        'name-required',
        'email-required',
        'password-required',
        'confirm-password-required',
        'company-required',
        'role-required',
        'terms-required',
      ]);

      // Fill with invalid data
      cy.fillForm({
        'name-input': 'A', // Too short
        'email-input': 'invalid-email', // Invalid format
        'password-input': '123', // Too weak
        'confirm-password-input': '456', // Doesn't match
        'company-input': 'Test Company',
        'role-select': 'business_owner',
      });

      cy.checkCheckbox('terms-checkbox');
      cy.submitForm('registration-form');

      // Should show specific validation errors
      cy.shouldHaveFormErrors('registration-form', [
        'name-too-short',
        'email-invalid-format',
        'password-too-weak',
        'passwords-do-not-match',
      ]);
    });

    it('should prevent duplicate email registration', () => {
      // Create existing user
      cy.createTestUser({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!',
      });

      cy.visit('/register');

      // Try to register with existing email
      cy.fillForm({
        'name-input': 'New User',
        'email-input': 'existing@example.com',
        'password-input': 'NewPassword123!',
        'confirm-password-input': 'NewPassword123!',
        'company-input': 'New Company',
        'role-select': 'business_owner',
      });

      cy.checkCheckbox('terms-checkbox');
      cy.submitForm('registration-form');

      // Should show error
      cy.shouldShowErrorNotification('Email address is already registered');
    });
  });

  describe('Email Verification Flow', () => {
    it('should verify email successfully', () => {
      // Create unverified user
      const user = cy.createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: false,
      });

      // Visit verification page with token
      cy.visit('/verify-email?token=valid-verification-token');

      // Should show success message
      cy.shouldShowSuccessNotification('Email verified successfully');

      // Should redirect to onboarding
      cy.shouldBeOnPage('/onboarding');
    });

    it('should handle invalid verification token', () => {
      cy.visit('/verify-email?token=invalid-token');

      // Should show error
      cy.shouldShowErrorNotification('Invalid or expired verification token');

      // Should redirect to registration
      cy.shouldBeOnPage('/register');
    });

    it('should resend verification email', () => {
      // Create unverified user
      cy.createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: false,
      });

      cy.visit('/verify-email');

      // Click resend button
      cy.get('[data-testid="resend-verification-button"]').click();

      // Should show success message
      cy.shouldShowSuccessNotification('Verification email sent');
    });
  });

  describe('Onboarding Setup Flow', () => {
    beforeEach(() => {
      // Create verified user
      cy.createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: true,
      });

      // Login user
      cy.login('test@example.com', 'Password123!');
    });

    it('should complete company profile setup', () => {
      cy.visit('/onboarding/company-profile');

      const companyData = {
        'company-name-input': 'Test Company Inc.',
        'company-size-select': '10-50',
        'industry-select': 'technology',
        'website-input': 'https://testcompany.com',
        'description-textarea': 'A test company for automation',
      };

      // Fill company profile form
      cy.fillForm(companyData);

      // Submit form
      cy.submitForm('company-profile-form');

      // Should redirect to next step
      cy.shouldBeOnPage('/onboarding/team-setup');
      cy.shouldShowSuccessNotification('Company profile saved');
    });

    it('should complete team setup', () => {
      cy.visit('/onboarding/team-setup');

      // Add team members
      cy.get('[data-testid="add-team-member-button"]').click();

      cy.fillForm({
        'member-name-input': 'John Doe',
        'member-email-input': 'john@testcompany.com',
        'member-role-select': 'manager',
      });

      cy.get('[data-testid="save-member-button"]').click();

      // Should show member in list
      cy.get('[data-testid="team-members-list"]').should('contain', 'John Doe');

      // Continue to next step
      cy.get('[data-testid="continue-button"]').click();

      // Should redirect to integrations
      cy.shouldBeOnPage('/onboarding/integrations');
    });

    it('should complete integrations setup', () => {
      cy.visit('/onboarding/integrations');

      // Select calendar integration
      cy.checkCheckbox('calendar-integration-checkbox');
      cy.get('[data-testid="calendar-connect-button"]').click();

      // Mock calendar connection
      cy.mockAPIResponse('POST', '/api/v1/integrations/calendar/connect', 200, {
        success: true,
        data: { connected: true },
      });

      // Should show connected status
      cy.get('[data-testid="calendar-status"]').should('contain', 'Connected');

      // Continue to next step
      cy.get('[data-testid="continue-button"]').click();

      // Should redirect to preferences
      cy.shouldBeOnPage('/onboarding/preferences');
    });

    it('should complete preferences setup', () => {
      cy.visit('/onboarding/preferences');

      const preferencesData = {
        'timezone-select': 'America/New_York',
        'date-format-select': 'MM/DD/YYYY',
        'time-format-select': '12-hour',
        'notification-email-checkbox': true,
        'notification-sms-checkbox': false,
        'notification-push-checkbox': true,
      };

      // Fill preferences form
      cy.fillForm(preferencesData);

      // Submit form
      cy.submitForm('preferences-form');

      // Should redirect to dashboard
      cy.shouldBeOnPage('/dashboard');
      cy.shouldShowSuccessNotification('Welcome to Qylon! Your setup is complete.');
    });

    it('should allow skipping optional steps', () => {
      cy.visit('/onboarding/team-setup');

      // Skip team setup
      cy.get('[data-testid="skip-button"]').click();

      // Should redirect to integrations
      cy.shouldBeOnPage('/onboarding/integrations');

      // Skip integrations
      cy.get('[data-testid="skip-button"]').click();

      // Should redirect to preferences
      cy.shouldBeOnPage('/onboarding/preferences');

      // Complete preferences
      cy.fillForm({
        'timezone-select': 'America/New_York',
        'date-format-select': 'MM/DD/YYYY',
        'time-format-select': '12-hour',
      });

      cy.submitForm('preferences-form');

      // Should redirect to dashboard
      cy.shouldBeOnPage('/dashboard');
    });
  });

  describe('First Meeting Creation', () => {
    beforeEach(() => {
      // Create user with completed onboarding
      const user = cy.createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: true,
        onboardingCompleted: true,
      });

      // Create test client
      const client = cy.createTestClient({
        name: 'Test Client',
        user_id: user.id,
      });

      // Login user
      cy.login('test@example.com', 'Password123!');
    });

    it('should create first meeting successfully', () => {
      cy.visit('/meetings/create');

      const meetingData = {
        'meeting-title-input': 'Initial Client Meeting',
        'client-select': 'Test Client',
        'meeting-date-input': '2024-12-25',
        'meeting-time-input': '14:00',
        'duration-select': '60',
        'meeting-type-select': 'video_call',
        'description-textarea': 'Initial meeting to discuss project requirements',
      };

      // Fill meeting form
      cy.fillForm(meetingData);

      // Submit form
      cy.submitForm('meeting-form');

      // Should show success message
      cy.shouldShowSuccessNotification('Meeting created successfully');

      // Should redirect to meetings list
      cy.shouldBeOnPage('/meetings');

      // Should show meeting in list
      cy.get('[data-testid="meetings-table"]').should('contain', 'Initial Client Meeting');
    });

    it('should show onboarding tips for first meeting', () => {
      cy.visit('/meetings/create');

      // Should show onboarding tips
      cy.get('[data-testid="onboarding-tips"]').should('be.visible');
      cy.get('[data-testid="tip-meeting-templates"]').should('be.visible');
      cy.get('[data-testid="tip-automation-setup"]').should('be.visible');

      // Should have helpful links
      cy.get('[data-testid="help-link-templates"]').should('be.visible');
      cy.get('[data-testid="help-link-automation"]').should('be.visible');
    });

    it('should complete onboarding after first meeting', () => {
      cy.visit('/meetings/create');

      const meetingData = {
        'meeting-title-input': 'Initial Client Meeting',
        'client-select': 'Test Client',
        'meeting-date-input': '2024-12-25',
        'meeting-time-input': '14:00',
        'duration-select': '60',
        'meeting-type-select': 'video_call',
      };

      cy.fillForm(meetingData);
      cy.submitForm('meeting-form');

      // Should show onboarding completion
      cy.shouldShowSuccessNotification(
        "Congratulations! You've completed your first meeting setup.",
      );

      // Should show next steps
      cy.get('[data-testid="next-steps-modal"]').should('be.visible');
      cy.get('[data-testid="next-step-automation"]').should('be.visible');
      cy.get('[data-testid="next-step-templates"]').should('be.visible');
    });
  });

  describe('Onboarding Analytics', () => {
    it('should track onboarding completion events', () => {
      // Mock analytics API
      cy.mockAPIResponse('POST', '/api/v1/analytics/events', 200, {
        success: true,
      });

      // Create and login user
      cy.createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: true,
      });

      cy.login('test@example.com', 'Password123!');

      // Complete onboarding steps
      cy.visit('/onboarding/company-profile');
      cy.fillForm({
        'company-name-input': 'Test Company',
        'company-size-select': '10-50',
        'industry-select': 'technology',
      });
      cy.submitForm('company-profile-form');

      // Should track step completion
      cy.waitForAPI('POST_/api/v1/analytics/events').then(interception => {
        expect(interception.request.body.event_type).to.equal('onboarding_step_completed');
        expect(interception.request.body.properties.step).to.equal('company_profile');
      });
    });

    it('should track onboarding abandonment', () => {
      // Mock analytics API
      cy.mockAPIResponse('POST', '/api/v1/analytics/events', 200, {
        success: true,
      });

      // Create and login user
      cy.createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        emailVerified: true,
      });

      cy.login('test@example.com', 'Password123!');

      // Start onboarding but don't complete
      cy.visit('/onboarding/company-profile');

      // Navigate away (simulate abandonment)
      cy.visit('/dashboard');

      // Should track abandonment
      cy.waitForAPI('POST_/api/v1/analytics/events').then(interception => {
        expect(interception.request.body.event_type).to.equal('onboarding_abandoned');
        expect(interception.request.body.properties.step).to.equal('company_profile');
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work on mobile devices', () => {
      // Set mobile viewport
      cy.viewport(375, 667);

      cy.visit('/register');

      // Should be responsive
      cy.shouldBeResponsive('registration-form');

      // Fill form on mobile
      cy.fillForm({
        'name-input': 'Mobile User',
        'email-input': 'mobile@example.com',
        'password-input': 'MobilePassword123!',
        'confirm-password-input': 'MobilePassword123!',
        'company-input': 'Mobile Company',
        'role-select': 'business_owner',
      });

      cy.checkCheckbox('terms-checkbox');
      cy.submitForm('registration-form');

      // Should work on mobile
      cy.shouldBeOnPage('/verify-email');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible throughout onboarding', () => {
      cy.visit('/register');

      // Check accessibility
      cy.shouldBeAccessible('registration-form');

      // Fill form
      cy.fillForm({
        'name-input': 'Accessible User',
        'email-input': 'accessible@example.com',
        'password-input': 'AccessiblePassword123!',
        'confirm-password-input': 'AccessiblePassword123!',
        'company-input': 'Accessible Company',
        'role-select': 'business_owner',
      });

      cy.checkCheckbox('terms-checkbox');

      // Check accessibility before submit
      cy.shouldBeAccessible('registration-form');

      cy.submitForm('registration-form');

      // Check accessibility on verification page
      cy.shouldBeAccessible();
    });
  });

  describe('Performance', () => {
    it('should load onboarding pages quickly', () => {
      cy.visit('/register');

      // Should load within 2 seconds
      cy.shouldLoadWithinTime('registration-form', 2000);

      // Fill and submit form
      cy.fillForm({
        'name-input': 'Performance User',
        'email-input': 'performance@example.com',
        'password-input': 'PerformancePassword123!',
        'confirm-password-input': 'PerformancePassword123!',
        'company-input': 'Performance Company',
        'role-select': 'business_owner',
      });

      cy.checkCheckbox('terms-checkbox');
      cy.submitForm('registration-form');

      // Should load verification page quickly
      cy.shouldLoadWithinTime('email-verification', 2000);
    });
  });
});
