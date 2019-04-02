import { Status, Api, ApiEventEmitter, ModuleProfile } from "../types"
import { BaseMixinApi, MixinApi } from "./mixin"

// API
export interface StatusApi {
  name: 'status',
  events: {
    statusChanged: [Status]
  }
}

// STATE
export interface StatusState {
  status: Status
}

// PROFILE
export const statusProfile: Partial<ModuleProfile<StatusApi>> = {
  events: <const>['statusChanged']
}

// MIXIN
export class StatusMixin implements BaseMixinApi<StatusState, StatusApi> {
  public state: StatusState
  public events: ApiEventEmitter<StatusApi>

  /** Set the status of the Api */
  public setStatus(status: Status) {
    this.state.status = status
    this.events.emit('statusChanged', status)
  }

  /** Get a snapshot of the status */
  public getStatus() {
    return this.state.status
  }
}
