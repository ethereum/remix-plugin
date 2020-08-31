import { Plugin } from '@remixproject/engine'
import { API } from '@remixproject/plugin-utils'
import { ITheme, Theme, themeProfile } from '@remixproject/plugin-api'
import { window, ColorThemeKind, Disposable, ColorTheme } from 'vscode'

// There is no way to get the value from the theme so the best solution is to reference the css varibles in webview
function getTheme(color: ColorTheme): Theme {
  const brightness = color.kind === ColorThemeKind.Dark ? 'dark' : 'light';
  return {
    brightness,
    colors: {
      surface: 'var(--vscode-tab-inactiveBackground)',
      background: 'var(--vscode-sidebar-background)',
      foreground: 'var(--vscode-sideBar-foreground)',
      primary: 'var(--vscode-button-background)',
      primaryContrast: 'var(--vscode-button-foreground)',
      secondary: 'var(--vscode-button-secondaryBackground)',
      secondaryContrast: 'var(--vscode-button-secondaryForeground)',
      warn: 'var(--vscode-inputValidation-warningBackground)',
      warnContrast: 'var(--vscode-inputValidation-warningForeground)',
      error: 'var(--vscode-inputValidation-errorBackground)',
      errorContrast: 'var(--vscode-inputValidation-errorForeground)',
      disabled: 'var(--vscode-debugIcon-breakpointDisabledForeground)',
    },
    breakpoints: {
      xs: 0,
      sm: 600,
      md: 1024,
      lg: 1440,
      xl: 1920
    },
    fontFamily: 'Segoe WPC,Segoe UI,sans-serif',
    space: 5,
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

