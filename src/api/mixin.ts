import { BaseApi } from './base'
import { Api, ApiEventEmitter } from '../types'

export class BaseMixinApi<U extends Api, State = Object> {
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