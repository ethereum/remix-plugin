import { ModuleProfile, Api, API, BaseApi, ApiEventEmitter } from '../../src'
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
export class ResolverApi extends BaseApi<Resolver> implements API<Resolver> {
  public events: ApiEventEmitter<Resolver> = new EventEmitter() as any

  constructor() {
    super(ResolverProfile)
  }

  public combineSource(path: string) {
    console.log(path)
  }

  public getFile(url: string): string {
    return 'contract Ballot{}'
  }

}