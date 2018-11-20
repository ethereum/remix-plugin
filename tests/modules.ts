import { Tx } from './../src/models/types'
import { EventManager } from 'remix-lib'

interface UdappTx {
  transactionHash: string
  status: string
  gasUsed: string
  error: string
  return: string
  createdAddress: string
}

export const app = {
  event: new EventManager(),
}

export const compiler = {
  event: new EventManager(),
  lastCompilationResult: {},
}

export const txlistener = {
  event: new EventManager(),
}

export const fileProviders = {
  config: {
    files: {},
    set(path: string, content: string) {
      this.files[path] = content
    },
    get(path: string) {
      return this.files[path]
    },
    remove(path: string) {
      delete this.files[path]
    },
  },
}

export const fileManager = {
  event: new EventManager(),
  _currentFile: '',
  filesFromPath(path: string, cb: Function) {
    //
  },
  currentFile() {
    return this._currentFile
  },
  fileProviderOf(path: string) {
    // return
  },
  syncEditor(path: string) {
    // Do something
  },
}

export const udapp = {
  accounts: ['0x0000000000000000000000000000000000000000'],
  silentRunTx(tx: Tx, cb: (err: string, result: UdappTx) => any) {

  },
  getAccounts(cb: (err: string | null, accounts: string[]) => any) {
    cb(null, this.accounts)
  },
  createVMAccount(
    privateKey: string,
    balance: string,
    cb: (err: string | null, address: string) => any,
  ) {
    cb(null, this.accounts[0])
  },
}
