import { IPluginManager } from './api'
import { LibraryProfile } from '../../types'

export const pluginManagerProfile: LibraryProfile<IPluginManager> & { name: 'manager' } = {
  name: 'manager' as 'manager',
  methods: ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin', 'canCall']
}
