import { ISettings } from './api'
import { LibraryProfile } from '../../types'

export const settingsProfile: LibraryProfile<ISettings> = {
  name: 'settings',
  methods: ['getGithubAccessToken'],
}
