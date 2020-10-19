import { Injectable } from '@angular/core';
import { Engine as PluginEngine, PluginManager } from '@remixproject/engine';
import { ThemePlugin, WindowPlugin } from '@remixproject/engine-web';
import { Profile } from '@remixproject/plugin-utils';
import { BehaviorSubject } from 'rxjs';

const localPlugins = ['manager', 'main'];

@Injectable({ providedIn: 'root' })
export class Manager extends PluginManager {
  private activeProfiles = new BehaviorSubject<Profile[]>([]);
  private idleProfiles = new BehaviorSubject<Profile[]>([]);
  public activeProfiles$ = this.activeProfiles.asObservable();
  public idleProfiles$ = this.idleProfiles.asObservable();

  constructor(engine: Engine) {
    super()
    engine.register(this)
  }

  private async updateProfiles() {
    const actives = [];
    const idles = [];
    for (const profile of Object.values(this.profiles)) {
      await this.isActive(profile.name)
        ? actives.push(profile)
        : idles.push(profile)
    }
    this.activeProfiles.next(actives);
    this.idleProfiles.next(idles);
  }

  onPluginActivated() {
    this.updateProfiles();
  }

  onPluginDeactivated() {
    this.updateProfiles();
  }

  async canDeactivatePlugin(from: Profile, to: Profile) {
    return localPlugins.includes(from.name);
  }
}

@Injectable({ providedIn: 'root' })
export class Engine extends PluginEngine {
  constructor() {
    super();
  }
}


@Injectable({ providedIn: 'root' })
export class Window extends WindowPlugin {
  constructor(private engine: Engine) {
    super()
    this.engine.register(this);
  }
}