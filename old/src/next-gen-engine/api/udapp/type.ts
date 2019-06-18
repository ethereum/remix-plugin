export interface RemixTx {
  from: string
  to: string
  gasLimit: string
  data: string
  value: string
  useCall: boolean
}

export interface RemixTxReceipt {
  transactionHash: string
  status: 0 | 1
  gasUsed: string
  error: string
  return: string
  createdAddress?: string
}

export interface VMAccount {
  privateKey: string
  balance: string
}