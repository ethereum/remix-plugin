export interface Transaction {
  tx: any, // core transaction data
  receipt, // transaction receipt
  logs, // event logs
  resolvedData: any, // tx resolved data (blockchain/execution/TxListener._resolvedTransactions[txHash])
  unit: string, // default: 'wei' for Ethereum
  provider: any, // used for custom network (default = blockchain.getProvider())
  debuggable: boolean
}
