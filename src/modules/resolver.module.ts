import { ModuleProfile, Profile } from '../remix-module'
import { ModuleService } from '../module'

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

export interface ResolverService extends ModuleService<ResolverProfile> {}

export const resolverProfile: Profile<ResolverProfile> = {
  displayName: 'Solidity Import Resolver',
  icon: '<link to icon>',
  type: 'sol-resolver',
  methods: ['combineSource', 'getFile'],
}