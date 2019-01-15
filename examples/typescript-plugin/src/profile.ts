import { Ethdoc } from './main'
import { PluginProfile } from 'remix-plugin'

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  events: ['newDoc'],
  methods: ['getdoc'],
  notifications: {
    'solCompiler': ['getCompilationFinished']
  },
  url: 'https://ipfs.io/ipfs/Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ/'
}