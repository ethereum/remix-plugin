import { ModuleProfile, EventEmitter, Api, API } from '../../src'
import { Transaction } from './types'


// Type
export interface Txlistener extends Api {
  type: 'txlistener'
  newTransaction: EventEmitter<Transaction>
}

// Profile
export const TxlistenerProfile: ModuleProfile<Txlistener> = {
  type: 'txlistener',
  events: ['newTransaction']
}

// API
export class TxlistenerApi extends API<Txlistener> implements Txlistener {
  // In this implementation of the API, Txlistener depends on an external class
  constructor(private emitter: TxEmitter) {
    super('txlistener')
  }

  public newTransaction = this.emitter.newTx

  public lastCompilationResult() {
    return 'compilation'
  }

}

// External class
export class TxEmitter {

  newTx = new EventEmitter<Transaction>('newTransaction')

  createTx(data: string) {
    this.newTx.emit({data})
  }
}