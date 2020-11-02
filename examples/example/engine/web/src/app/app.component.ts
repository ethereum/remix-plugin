import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IframePlugin, WebWorkerPlugin } from '@remixproject/engine-web';
import { Theme, Manager, Window, Library } from './plugins';
import { Engine } from './engine';

const profiles = [
  { name: 'iframe', url: 'http://localhost:4201', location: 'main' },
  { name: 'scriptRunner', url: 'https://scriptRunner.dyn.plugin.remixproject.org/ipfs/QmbzZFuLHSeLcJ4RUZzNvP3LQ3Yr5Rv4uougPquAVQ2kv1', location: 'main' }
];

@Component({
  selector: 'engine-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  actives$ = this.manager.activeProfiles$;
  idles$ = this.manager.idleProfiles$;

  constructor(
    private engine: Engine,
    private manager: Manager,
    private window: Window,
    private theme: Theme,
    private library: Library
  ) {}

  ngAfterViewInit() {
    try {
      const iframes = profiles.map(profile => new IframePlugin(profile));
      const worker = new WebWorkerPlugin({ name: 'worker', url: '/assets/web.worker.js' })
      this.engine.register([...iframes, worker]);
    } catch (err) {
      console.error(err)
    }
  }

  deactivate(name: string) {
    this.manager.deactivatePlugin(name);
  }

  activate(name: string) {
    this.manager.activatePlugin(name);
  }
}
