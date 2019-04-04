import { BaseApi, extendsProfile } from "./base"
import { ModuleProfile, Api, API } from "src/types"

export interface Transaction {
  from: string
}

export interface IUdappApi extends Api {
  events: {
    newTransaction: [Transaction]
  }
  sendTransaction(tx: Transaction): void
}

export const compilerProfile: Partial<ModuleProfile<IUdappApi>> = {
  kind: 'udapp',
  events: ['newTransaction'],
  methods: ['sendTransaction']
}

export abstract class UdappApi extends BaseApi<IUdappApi> implements API<IUdappApi> {
  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, compilerProfile)
    super(localProfile)
  }

  abstract sendTransaction(tx: Transaction): void
}
