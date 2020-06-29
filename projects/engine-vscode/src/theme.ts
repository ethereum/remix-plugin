import { Plugin } from '@remixproject/engine'
import { ITheme, Theme, themeProfile } from '../../utils/src/api/theme'
import { API } from '../../utils/src/types/api'
import { window, ColorThemeKind, Disposable, ColorTheme } from 'vscode'

function getTheme(color: ColorTheme): Theme {
  if (color.kind === ColorThemeKind.Dark) {
    return { quality: 'dark', url: '' }
  } else if (color.kind === ColorThemeKind.Light) {
    return { quality: 'light', url: '' }
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