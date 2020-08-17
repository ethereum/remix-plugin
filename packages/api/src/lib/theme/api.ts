import { StatusEvents } from '@remixproject/utils'
import { Theme } from './types'

export interface ITheme {
  events: {
    themeChanged: (theme: Theme) => void
  } & StatusEvents
  methods: {
    currentTheme(): Theme
  }
}
