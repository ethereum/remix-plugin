import { CompilerApi, compilerProfile, extendsProfile } from '../api'

export const commonProfiles = [
  extendsProfile(compilerProfile, { name: 'solidity' }),
  {...compilerProfile, name: 'solidity'},
]
