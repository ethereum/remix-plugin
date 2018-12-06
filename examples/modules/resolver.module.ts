import { ModuleProfile, Profile, ModuleService } from '../../src'

export interface ResolverProfile extends ModuleProfile {
  displayName: 'Solidity Import Resolver',
  icon: '<link to icon>',
  type: 'sol-resolver',
  methods: {
    combineSource(path: string): void,
    getFile(url: string): string
  },
  events: {}
  notifications: []
}

export interface IResolverService extends ModuleService<ResolverProfile> {}

/**
 * Profile
 */

export const resolverProfile: Profile<ResolverProfile> = {
  displayName: 'Solidity Import Resolver',
  icon: '<link to icon>',
  type: 'sol-resolver',
  methods: ['combineSource', 'getFile'],
}

/**
 * Service as a constant
 */
export const resolverService: IResolverService = {
  combineSource(path: string) {
    console.log(path)
  },
  getFile(url: string): string {
    return 'myFile'
  }
}