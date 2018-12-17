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
  constructor() {
    super('txlistener')
  }

  public newTransaction = new EventEmitter<Transaction>('newTransaction')

  public lastCompilationResult() {
    return 'compilation'
  }

}