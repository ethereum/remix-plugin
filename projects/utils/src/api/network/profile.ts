import { INetwork } from './api'
import { LibraryProfile } from '../../types'

export const networkProfile: LibraryProfile<INetwork> = {
  name: 'network',
  methods: ['addNetwork', 'detectNetwork', 'getEndpoint', 'getNetworkProvider', 'removeNetwork'],
  events: ['providerChanged']
}
