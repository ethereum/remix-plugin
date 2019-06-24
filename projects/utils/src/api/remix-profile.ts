import { ProfileMap, Profile } from '../types'
import { compilerProfile, ICompiler } from './compiler'
import { filSystemProfile, IFileSystem } from './file-system'
import { editorProfile, IEditor } from './editor'
import { networkProfile, INetwork } from './network'
import { udappProfile, IUdapp } from './udapp'
import { themeProfile, ITheme } from './theme'

export interface IRemixApi {
  solidity: ICompiler
  fileManager: IFileSystem
  editor: IEditor
  network: INetwork
  udapp: IUdapp
  theme: ITheme
}

export type RemixApi = Readonly<IRemixApi>

/** @deprecated Use remixProfiles instead. Will be remove in next version */
export const remixApi: ProfileMap<RemixApi> = Object.freeze({
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  theme: themeProfile
})

/** Profiles of all the remix's Native Plugins */
export const remixProfiles: ProfileMap<RemixApi> = Object.freeze({
  solidity: { ...compilerProfile, name: 'solidity' } as Profile<ICompiler>,
  fileManager: { ...filSystemProfile, name: 'fileManager' } as Profile<IFileSystem>,
  editor: editorProfile,
  network: networkProfile,
  udapp: udappProfile,
  theme: themeProfile
})
