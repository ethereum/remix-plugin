import { Injectable } from '@angular/core';
import { WindowPlugin } from '@remixproject/engine-web';
import { Engine } from '../engine';
import { Theme } from './theme';

@Injectable({ providedIn: 'root' })
export class Window extends WindowPlugin {
  constructor(private engine: Engine,private theme: Theme) {
    super()
    this.engine.register(this);
  }
  
  async onActivation() {
    this.on('theme', 'themeChanged', (tx) => this.alert('themeChanged'));
    this.on('library', 'newTransaction', (tx) => this.alert('newTransaction'));
  }
}