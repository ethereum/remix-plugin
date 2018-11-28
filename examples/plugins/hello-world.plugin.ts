import { RemixPlugin, Plugin } from 'remix-plugin'

@Plugin({
  type: 'hello-world'
})
export class HelloWorldPlugin extends RemixPlugin {

  log() {
    return 'hello world'
  }

}

