import { Injectable } from '@angular/core';
import { ThemePlugin } from '@remixproject/engine-web';
import { Engine } from '../engine';

const light = {
  brightness: 'light',
  fontFamily: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
  colors: {
    surface: 'white',
    background: '#fafafa',  // light grey
    foreground: 'black',
    primary: '#3f51b5', // indigo
    primaryContrast: 'white',
    secondary: '#e91e63',  // pink
    secondaryContrast: 'rgba(white, 0.7)',
    success: '#4caf50',  // green
    successContrast: 'rgba(black, 0.87)',
    warn: '#ff9800',  // orange
    warnContrast: 'white',
    error: '#f44336', // red
    errorContrast: 'white',
    disabled: 'rgba(0,0,0,.26)',
  },
} as const;

const dark = {
  brightness: 'dark',
  fontFamily: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
  colors: {
    surface: 'white',
    background: '#1E1E1E',
    foreground: 'fafafa',
    primary: '#3f51b5', // indigo
    primaryContrast: 'white',
    secondary: '#e91e63',  // pink
    secondaryContrast: 'rgba(white, 0.7)',
    success: '#4caf50',  // green
    successContrast: 'rgba(black, 0.87)',
    warn: '#ff9800',  // orange
    warnContrast: 'white',
    error: '#f44336', // red
    errorContrast: 'white',
    disabled: 'rgba(0,0,0,.26)',
  },
} as const;

@Injectable({ providedIn: 'root' })
export class Theme extends ThemePlugin {
  private themes = { dark, light };
  constructor(private engine: Engine) {
    super()
    this.engine.register(this);
  }

  selectTheme(brightness: 'dark' | 'light') {
    const theme = this.themes[brightness];
    this.setTheme(theme);
  }

  onActivation() {
    this.selectTheme('dark');
  }
}
