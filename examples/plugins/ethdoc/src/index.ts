import { LitElement, html, customElement } from 'lit-element'
import { createIframeClient, remixApi, CompilationFileSources, CompilationResult } from 'remix-plugin'
import { createDoc } from './ethdoc'

interface Contracts {
  [contractName: string]: string
}

@customElement('eth-doc')
export class EthdocComponent extends LitElement {

  /** client to communicate with the IDE */
  private client = createIframeClient({
    customApi: remixApi,
    devMode: { port: 8080 }
  })
  private docs: Contracts = {}

  constructor() {
    super()
    this.client.solidity.on('compilationFinished', (
      file: string,
      src: CompilationFileSources,
      version: string,
      result: CompilationResult,
    ) => {
      if (!result) return
      this.docs = createDoc(result)
      this.requestUpdate()
    })
  }

  /** Write documentation to the FileSystem */
  writeDoc(name: string) {
    const content = this.docs[name]
    this.client.fileManager.setFile(`browser/${name}.doc.md`, content)
  }

  render() {
    const contracts = Object
      .keys(this.docs)
      .map(name => html`<li @click="${() => this.writeDoc(name)}">${name}</li>`)

    return html`
      <main>
        <h1>EthDoc</h1>
        <ul>${contracts}</ul>
      </main>
    `
  }
}