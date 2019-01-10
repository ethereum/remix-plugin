import { Plugin, Entry } from '../../src'
import {
  PluginManagerComponent,
  RemixAppManager,
  ResolverApi,
  ResolverProfile,
  Resolver,
} from './../modules'
import { Ethdoc, EthdocProfile } from './../plugins'

const component = new PluginManagerComponent()
const app = new RemixAppManager(component)

// Module entry
const resolverEntry: Entry<Resolver> = {
  profile: ResolverProfile,
  api: new ResolverApi()
}

// Plugin Entry
const ethdocEntry: Entry<Ethdoc> = {
  profile: EthdocProfile,
  api: new Plugin(EthdocProfile),
}

// Register and activate module 'resolver'
app.init([resolverEntry])

// Register the plugin, but it up to get user to activate it
app.registerOne<Ethdoc>(ethdocEntry)
