import { ModuleProfile, Api, API, ApiFactory, ApiEventEmitter } from '../../src'
import { EventEmitter } from 'events'


// Type
export interface Resolver extends Api {
  name: 'solResolver'
  combineSource(path: string): void
  getFile(url: string): string
}

// Profile
export const ResolverProfile: ModuleProfile<Resolver> = {
  name: 'solResolver',
  methods: ['combineSource', 'getFile']
}

// API
export class ResolverApi extends ApiFactory<Resolver> implements API<Resolver> {
  public readonly name = 'solResolver'
  public readonly profile = ResolverProfile
  public events: ApiEventEmitter<Resolver> = new EventEmitter() as any

  public combineSource(path: string) {
    console.log(path)
  }

  public getFile(url: string): string {
    return 'contract Ballot{}'
  }

}