import { EventEmitter } from 'events'
import { Status, ModuleProfile, Api, PluginProfile, ApiEventEmitter } from '../types'
import { defaultProfile } from '../profile'
import { ApiFactory } from 'src/engine/api-factory';

export interface State {
  status: Status
}

/** Create an empty state */
function createState<T extends State>(): T {
  return {
    status: {} as Status,
  } as T
}

const StoreProfile: Partial<ModuleProfile> = {
  events: [],
  notifications: {}
}


/** Create a Profile with default values */
function createProfile<
    T extends Api,
    Profile extends ModuleProfile<T> | PluginProfile<T>
  >(profile: Profile, storeProfile: typeof StoreProfile): Profile {
  return {
    ...profile,
    events: [
      ...storeProfile.events,
      ...profile.events,
      ...defaultProfile.events
    ],
    notifications: {
      ...storeProfile.notifications,
      ...profile.notifications,
      ...defaultProfile.notifications
    },
  }
}

export abstract class Store<T extends State, U extends Api> extends ApiFactory<U> {
  protected state: T
  public readonly profile: ModuleProfile<U> | PluginProfile<U>
  public events: ApiEventEmitter<U>

  /**
   * Create a Store that hold the state of the component
   * @param name The name of the store
   * @param initialState The initial state of the store
   */
  constructor(
    profile: ModuleProfile<U> | PluginProfile<U>,
    private initialState: T = createState<T>()
  ) {
    super()
    this.events = new EventEmitter() as ApiEventEmitter<U>
    this.profile = createProfile(profile, StoreProfile)
    this.state = { ...this.initialState }
  }

  /** Set the status of the Api */
  setStatus(status: Status) {
    this.state.status = status
    this.events.emit('statusChanged', status)
  }

  /**
   * Update one field of the state
   * @param state The part of the state updated
   */
  updateState(state: Partial<T>) {
    this.state = { ...this.state, ...state }
  }

  /**
   * Get one field of the state
   * @param key A key of the state
   */
  getState(key: keyof T) {
    return this.state[key]
  }

  /** Reset the state its initial value */
  resetState() {
    this.state = this.initialState
  }

}
