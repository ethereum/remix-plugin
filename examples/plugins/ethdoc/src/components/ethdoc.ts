import { LitElement, html, customElement } from 'lit-element'
import { createIframeClient, remixApi } from 'remix-plugin'
import { getCompilation } from '../ethdoc'

@customElement('eth-doc')
export class EthdocComponent extends LitElement {

  constructor() {
    super()
    const client = createIframeClient({
      customApi: remixApi,
      devMode: { port: 8080 }
    })
    client.solidity.on('compilationFinished', getCompilation)
  }

  render() {
    return html`
      <main>
        <h1>EthDoc</h1>
      </main>
    `
  }
}