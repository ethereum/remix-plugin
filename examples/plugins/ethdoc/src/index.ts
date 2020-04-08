import { LitElement, html, customElement } from 'lit-element'
import { remixApi, CompilationFileSources, CompilationResult, Status } from '@utils'
import { createIframeClient } from '@remixproject/plugin-iframe'
import { createDoc } from './ethdoc'

interface ContractMap {
  [contractName: string]: string
}

interface AlertMap {
  [contractName: string]: {
    message: string
    type: 'success' | 'warning'
  }
}

@customElement('eth-doc')
export class EthdocComponent extends LitElement {

  /** client to communicate with the IDE */
  private client = createIframeClient()
  private docs: ContractMap = {}
  private docAlerts: AlertMap = {}

  constructor() {
    super()
    this.init()
  }

  async init() {
    await this.client.onload()
    this.client.solidity.on('compilationFinished', (
      file: string,
      src: CompilationFileSources,
      version: string,
      result: CompilationResult,
    ) => {
      if (!result) return
      this.docs = createDoc(result)
      const status: Status = { key: 'succeed', type: 'success', title: 'New documentation ready'}
      this.client.emit('statusChanged', status)
      this.requestUpdate()
    })
  }

  /** ⚠️ If you're using LitElement you should disable Shadow Root ⚠️ */
  createRenderRoot() {
    return this
  }

  /** Write documentation to the FileSystem */
  async writeDoc(name: string) {
    try {
      const content = this.docs[name]
      await this.client.fileManager.setFile(`browser/${name}.doc.md`, content)
      this.showAlert(name)
    } catch (err) {
      this.showAlert(name, err)
    }
  }

  showAlert(name: string, err?: string) {
    if (!err) {
      const message = `${name} created / updated inside File Manager 🦄`
      this.docAlerts[name] = { message, type: 'success' }
    } else {
      const message = `😓${name} documentation was not generated : ${err}`
      this.docAlerts[name] = { message, type: 'warning' }
    }
    this.requestUpdate()
    setTimeout(() => {
      delete this.docAlerts[name]
      this.requestUpdate()
    }, 3000)
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

    const docAlerts = Object
      .keys(this.docAlerts)
      .map(key => this.docAlerts[key])
      .map(({ type, message }) => {
        return html`
        <div class="alert alert-${type}" role="alert">
          ${message}
        </div>`
      })

    const info = Object.keys(this.docs).length === 0
      ? html`<p>Compile a contract with Solidity Compiler.</p>`
      : html`<p>Click on a contract to generate documentation.</p>`

    return html`
      <style>
        main {
          padding: 10px;
        }
        #alerts{
          margin-top: 20px;
          font-size: 0.8rem;
        }
        .alert {
          animation: enter 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
        }
        @keyframes enter {
          0% {
            opacity: 0;
            transform: translateY(50px) scaleY(1.2);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }
      </style>
      <main>
        ${info}
        <div class="list-group">
          ${contracts}
        </div>
        <div id="alerts">
        ${docAlerts}
        </div>
      </main>
    `
  }
}