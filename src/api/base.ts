import {
  Status,
  ModuleProfile,
  Api,
  PluginProfile,
  ApiEventEmitter,
  PluginApi,
  PluginRequest,
  ExtractKey,
} from '../types'
import { EventEmitter } from 'events'

export interface State {
  status: Status
}

/** Create an empty state */
function createState<T extends State>(): T {
  return {
    status: {},
  } as T
}

export const StoreProfile: Partial<ModuleProfile> = {
  events: ['statusChanged'],
  notifications: {
    'theme': ['switchTheme']
  }
}

/** Create a Profile with default values */
export function createProfile<
  T extends Api,
  Profile extends ModuleProfile<T> | PluginProfile<T>
>(profile: Profile, storeProfile: typeof StoreProfile): Profile {
  return {
    ...profile,
    methods: [...storeProfile.methods, ...profile.methods],
    events: [...storeProfile.events, ...profile.events],
    notifications: {
      ...storeProfile.notifications,
      ...profile.notifications,
    },
  }
}

export abstract class BaseApi<S extends State, U extends Api> {
  private requestQueue: Array<() => Promise<any>> = []
  protected currentRequest: PluginRequest
  protected storeProfile = StoreProfile
  protected state: S
  public readonly profile: ModuleProfile<U> | PluginProfile<U>
  public events: ApiEventEmitter<U>
  public activate?: () => Promise<void>
  public deactivate?: () => void
  public render?: () => HTMLElement

  constructor(
    profile: ModuleProfile<U> | PluginProfile<U>,
    private initialState: S = createState<S>(),
  ) {
    this.events = new EventEmitter() as ApiEventEmitter<U>
    this.profile = createProfile(profile, this.storeProfile)
    this.state = { ...this.initialState }
  }

  ////////////
  // STATUS //
  ////////////

  /** Set the status of the Api */
  protected setStatus(status: Status) {
    this.state.status = status
    this.events.emit('statusChanged', status)
  }

  /** Get a snapshot of the status */
  public getStatus() {
    return this.getState(state => state.status)
  }

  //////////////////////
  // STATE MANAGEMENT //
  //////////////////////

  /**
   * Update one field of the state
   * @param state The part of the state updated
   */
  public updateState(state: Partial<S>) {
    this.state = { ...this.state, ...state }
  }

  /** Get the state or a part of it */
  public getState(): S
  public getState<K extends keyof S>(key: K): S[K]
  public getState<R>(query: (store: S) => R): R
  public getState<K extends keyof S, R>(
    query?: ((state: S) => R) | K,
  ): R | S | S[K] {
    switch (typeof query) {
      case 'function': return query(this.state)
      case 'string': return this.state[query]
      default: return this.state
    }
  }

  /** Reset the state its initial value */
  public resetState() {
    this.state = this.initialState
  }

  /////////
  // API //
  /////////

  /** Exports an Api interface */
  public api(): PluginApi<U> {
    return {
      events: this.events,
      name: this.profile.name,
      profile: this.profile,
      render: this.render ? () => (this.render as any)() : undefined,
      activate: this.activate ? () => (this.activate as any)() : undefined,
      deactivate: this.deactivate ? () => (this.deactivate as any)() : undefined,
      addRequest: (
        request: PluginRequest,
        method: ExtractKey<U, Function>,
        args: any[],
      ) => {
        return new Promise((resolve, reject) => {
          if (!this.profile.methods || !this.profile.methods.includes(method)) {
            reject(new Error(`Method ${method} is not exposed by ${this.profile.name}`))
          }
          if (!(method in this)) {
            reject(new Error(`Method ${method} is not implemented by ${this.profile.name}`))
          }
          // Add a new request to the queue
          this.requestQueue.push(async () => {
            this.currentRequest = request
            try {
              const result = await this[method as string](...args)
              resolve(result)
            } catch (err) {
              reject(err)
            }
            // Remove current request and call next
            this.requestQueue.shift()
            if (this.requestQueue.length !== 0) this.requestQueue[0]()
          })
          // If there is only one request waiting, call it
          if (this.requestQueue.length === 1) {
            this.requestQueue[0]()
          }
        })
      },
    }
  }
}
