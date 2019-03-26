/// <reference types="Cypress" />

context('Window', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('should be true', () => {
    expect(true).to.equal(true)
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'IDE Test for Remix Plugin')
  })
})
