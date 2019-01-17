import { IframePlugin, Api } from 'remix-plugin'

export interface Ethdoc extends Api {
  name: 'ethdoc',
  events: {
    newDoc: string
  }
  getdoc(): string,
}

export class EthdocPlugin extends IframePlugin<Ethdoc> {

  private doc = 'Documentation'

  constructor() {
    super()
    // Listen on event from solCompiler module
    this.listen('solCompiler', 'getCompilationFinished', () => {
      // Emit an event to the IDE
      this.emit('newDoc', this.doc)
    })
  }

  public newDoc(doc: string) {
    this.doc = doc
    this.emit('newDoc', doc)
  }

  // Method called by the IDE
  public getdoc() {
    return this.doc
  }
}