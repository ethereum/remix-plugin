import { ProfileMap, Profile } from '../types'
import { compilerProfile, ICompiler } from './compiler'
import { filSystemProfile, IFileSystem } from './file-system'
import { editorProfile, IEditor } from './editor'
import { networkProfile, INetwork } from './network'
import { udappProfile, IUdapp } from './udapp'
import { themeProfile, ITheme } from './theme'
import { unitTestProfile, IUnitTesting } from './unit-testing'
import { contentImportProfile, IContentImport } from './content-import'

export interface IRemixApi {
  solidity: ICompiler
  fileManager: IFileSystem
  solidityUnitTesting: IUnitTesting,
  editor: IEditor
  network: INetwork
  udapp: IUdapp
  contentImport: IContentImport
  theme: ITheme
}

export type RemixApi = Readonly<IRemixApi>

/** @deprecated Use remixProfiles instead. Will be remove in next version */
export const remixApi: ProfileMap<RemixApi> = Object.freeze({
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' } as Profile<IUnitTesting>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  contentImport: contentImportProfile,
  theme: themeProfile,
})

/** Profiles of all the remix's Native Plugins */
export const remixProfiles: ProfileMap<RemixApi> = Object.freeze({
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' } as Profile<IUnitTesting>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  contentImport: contentImportProfile,
  theme: themeProfile
})
