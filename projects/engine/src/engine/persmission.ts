import { Profile } from '../../../utils'

/** Used to ask permission to use a plugin */
export interface IPermissionHandler {
  askPermission: (from: Profile, to: Profile) => Promise<boolean>
  onActivation?: (from: Profile, to: Profile) => void
}

export interface Permissions {
  [to: string]: {
    [from: string]: {
      allow: boolean
      hash: string
    }
  }
}