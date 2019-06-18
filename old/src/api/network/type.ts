export interface CustomNetwork {
  id?: string
  name: string
  url: string
}

export type Network =
  | { id: '1', name: 'Main' }
  | { id: '2', name: 'Morden (deprecated)' }
  | { id: '3', name: 'Ropsten' }
  | { id: '4', name: 'Rinkeby' }
  | { id: '42', name: 'Kovan' }

export type NetworkProvider = 'vm' | 'injected' | 'web3'