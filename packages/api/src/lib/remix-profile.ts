import { ProfileMap, Profile } from '@remixproject/utils'
import { compilerProfile, ICompiler } from './compiler'
import { filSystemProfile, IFileSystem } from './file-system'
import { editorProfile, IEditor } from './editor'
import { networkProfile, INetwork } from './network'
import { udappProfile, IUdapp } from './udapp'
import { themeProfile, ITheme } from './theme'
import { unitTestProfile, IUnitTesting } from './unit-testing'
import { contentImportProfile, IContentImport } from './content-import'
import { ISettings, settingsProfile } from './settings'
import { gitProfile, IGitSystem } from './git';
import { IPluginManager, pluginManagerProfile } from './plugin-manager'

export interface IRemixApi {
  manager: IPluginManager,
  solidity: ICompiler
  fileManager: IFileSystem
  solidityUnitTesting: IUnitTesting
  editor: IEditor
  network: INetwork
  udapp: IUdapp
  contentImport: IContentImport
  settings: ISettings
  theme: ITheme
}

export type RemixApi = Readonly<IRemixApi>

/** @deprecated Use remixProfiles instead. Will be remove in next version */
export const remixApi: ProfileMap<RemixApi> = Object.freeze({
  manager: pluginManagerProfile,
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' } as Profile<IUnitTesting>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  contentImport: contentImportProfile,
  settings: settingsProfile,
  theme: themeProfile,
})

/** Profiles of all the remix's Native Plugins */
export const remixProfiles: ProfileMap<RemixApi> = Object.freeze({
  manager: pluginManagerProfile,
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  git: { ...gitProfile, name: 'git' } as Profile<IGitSystem>,
  solidityUnitTesting: { ...unitTestProfile, name: 'solidityUnitTesting' } as Profile<IUnitTesting>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  contentImport: contentImportProfile,
  settings: settingsProfile,
  theme: themeProfile
})
