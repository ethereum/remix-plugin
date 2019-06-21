import { StatusEvents } from '../../types'
import { Theme } from './types'

export interface ITheme {
  events: {
    themeChanged: (theme: Theme) => void
  } & StatusEvents
  methods: {
    currentTheme(): Theme
  }
}
