import { LitElement, customElement, html } from 'lit-element';

@customElement('app-root')
export class AppRoot extends LitElement {

  constructor() {
    super()
  }

  render() {
    return html`
    <main>
      <h1>App</h1>
      <plugin-manager></plugin-manager>
      <plugin-viewer></plugin-viewer>
    </main>
    `
  }
}