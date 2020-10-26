import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { HostPlugin } from '@remixproject/engine';
import { Profile } from '@remixproject/plugin-utils';
import { Manager } from './plugins';
import { Engine } from './engine';

class ComponentHostPlugin extends HostPlugin {
  private selected: string;
  private children: Record<string, HTMLElement> = {};

  constructor(
    profile: Profile,
    private parent: HTMLElement,
    private renderer: Renderer2
  ) {
    super(profile);
  }

  currentFocus(): string {
    return this.selected; 
  }

  focus(name: string): void {
    this.selected = name;
  }

  addView(profile: Profile<any>, view: HTMLElement): void {
    view.style.width = '100%';
    view.style.height = '100%';
    view.style.border = 'none';
    this.children[profile.name] = view;
    this.renderer.appendChild(this.parent, view);
  }

  removeView(profile: Profile<any>): void {
    delete this.children[profile.name];
  }

  async onDeactivation() {
    const names = Object.keys(this.children);
    await this.call('manager', 'deactivatePlugin', names);
  }

  async canActivate(from: Profile, method: string) {
    return method !== 'removeView';
  }
}


@Directive({ selector: '[host]' })
export class HostDirective {
  private plugin: ComponentHostPlugin;
  @Input() host: string;
  constructor(
    private engine: Engine,
    private manager: Manager,
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  get name() {
    return this.host;
  }

  ngAfterViewInit() {
    const name = this.name;
    this.plugin = new ComponentHostPlugin({ name }, this.el.nativeElement, this.renderer);
    this.engine.register(this.plugin);
  }

  async ngOnDestroy() {
    await this.manager.deactivatePlugin(this.name);
    this.engine.remove(this.name);
  }


}