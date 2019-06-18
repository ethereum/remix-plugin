import { INetwork } from './api'
import { LibraryProfile } from '@utils'

export const networkProfile: LibraryProfile<INetwork> = {
  name: 'network',
  methods: ['addNetwork', 'detectNetwork', 'getEndpoint', 'getNetworkProvider', 'removeNetwork'],
  events: ['providerChanged']
}
