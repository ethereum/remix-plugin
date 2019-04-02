import { BaseApi, createProfile } from './base'
import { ModuleProfile, Api, ApiEventEmitter } from '../types'

export class BaseMixinApi<State, U extends Api> {
  state: State
  events: ApiEventEmitter<U>
}

export function MixinApi(mixins: any[]) {
  const Base = BaseApi
  mixins.forEach(mixin => {
    Object
      .getOwnPropertyNames(mixin.prototype)
      .forEach(name => Base.prototype[name] = mixin.prototype[name])
  })
  return Base
}