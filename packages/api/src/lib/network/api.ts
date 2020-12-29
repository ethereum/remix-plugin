import { NetworkProvider, Network, CustomNetwork } from './type';

/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
export interface NetworkApi {
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