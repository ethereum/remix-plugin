import { InjectionToken } from '@angular/core';
import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-webview';

export class Client extends PluginClient {
  constructor() {
    super({ customTheme: true })
  }

  onActivation() {
    this.on('theme', 'themeChanged', theme => console.log('theme', theme));
  }
}

export const CLIENT = new InjectionToken<Client>('Remix Clinet', {
  providedIn: 'root',
  factory: () => createClient<any>(new Client())
});