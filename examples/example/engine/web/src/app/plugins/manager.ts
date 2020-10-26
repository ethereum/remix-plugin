import { Injectable } from '@angular/core';
import { PluginManager } from '@remixproject/engine';
import { Profile } from '@remixproject/plugin-utils';
import { BehaviorSubject } from 'rxjs';
import { Engine } from '../engine';


const localPlugins = ['manager', 'main', 'theme', 'window'];

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

  onProfileAdded() {
    this.updateProfiles();
  }

  onPluginActivated(profile: Profile) {
    this.updateProfiles();
  }

  onPluginDeactivated() {
    this.updateProfiles();
  }

  async canDeactivatePlugin(from: Profile, to: Profile) {
    return localPlugins.includes(from.name);
  }
}