import { IPluginManager } from './api'
import { LibraryProfile } from '../../types'

export const pluginManagerProfile: LibraryProfile<IPluginManager> = {
  name: 'manager',
  methods: ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin']
}
