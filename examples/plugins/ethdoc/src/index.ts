import { LitElement, html, customElement } from 'lit-element'
import { createIframeClient, remixApi, CompilationFileSources, CompilationResult, Status } from 'remix-plugin'
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
      const status: Status = { key: 'file-alt', type: 'success', title: 'New documentation ready'}
      this.client.emit('statusChanged', status)
      this.requestUpdate()
    })
  }

  /** ⚠️ If you're using LitElement you should disable Shadow Root ⚠️ */
  createRenderRoot() {
    return this
  }

  /** Write documentation to the FileSystem */
  writeDoc(name: string) {
    const content = this.docs[name]
    this.client.fileManager.setFile(`browser/${name}.doc.md`, content)
  }

  render() {
    const contracts = Object
      .keys(this.docs)
      .map(name => html`
      <button
        class="list-group-item list-group-item-action"
        @click="${() => this.writeDoc(name)}">
        ${name} Documentation
      </button>`
      )

    return html`
      <style>
        main {
          padding: 10px;
        }
      </style>
      <main>
        <div class="list-group">
          ${contracts}
        </div>
      </main>
    `
  }
}