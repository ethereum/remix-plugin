import { Plugin } from '@remixproject/engine'
import { API } from '@remixproject/plugin-utils'
import { ITheme, Theme, themeProfile } from '@remixproject/plugin-api'
import { window, ColorThemeKind, Disposable, ColorTheme } from 'vscode'

function getTheme(color: ColorTheme): Theme {
  if (color.kind === ColorThemeKind.Dark) {
    return { brightness: 'dark', url: '' }
  } else if (color.kind === ColorThemeKind.Light) {
    return { brightness: 'light', url: '' }
  }
}

export class ThemePlugin extends Plugin implements API<ITheme> {
  listener: Disposable
  constructor() {
    super(themeProfile)
  }

  onActivation() {
    this.listener = window.onDidChangeActiveColorTheme(color => this.emit('themeChanged', getTheme(color)))
  }

  onDeactivation() {
    this.listener.dispose()
  }

  currentTheme(): Theme {
    return getTheme(window.activeColorTheme)
  }

}