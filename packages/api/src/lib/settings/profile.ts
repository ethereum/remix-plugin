import { ISettings } from './api'
import { LibraryProfile } from '@remixproject/utils'

export const settingsProfile: LibraryProfile<ISettings> = {
  name: 'settings',
  methods: ['getGithubAccessToken'],
}
