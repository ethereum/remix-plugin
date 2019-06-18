import { RemixTx, RemixTxReceipt, VMAccount } from './type'

export interface IUdapp {
  events: {
    newTransaction: (transaction: RemixTx) => void
  }
  methods: {
    sendTransaction(tx: RemixTx): RemixTxReceipt
    getAccounts(): string[]
    createVMAccount(vmAccount: VMAccount): string
  }
}
