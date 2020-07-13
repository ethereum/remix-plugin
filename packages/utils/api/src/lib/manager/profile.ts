import type { LibraryProfile } from '@remixproject/utils/types'
import { IPluginManager } from './api'

export const pluginManagerProfile: LibraryProfile<IPluginManager> & { name: 'manager' } = {
  name: 'manager' as 'manager',
  methods: ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin', 'canCall']
}
