import { RemixTx, RemixTxReceipt, RemixTxEvent, VMAccount } from './type'
import { StatusEvents } from '../../types'

export interface IUdapp {
  events: {
    newTransaction: (transaction: RemixTxEvent) => void
  } & StatusEvents
  methods: {
    sendTransaction(tx: RemixTx): RemixTxReceipt
    getAccounts(): string[]
    createVMAccount(vmAccount: VMAccount): string
  }
}
