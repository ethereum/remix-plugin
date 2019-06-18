import { Network, CustomNetwork, NetworkProvider } from './type'

export interface INetwork {
  events: {
    providerChanged: (provider: NetworkProvider) => void
  }
  methods: {
    getNetworkProvider(): NetworkProvider
    detectNetwork(): Network | Partial<CustomNetwork>
    getEndpoint(): string
    addNetwork(network: CustomNetwork): void
    removeNetwork(name: string): void
  }
}
