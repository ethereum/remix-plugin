import { ModuleProfile, Profile, ModuleService } from '../../src'

/* ------- TYPES ------- */

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

/* ------- IMPLEMENTATION ------- */

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
  combineSource(path: string) {},
  getFile(url: string): string {
    return 'myFile'
  }
}