import { pluginList } from '../support/app.po';

describe('example-engine-web', () => {
  beforeEach(() => cy.visit('/'));

  it('should display 9 plugins', () => {
    pluginList().children('button').should('have.length', 9);
  });
});
