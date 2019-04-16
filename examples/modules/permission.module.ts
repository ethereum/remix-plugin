import { ModuleProfile, Api, API, BaseApi } from '../../src'

// Type
export interface PermissionModule extends Api {
  name: 'permissionModule'
  events: {}
  methods: {
    callWithPermission(): boolean
  }
}

// Profile
export const PermissionModuleProfile: ModuleProfile<PermissionModule> = {
  name: 'permissionModule',
  methods: ['callWithPermission'],
  permission: true
}

// API
export class PermissionModuleApi extends BaseApi<PermissionModule> implements API<PermissionModule> {
  constructor() {
    super(PermissionModuleProfile)
  }

  public callWithPermission() {
    return true
  }
}