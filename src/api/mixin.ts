import { BaseApi, createProfile } from './base'
import { ModuleProfile, Api, ApiEventEmitter } from '../types'

export class BaseMixinApi<S, U extends Partial<Api>> {
  mixinProfile: Partial<ModuleProfile<U>>
  state: S
  events: ApiEventEmitter<U>
}

export function MixinApi<T extends typeof BaseMixinApi>(mixins: T[]) {
  mixins.forEach(mixin => {
      Object
        .getOwnPropertyNames(mixin.prototype)
        .forEach(name => {
          switch (name) {
            case 'state': {
              BaseApi.prototype['state'] = {
                ...mixin.prototype['state'],
                ...BaseApi.prototype['state']
              }
              break
            }
            case 'mixinProfile': {
              BaseApi.prototype['mixinProfile'] = createProfile(
                BaseApi.prototype['mixinProfile'] as ModuleProfile,
                BaseApi.prototype['mixinProfile']
              )
              break
            }
            default: BaseApi.prototype[name] = mixin.prototype[name]
          }
        })
  })

  return Object.assign({}, BaseApi) as typeof BaseApi & T
}