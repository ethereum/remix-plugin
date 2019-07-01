import { ITheme } from './api'
import { LibraryProfile } from '../../types'

export const themeProfile: LibraryProfile<ITheme> = {
  name: 'theme',
  methods: [],
  events: ['themeChanged']
}