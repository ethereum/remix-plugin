import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IframePlugin } from '@remixproject/engine-web';
import { Theme, Manager, Window, Library } from './plugins';
import { Engine } from './engine';

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
      const iframe = new IframePlugin({ name: 'iframe', url: 'http://localhost:4201', location: 'main' });
      this.engine.register(iframe);
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
