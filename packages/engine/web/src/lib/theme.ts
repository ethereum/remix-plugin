import { Plugin } from '@remixproject/engine'
import { API } from '@remixproject/plugin-utils'
import { ITheme, Theme, themeProfile } from '@remixproject/plugin-api'

export class ThemePlugin extends Plugin implements API<ITheme> {
  protected theme: Theme
  constructor() {
    super(themeProfile)
  }

  /** Internal API to set the current theme */
  setTheme(theme: Theme) {
    this.theme = theme
    this.emit('themeChanged', theme)
  }

  /** External API to get the current theme */
  currentTheme(): Theme {
    return this.theme
  }

}