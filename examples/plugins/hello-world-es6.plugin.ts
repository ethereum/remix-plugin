import { RemixPlugin, Plugin } from 'remix-plugin'


class HelloWorldPlugin extends RemixPlugin {
  log() {
    return 'ES6 hello world'
  }
}

/** ES6 Version of the Hello world Plugin using the "Plugin" decorator */
export class Es6HelloWorldPlugin extends Plugin({ type: 'es6-hello-world' })(HelloWorldPlugin) {}
