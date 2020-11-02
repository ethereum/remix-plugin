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
    this.on('worker', 'log', (text) => console.log('Log', text));
  }

  run(text: string) {
    this.call('worker', 'execute', text);
  }
}