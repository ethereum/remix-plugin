import { IPluginManager } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const pluginManagerProfile: LibraryProfile<IPluginManager> & { name: 'manager' } = {
  name: 'manager' as 'manager',
  methods: ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin', 'isActive', 'canCall']
}
