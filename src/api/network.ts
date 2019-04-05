import { BaseApi, extendsProfile } from "./base"
import { ModuleProfile, Api, API } from "src/types"

export interface INetworkApi extends Api {
  events: {

  }
  detectNetWork(): any
}

export const networkProfile: Partial<ModuleProfile<INetworkApi>> = {
  kind: 'network',
  methods: ['detectNetWork']
}

export abstract class NetworkApi extends BaseApi<INetworkApi> implements API<INetworkApi> {
  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, networkProfile)
    super(localProfile)
  }

  abstract detectNetWork(): any
}