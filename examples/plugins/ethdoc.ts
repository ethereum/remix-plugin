import { PluginProfile, RemixExtension } from "../../src"
import { Api } from '../../src'

export interface Ethdoc extends Api {
  name: 'ethdoc',
  events: {
    newDoc: string
  }
  getdoc(): string,
}

export const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  methods: ['getdoc'],
  events: ['newDoc'],
  notifications: {
    'solCompiler': ['compilationFinished']
  },
  url: ''
}

// Plugin: This should be in an Iframe
export class EthdocApi extends RemixExtension<Ethdoc> {

  private doc: any

  constructor() {
    super()
    this.listen('solCompiler', 'compilationFinished', (result) => {
      this.doc = result.data
      this.emit('newDoc', this.doc)
    })
  }

  public getDoc() {
    return this.doc
  }

}