// This file export all the Remix specific Api
import { compilerProfile, ICompilerApi } from "./compiler"
import { extendsProfile } from "./profile"
import { ModuleProfile } from "../types"

// SOLIDITY
interface ISolidityApi extends ICompilerApi {
  name: 'solidity'
}
const solidityProfile: ModuleProfile<ISolidityApi> = {
  name: 'solidity'
}



export const remixApi = [
  extendsProfile(compilerProfile, solidityProfile)
]