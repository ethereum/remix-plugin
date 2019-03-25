import { ModuleProfile, Api, API, ApiEventEmitter, ApiFactory } from '../../src'
import { Transaction } from './types'
import { EventEmitter } from 'events'

// Type
export interface Txlistener extends Api {
  name: 'txlistener'
  events: {
    newTransaction: Transaction
  }
}

// Profile
export const TxlistenerProfile: ModuleProfile<Txlistener> = {
  name: 'txlistener',
  events: ['newTransaction']
}

// API
export class TxlistenerApi extends ApiFactory<Txlistener> implements API<Txlistener> {
  public readonly name = 'txlistener'
  public readonly profile = TxlistenerProfile
  public events: ApiEventEmitter<Txlistener> = new EventEmitter() as any

  // In this implementation of the API, Txlistener depends on an external class
  constructor(emitter: TxEmitter) {
    super()
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