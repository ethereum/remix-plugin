// This file export all the Remix specific Api
import { compilerProfile, ICompilerApi } from "./compiler"
import { extendsProfile } from "./profile"
import { ModuleProfile } from "../types"
import { IFileSystemApi, fileSystemProfile } from "./file-system"
import { editorProfile } from './editor'
import { udappProfile } from './udapp'
import { networkProfile } from './network'

// SOLIDITY
interface ISolidityApi extends ICompilerApi {
  name: 'solidity'
}
const solidityProfile: ModuleProfile<ISolidityApi> = {
  name: 'solidity'
}

// FILE MANAGER
interface IFileManagerApi extends IFileSystemApi {
  name: 'fileManager'
}
const fileManagerProfile: ModuleProfile<IFileManagerApi> = {
  name: 'fileManager'
}


export const remixApi = [
  extendsProfile(solidityProfile, compilerProfile),
  extendsProfile(fileManagerProfile, fileSystemProfile),
  editorProfile,
  udappProfile,
  networkProfile
]