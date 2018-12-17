import { PluginProfile } from "../../src"

export const EthdocProfile: PluginProfile = {
  type: 'ethdoc',
  methods: ['getDoc'],
  notifications: [{type: 'solCompiler', key : 'compilationFinished'}],
  url: ''
}