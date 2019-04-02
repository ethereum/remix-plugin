import { ModuleProfile, Api, API, ApiEventEmitter, ApiFactory } from '../../src'
import { EventEmitter } from 'events'

// Type
export interface PermissionModule extends Api {
  name: 'permissionModule'
  callWithPermission(): boolean
}

// Profile
export const PermissionModuleProfile: ModuleProfile<PermissionModule> = {
  name: 'permissionModule',
  methods: ['callWithPermission'],
  permission: true
}

// API
export class PermissionModuleApi extends ApiFactory<PermissionModule> implements API<PermissionModule> {
  public readonly name = 'permissionModule'
  public readonly profile = PermissionModuleProfile
  public events: ApiEventEmitter<PermissionModuleApi>

  constructor() {
    super()
  }

  public callWithPermission() {
    return true
  }
}