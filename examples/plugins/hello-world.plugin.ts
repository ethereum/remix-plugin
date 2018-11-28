import { ModuleManager, RemixPlugin } from 'remix-plugin'

export class HelloWorldPlugin extends RemixPlugin {

  protected manager: ModuleManager

  constructor() {
    super('hello-world')
  }

  public activate(manager: ModuleManager) {
    this.manager = manager

    this.addMethod('log', () => 'Hello World')
  }

  public deactivate() {}
}