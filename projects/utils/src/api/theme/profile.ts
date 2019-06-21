import { ITheme } from './api'
import { LibraryProfile } from '@utils'

export const themeProfile: LibraryProfile<ITheme> = {
  name: 'theme',
  methods: [],
  events: ['themeChanged']
}