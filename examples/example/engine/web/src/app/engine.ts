import { Injectable } from '@angular/core';
import { Engine as PluginEngine } from '@remixproject/engine';

@Injectable({ providedIn: 'root' })
export class Engine extends PluginEngine {
  constructor() {
    super();
  }
}

