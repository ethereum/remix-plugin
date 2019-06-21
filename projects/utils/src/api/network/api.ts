import { Network, CustomNetwork, NetworkProvider } from './type'
import { StatusEvents } from '../../types'

export interface INetwork {
  events: {
    providerChanged: (provider: NetworkProvider) => void
  } & StatusEvents
  methods: {
    getNetworkProvider(): NetworkProvider
    detectNetwork(): Network | Partial<CustomNetwork>
    getEndpoint(): string
    addNetwork(network: CustomNetwork): void
    removeNetwork(name: string): void
  }
}
