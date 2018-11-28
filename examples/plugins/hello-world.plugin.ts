import { ModuleManager, RemixPlugin } from 'remix-plugin'
import { execution } from 'remix-lib'

export class HelloWorldPlugin extends RemixPlugin {

  protected manager: ModuleManager

  constructor() {
    super('hello-world')
  }

  public activate(manager: ModuleManager) {
    this.manager = manager

    this.addMethod('log', () => {
      return 'Hello World'
    })
  }

  public deactivate() {}
}