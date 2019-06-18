import { IUdapp } from './api'
import { LibraryProfile } from '@utils'

export const udappProfile: LibraryProfile<IUdapp> = {
  name: 'udapp',
  methods: ['createVMAccount', 'getAccounts', 'sendTransaction'],
  events: ['newTransaction']
}
