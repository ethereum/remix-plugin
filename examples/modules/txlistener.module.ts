import { ModuleProfile, Profile, ModuleService } from '../../src'
import { Transaction } from './types'


/* ------- TYPES ------- */

export interface TxListenerProfile extends ModuleProfile {
  displayName: 'TxListener'
  icon: '<icon>'
  type: 'txlistener'
  methods: {}
  events: {
    newTransaction: Transaction
  }
  notifications: []
}

export interface ITxListenerService extends ModuleService<TxListenerProfile> {}

/* ------- IMPLEMENTATION ------- */

/**
 * PROFILE
 */

export const compilerProfile: Profile<TxListenerProfile> = {
  displayName: 'TxListener',
  icon: '<icon>',
  type: 'txlistener',
  events: ['newTransaction'],
  notifications: [],
}

/**
 * SERVICE as a class
 */
export class TxListenerService implements ITxListenerService {
  event = {
    registered: {},
    unregister(e: 'newTransaction') {
      delete this.register[e]
    },
    register(
      e: 'newTransaction',
      cb: (value: Transaction) => any,
    ) {
      this.registered[e] = cb
    },
    trigger(
      e: 'newTransaction',
      params: Transaction,
    ) {
      this.registered[e](params)
    },
  }
  lastCompilationResult() {
    return 'last'
  }
}