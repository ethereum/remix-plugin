import { txlistener, compiler, fileManager, app, fileProviders, udapp } from './modules'


txlistener.event.trigger('newTransaction', [
  {}, // TX
])
fileManager.event.trigger('currentFileChanged', [
  '', // File
  {}, // Provider
])()
compiler.event.trigger('compilationFinished', [
  true, // Success
  {}, // Compilation Result contracts
  {}, // Compilation Result sources
])
app.event.trigger('tabChanged', ['compiler'])
