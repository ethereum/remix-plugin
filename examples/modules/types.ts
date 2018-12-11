/** Transaction object with hex values */
export interface Transaction {
  from: string
  to: string
  gasLimit: string
  gasPrice: string
  value: string
  data: string
}