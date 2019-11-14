import { IVersionControllSystem } from './api'
import { LibraryProfile } from '../../types'

export const versionControllProfile: LibraryProfile<IVersionControllSystem> = {
  name: 'vc',
  methods: ['gitClone', 'gitCheckout', 'gitInit', 'gitAdd', 'gitCommit', 'gitFetch', 'gitPull', 'gitPush', 'gitReset', 'gitStatus', 'gitRemote', 'gitLog']
  //events: ['currentFileChanged']
}
