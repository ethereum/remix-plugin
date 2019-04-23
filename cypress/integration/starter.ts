/// <reference types="Cypress" />

context('Window', () => {
  before(() => cy.visit('http://localhost:8080'))

  it('should be true', () => expect(true).to.equal(true))

  it('get the title', () => cy.title().should('include', 'IDE Test for Remix Plugin'))
})

context('App', () => {
  before(() => cy.visit('http://localhost:8080'))

  it('app-root should exist', () => {
    cy.get('app-root')
      .should('exist')
  })

})