import { Profile } from '../../../utils'

/** Used to ask permission to use a plugin */
export interface IPermissionHandler {
  askPermission: (from: Profile, to: Profile) => Promise<boolean>
}

export interface Permissions {
  [to: string]: {
    [from: string]: {
      allow: boolean
      hash: string
    }
  }
}