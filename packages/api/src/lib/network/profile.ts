import { INetwork } from './api'
import { LibraryProfile } from '@remixproject/utils'

export const networkProfile: LibraryProfile<INetwork> = {
  name: 'network',
  methods: ['addNetwork', 'detectNetwork', 'getEndpoint', 'getNetworkProvider', 'removeNetwork'],
  events: ['providerChanged']
}
