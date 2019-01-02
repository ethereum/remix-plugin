import { PluginProfile } from "../../src"
import { Api } from '../../src'

export interface Ethdoc extends Api {
  type: 'ethdoc'
  events: {
    createDoc: any
  }
  getDoc: any
}

export const EthdocProfile: PluginProfile<Ethdoc> = {
  type: 'ethdoc',
  methods: ['getDoc'],
  events: ['createDoc'],
  notifications: [{type: 'solCompiler', key : 'compilationFinished'}],
  url: ''
}