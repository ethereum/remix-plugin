import { ModuleProfile, Api, API, ApiEventEmitter } from '../../src'
import { Transaction } from './types'
import { EventEmitter } from 'events'

// Type
export interface Txlistener extends Api {
  type: 'txlistener'
  events: {
    newTransaction: Transaction
  }
}

// Profile
export const TxlistenerProfile: ModuleProfile<Txlistener> = {
  type: 'txlistener',
  events: ['newTransaction']
}

// API
export class TxlistenerApi implements API<Txlistener> {
  public readonly type = 'txlistener'
  public events: ApiEventEmitter<Txlistener> = new EventEmitter()

  // In this implementation of the API, Txlistener depends on an external class
  constructor(emitter: TxEmitter) {
    emitter.newTx.on('newTransaction', data => this.events.emit('newTransaction', data))
  }

  public lastCompilationResult() {
    return 'compilation'
  }

}

// External class
export class TxEmitter {

  newTx = new EventEmitter()

  createTx(data: string) {
    this.newTx.emit('newTransaction', {data})
  }
}