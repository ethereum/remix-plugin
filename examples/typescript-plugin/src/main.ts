import { RemixExtension, Api, PluginProfile } from 'remix-plugin'

export interface Ethdoc extends Api {
  name: 'ethdoc',
  events: {
    newDoc: string
  }
  getdoc(): string,
}



class EthdocExtension extends RemixExtension<Ethdoc> {

  private doc = 'Documentation'

  constructor() {
    super()
    // Listen on event from solCompiler module
    this.listen('solCompiler', 'getCompilationFinished', () => {
      // Emit an event to the IDE
      this.emit('newDoc', this.doc)
    })
  }

  // Method called by the IDE
  public getdoc() {
    return this.doc
  }
}