import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IframePlugin } from '@remixproject/engine-web';
import { Engine, Manager, Theme, Window } from './plugins';

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
    private theme: Theme
  ) {}

  ngAfterViewInit() {
    const iframe = new IframePlugin({ name: 'iframe', url: 'http://localhost:4201', location: 'main' });
    this.engine.onload(() => {
      this.engine.register(iframe);
      this.manager.activatePlugin('iframe');
    });
  }

  deactivate(name: string) {
    this.manager.deactivatePlugin(name);
  }

  activate(name: string) {
    this.manager.activatePlugin(name);
  }
}
