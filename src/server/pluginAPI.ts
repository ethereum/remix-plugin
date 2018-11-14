import { EventListener, Tx, Network } from '../types'
import { execution } from 'remix-lib'

const { executionContext } = execution

/*
  Defines available API. `key` / `type`
*/
export class PluginAPI {
  public highlighters: any = {}

  constructor(
    private _pluginManager: EventListener,
    private _fileProviders: EventListener,
    private _fileManager: EventListener,
    private _compiler: EventListener,
    private _udapp: EventListener,
    private SourceHighlighter: any
  ) {}

  /** App */
  public app = {
    getExecutionContextProvider: (moduleName: string, cb: Function) => {
      cb(null, executionContext.getProvider())
    },

    getProviderEndpoint: (moduleName: string, cb: Function) => {
      if (executionContext.getProvider() === 'web3') {
        cb(null, executionContext.web3().currentProvider.host)
      } else {
        cb('no endpoint: current provider is either injected or vm')
      }
    },

    updateTitle: (moduleName: string, title: string, cb: Function) => {
      this.highlighters.plugins[moduleName].modal.setTitle(title)
      if (cb) cb()
    },

    detectNetWork: (moduleName: string, cb: Function) => {
      executionContext.detectNetwork((error: string, network: string) => {
        cb(error, network)
      })
    },

    addProvider: (mod: string, name: string, url: string, cb: Function) => {
      executionContext.addProvider({ name, url })
      cb()
    },

    removeProvider: (mod: string, name: string, cb: Function) => {
      executionContext.removeProvider(name)
      cb()
    },
  }

  /** Config */
  public config = {
    setConfig: (moduleName: string, path: string, content: string, cb: Function) => {
      this._fileProviders['config'].set(moduleName + '/' + path, content)
      cb()
    },

    getConfig: (moduleName: string, path: string, cb: Function) => {
      cb(null, this._fileProviders['config'].get(moduleName + '/' + path))
    },

    removeConfig: (moduleName: string, path: string, cb: Function) => {
      cb(null, this._fileProviders['config'].remove(moduleName + '/' + path))
      if (cb) cb()
    },
  }

  /** Compiler  */
  public compiler = {
    getCompilationResult: (moduleName: string, cb: Function) => {
      cb(null, this._compiler.lastCompilationResult)
    },

    sendCompilationResult: (
      moduleName: string,
      file: string,
      source: any,
      languageVersion: any,
      data: any,
      cb: Function,
    ) => {
      this.highlighters.receivedDataFrom('sendCompilationResult', moduleName, [
        file,
        source,
        languageVersion,
        data,
      ])
    },
  }

  /** UDapp */
  public udapp = {
    runTx: (moduleName: string, tx: Tx, cb: Function) => {
      executionContext.detectNetwork((error: string, network: any) => {
        if (error) return cb(error)
        if (network.name === 'Main' && network.id === '1') {
          return cb('It is not allowed to make this action against mainnet')
        }
        this._udapp.silentRunTx(tx, (err: string, result: any) => {
          if (err) return cb(err)
          cb(null, {
            transactionHash: result.transactionHash,
            status: result.result.status,
            gasUsed: '0x' + result.result.gasUsed.toString('hex'),
            error: result.result.vm.exceptionError,
            return: result.result.vm.return
              ? '0x' + result.result.vm.return.toString('hex')
              : '0x',
            createdAddress: result.result.createdAddress
              ? '0x' + result.result.createdAddress.toString('hex')
              : undefined,
          })
        })
      })
    },

    getAccounts: (moduleName: string, cb: Function) => {
      executionContext.detectNetwork((error: any, network: Network) => {
        if (error) return cb(error)
        if (network.name === 'Main' && network.id === '1') {
          return cb('It is not allowed to make this action against mainnet')
        }
        this._udapp.getAccounts(cb)
      })
    },

    createVMAccount: (
      moduleName: string,
      privateKey: string,
      balance: any,
      cb: Function,
    ) => {
      if (executionContext.getProvider() !== 'vm') {
        return cb(
          'plugin API does not allow creating a new account through web3 connection. Only vm mode is allowed',
        )
      }
      this._udapp.createVMAccount(
        privateKey,
        balance,
        (error: string, address: string) => {
          cb(error, address)
        },
      )
    },
  }

  /** EDITOR */
  public editor = {
    getFilesFromPath: (moduleName: string, path: string, cb: Function) => {
      this._fileManager.filesFromPath(path, cb)
    },

    getCurrentFile: (moduleName: string, cb: Function) => {
      const path = this._fileManager.currentFile()
      if (!path) {
        cb('no file selected')
      } else {
        cb(null, path)
      }
    },

    getFile: (moduleName: string, path: string, cb: Function) => {
      const provider = this._fileManager.fileProviderOf(path)
      if (provider) {
        // TODO add approval to user for external plugin to get the content of the given `path`
        provider.get(path, (error: string, content: string) => {
          cb(error, content)
        })
      } else {
        cb(path + ' not available')
      }
    },

    setFile: (moduleName: string, path: string, content: string, cb: Function) => {
      const provider = this._fileManager.fileProviderOf(path)
      if (provider) {
        // TODO add approval to user for external plugin to set the content of the given `path`
        provider.set(path, content, (error: string) => {
          if (error) return cb(error)
          this._fileManager.syncEditor(path)
          cb()
        })
      } else {
        cb(path + ' not available')
      }
    },

    highlight: (
      moduleName: string,
      lineColumnPos: string,
      filePath: string,
      hexColor: string,
      cb: Function,
    ) => {
      let position
      try {
        position = JSON.parse(lineColumnPos)
      } catch (e) {
        return cb(e.message)
      }
      if (!this.highlighters[moduleName]) {
        this.highlighters[moduleName] = new this.SourceHighlighter()
      }
      this.highlighters[moduleName].currentSourceLocation(null)
      this.highlighters[moduleName].currentSourceLocationFromfileName(
        position,
        filePath,
        hexColor,
      )
      cb()
    },

    discardHighlight: (moduleName: string, cb: Function) => {
      if (this.highlighters[moduleName]) {
        this.highlighters[moduleName].currentSourceLocation(null)
      }
      cb()
    },
  }
}
