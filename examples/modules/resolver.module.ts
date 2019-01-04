import { ModuleProfile, Api, API } from '../../src'


// Type
export interface Resolver extends Api {
  type: 'solResolver'
  combineSource(path: string): void
  getFile(url: string): string
}

// Profile
export const ResolverProfile: ModuleProfile<Resolver> = {
  type: 'solResolver',
  methods: ['combineSource', 'getFile']
}

// API
export class ResolverApi implements API<Resolver> {
  public readonly type = 'solResolver'

  public combineSource(path: string) {
    console.log(path)
  }
  public getFile(url: string): string {
    return 'contract Ballot{}'
  }

}
