import { Injectable } from '@angular/core';
import { Plugin } from '@remixproject/engine';
import { Engine } from '../engine';
import { Theme } from './theme';

@Injectable({ providedIn: 'root' })
export class Terminal extends Plugin {
  constructor(private engine: Engine) {
    super({ name: 'terminal' })
    this.engine.register(this);
  }

  onActivation() {
    console.log('Activate Terminal');
    this.on('iframe', 'localEvent', console.log);
  }
}