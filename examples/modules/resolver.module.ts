import { ModuleProfile, Api, API } from '../../src'


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
export class ResolverApi implements API<Resolver> {
  public readonly name = 'solResolver'

  public combineSource(path: string) {
    console.log(path)
  }
  public getFile(url: string): string {
    return 'contract Ballot{}'
  }

}