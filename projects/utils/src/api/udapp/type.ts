export type RemixTx = {
  contractAddress: string
  data: string
  envMode: 'vm'
  executionCost: string
  from: string
  gas: string
  hash: string
  input: string
  logs: any[]
  returnValue: Uint8Array
  status: '0x01' | '0x00'
  transactionCost: string
  transactionHash: string
  value: string
} | {
  blockHash: string
  blockNumber: number
  envMod: 'injected' | 'web3'
  from: string
  gas: number
  gasPrice: { c: number[], e: number, s: number }
  hash: string
  input: string
  none: number
  r: string
  s: string
  v: string
  status: '0x01' | '0x00'
  to: string
  transactionCost: string
  transactionIndex: number
  value: { c: number[], e: number, s: number }
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