import { ModuleProfile, Api, API, UdappApi, RemixTx, RemixTxReceipt } from '../../src'
import { EventEmitter } from 'events'

// Type
export interface Txlistener extends Api {
  name: 'txlistener'
  events: {}
  methods: {}
}

// Profile
export const TxlistenerProfile: ModuleProfile<Txlistener> = {
  name: 'txlistener'
}

// API
export class TxlistenerApi extends UdappApi<Txlistener> implements API<Txlistener> {
  // In this implementation of the API, Txlistener depends on an external class
  constructor(emitter: TxEmitter) {
    super(TxlistenerProfile)
    emitter.newTx.on('newTransaction', data => this.events.emit('newTransaction', data))
  }

  public lastCompilationResult() {
    return 'compilation'
  }

  sendTransaction(tx: RemixTx): RemixTxReceipt {
    throw new Error("Method not implemented.")
  }
  getAccounts(): string[] {
    throw new Error("Method not implemented.")
  }
  createVMAccount(): string {
    throw new Error("Method not implemented.")
  }

}

// External class
export class TxEmitter {

  newTx = new EventEmitter()

  createTx(data: string) {
    this.newTx.emit('newTransaction', {data})
  }
}