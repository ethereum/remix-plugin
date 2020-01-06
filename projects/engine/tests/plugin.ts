// import { RemixPluginEngine } from '@examples/engine/remix-plugin-engine'
// import { Solidity, solidityProfile } from '@examples/native-plugins/solidity'
// import { FileManager } from '@examples/native-plugins/file-manager'
// import { CompilationResult } from '@utils'

// describe('Remix Engine', () => {
//   let solidity: Solidity
//   let fileManager: FileManager
//   let engine: RemixPluginEngine
//   beforeEach(() => {
//     solidity = new Solidity()
//     fileManager = new FileManager()
//     engine = new RemixPluginEngine(Object.freeze({ solidity, fileManager }))
//   })

//   test('Name should be the same as the profile', () => {
//     expect(solidity.name).toEqual(solidityProfile.name)
//     expect(solidity.profile).toEqual(solidityProfile)
//   })

//   test('on / emit / call should be deactivated by default', () => {
//     expect(() => solidity.on('fileManager', 'currentFileChanged', () => {}))
//       .toThrowError(`Method "on" from solidity should be hooked by PluginEngine`)
//     expect(() => solidity.emit('compilationFinished', 'file', {}, '0.5.0', {} as CompilationResult))
//       .toThrowError(`Method "emit" from solidity should be hooked by PluginEngine`)
//     // Need to check the result of catch because toThrowError doesn't check promises catch
//     solidity.call('fileManager', 'getFile', 'file')
//       .catch(err => expect(err.message).toEqual('Method "call" from solidity should be hooked by PluginEngine'))
//   })

//   // EMIT / ON

//   test('"emit" broadcast an event to listeners', (done) => {
//     engine.activate(['solidity', 'fileManager'])
//     solidity.on('fileManager', 'currentFileChanged', (file) => {
//       expect(file).toEqual('newFile')
//       done()
//     })
//     fileManager.emit('currentFileChanged', 'newFile')
//   })

//   test('Use app to listen directly on another plugin event', (done) => {
//     engine.activate(['solidity', 'fileManager'])
//     solidity['app'].fileManager.on('currentFileChanged', (file) => {
//       expect(file).toEqual('newFile')
//       done()
//     })
//     fileManager.emit('currentFileChanged', 'newFile')
//   })

//   // CALL

//   test('"call" get trigger a method from another active plugin', async () => {
//     engine.activate(['solidity', 'fileManager'])
//     fileManager.setFile('fileName', 'my file')
//     const content = await solidity.call('fileManager', 'getFile', 'fileName')
//     expect(content).toEqual('my file')
//   })

//   test('Use app to call directly another plugin', async () => {
//     engine.activate(['solidity', 'fileManager'])
//     fileManager.setFile('fileName', 'my file')
//     const content = await solidity['app'].fileManager.getFile('fileName')
//     expect(content).toEqual('my file')
//   })

// })
