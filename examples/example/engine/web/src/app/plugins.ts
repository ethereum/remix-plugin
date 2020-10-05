import { Injectable } from '@angular/core';
import { Engine as PluginEngine, PluginManager } from '@remixproject/engine';
import { ThemePlugin } from '@remixproject/engine-web';

@Injectable({ providedIn: 'root' })
export class Manager extends PluginManager {}

@Injectable({ providedIn: 'root' })
export class Engine extends PluginEngine {
  constructor(manager: Manager) {
    super(manager);
  }
}


@Injectable({ providedIn: 'root' })
export class Theme extends ThemePlugin {
  constructor(private engine: Engine) {
    super()
    this.engine.register(this);
  }
}