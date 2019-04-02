import { ModuleProfile, Api, API, BaseApi, ApiEventEmitter } from '../../src'
import { Transaction } from './types'
import { EventEmitter } from 'events'

// Type
export interface Udapp extends Api {
  name: 'udapp'
  runTx(transaction: Transaction): void,
  getAccounts(): string
  createVMAccount(newAccount: {privateKey: string, balance: number}): string
}

// Profile
export const UdappProfile: ModuleProfile<Udapp> = {
  name: 'udapp',
  methods: ['runTx', 'getAccounts', 'createVMAccount']
}

// API
export class UdappApi extends BaseApi<Udapp> implements API<Udapp> {
  public events: ApiEventEmitter<Udapp> = new EventEmitter() as any

  constructor() {
    super(UdappProfile)
  }

  private doSomeCalculation(transaction: Transaction) {
    // This method is not part of the UdappProfile.
    // You should not call it directly.
    // Here you would do some calculation for example.
  }

  public runTx(transaction: Transaction) {
    this.doSomeCalculation(transaction)
  }

  public getAccounts() {
    return '0x0000000000000000000000000000000000000000'
  }

  public createVMAccount(newAccount: {privateKey: string, balance: number}) {
    return '0x0000000000000000000000000000000000000000'
  }

}