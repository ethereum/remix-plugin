import { Status, Api, ApiEventEmitter, ModuleProfile } from "../types"
import { BaseMixinApi } from "./mixin"

export interface StatusApi {
  events: {
    statusChanged: [Status]
  }
}

export interface StatusState {
  status: Status
}

function emptyStatusState<T>(): StatusState {
  return { status: {} as Status }
}


export const StatusProfile: Partial<ModuleProfile<StatusApi>> = {
  events: ['statusChanged'] as const,
  notifications: {
    'theme': ['switchTheme']
  }
}

export class StatusApiMixin<T extends Api> implements BaseMixinApi<StatusState, StatusApi> {
  public mixinProfile = StatusProfile
  public state: StatusState = emptyStatusState()
  public events: ApiEventEmitter<T>
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