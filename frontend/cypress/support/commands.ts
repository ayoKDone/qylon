/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to logout a user
       * @example cy.logout()
       */
      logout(): Chainable<void>

      /**
       * Custom command to wait for API calls to complete
       * @example cy.waitForApiCalls()
       */
      waitForApiCalls(): Chainable<void>

      /**
       * Custom command to check if element is visible and clickable
       * @example cy.checkElementIsClickable('[data-testid="button"]')
       */
      checkElementIsClickable(selector: string): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Wait for API calls command
Cypress.Commands.add('waitForApiCalls', () => {
  cy.wait(1000) // Wait for any pending API calls
})

// Check element is clickable command
Cypress.Commands.add('checkElementIsClickable', (selector: string) => {
  cy.get(selector).should('be.visible')
  cy.get(selector).should('not.be.disabled')
  cy.get(selector).should('not.have.attr', 'disabled')
})
