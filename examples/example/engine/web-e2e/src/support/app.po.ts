function getId(id: string) {
  return cy.get(`[testId="${id}"]`);
}

export const pluginList = () => getId('plugin-list');