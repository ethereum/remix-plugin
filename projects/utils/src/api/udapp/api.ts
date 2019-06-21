import { RemixTx, RemixTxReceipt, VMAccount } from './type'
import { StatusEvents } from '../../types'

export interface IUdapp {
  events: {
    newTransaction: (transaction: RemixTx) => void
  } & StatusEvents
  methods: {
    sendTransaction(tx: RemixTx): RemixTxReceipt
    getAccounts(): string[]
    createVMAccount(vmAccount: VMAccount): string
  }
}
