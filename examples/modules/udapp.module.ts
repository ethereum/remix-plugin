import { ModuleProfile, Profile, ModuleService } from '../../src'
import { Transaction } from './types'

/* ------- TYPES ------- */

export interface UdappProfile extends ModuleProfile {
  displayName: 'Universal Dapp',
  icon: '<link to icon>',
  type: 'udapp',
  methods: {
    runTx(transaction: Transaction): void,
    getAccounts(): string
    createVMAccount(newAccount: {privateKey: string, balance: number}): string
  },
  events: {}
  notifications: []
}

export interface IUdappService extends ModuleService<UdappProfile> {}


/* ------- IMPLEMENTATION ------- */

/**
 * Profile
 */

export const resolverProfile: Profile<UdappProfile> = {
  displayName: 'Universal Dapp',
  icon: '<link to icon>',
  type: 'udapp',
  methods: ['runTx', 'getAccounts', 'createVMAccount'],
}

/**
 * Service as a constant
 */
export class UdappService implements IUdappService {
  public runTx(transaction: Transaction) {
    console.log('transaction pass')
  }

  public getAccounts() {
    return '0x0000000000000000000000000000000000000000'
  }

  public createVMAccount(newAccount: {privateKey: string, balance: number}) {
    return '0x0000000000000000000000000000000000000000'
  }
}