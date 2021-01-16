import { Plugin, PluginOptions } from '@remixproject/engine'
import { API } from '@remixproject/plugin-utils'
import { ITheme, Theme, ThemeUrls, themeProfile } from '@remixproject/plugin-api'
import { window, ColorThemeKind, Disposable, ColorTheme } from 'vscode'

interface ThemeOptions extends PluginOptions {
  urls?: Partial<ThemeUrls>
}

// There is no way to get the value from the theme so the best solution is to reference the css varibles in webview
export function getVscodeTheme(color: ColorTheme, urls: Partial<ThemeUrls> = {}): Theme {
  const brightness = color.kind === ColorThemeKind.Dark ? 'dark' : 'light';
  return {
    brightness,
    // https://code.visualstudio.com/api/references/theme-color
    colors: {
      surface: 'tab.inactiveBackground',
      background: 'sidebar.background',
      foreground: 'sideBar.foreground',
      primary: 'button.background',
      primaryContrast: 'button.foreground',
      secondary: 'button.secondaryBackground',
      secondaryContrast: 'button.secondaryForeground',
      success: 'button.background', // Same as primary: no success color in vscode
      successContrast: 'button.foreground',
      warn: 'inputValidation.warningBackground',
      warnContrast: 'inputValidation.warningForeground',
      error: 'inputValidation.errorBackground',
      errorContrast: 'inputValidation.errorForeground',
      disabled: 'debugIcon.breakpointDisabledForeground',
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
    url: urls[brightness]
  }
}

export class ThemePlugin extends Plugin implements API<ITheme> {
  protected getTheme = getVscodeTheme;
  protected options: ThemeOptions
  listener: Disposable
  constructor(options: Partial<ThemeOptions> = {}) {
    super(themeProfile)
    super.setOptions(options)
  }

  setOptions(options: Partial<ThemeOptions>) {
    super.setOptions(options)
  }

  onActivation() {
    this.listener = window.onDidChangeActiveColorTheme(color => {
      this.emit('themeChanged', this.getTheme(color, this.options.urls))
    })
  }

  onDeactivation() {
    this.listener.dispose()
  }

  currentTheme(): Theme {
    return this.getTheme(window.activeColorTheme, this.options.urls)
  }

}

