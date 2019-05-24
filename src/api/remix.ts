// This file export all the Remix specific Api
import { compilerProfile, ICompilerApi } from "./compiler"
import { extendsProfile } from "./profile"
import { ModuleProfile } from "../types"
import { IFileSystemApi, fileSystemProfile } from "./file-system"
import { IEditorApi, editorProfile } from './editor'
import { udappProfile, IUdappApi } from './udapp'
import { networkProfile, INetworkApi } from './network'

// SOLIDITY
interface ISolidityApi extends ICompilerApi {
  name: 'solidity'
}
const remixSolidityProfile: ModuleProfile<ISolidityApi> = {
  ...compilerProfile,
  name: 'solidity'
}

// FILE MANAGER
interface IFileManagerApi extends IFileSystemApi {
  name: 'fileManager'
}
const remixFileManagerProfile: ModuleProfile<IFileManagerApi> = {
  ...fileSystemProfile,
  name: 'fileManager'
}

// EDITOR
interface IRemixEditorApi extends IEditorApi {
  name: 'editor'
}

// UDAPP
interface IRemixUdappApi extends IUdappApi {
  name: 'udapp'
}

// NETWORK
interface IRemixNetworkApi extends INetworkApi {
  name: 'network'
}

export const remixApi = [
  extendsProfile(remixSolidityProfile, compilerProfile),
  extendsProfile(remixFileManagerProfile, fileSystemProfile),
  editorProfile as ModuleProfile<IRemixEditorApi>,
  udappProfile as ModuleProfile<IRemixUdappApi>,
  networkProfile as ModuleProfile<IRemixNetworkApi>,
]