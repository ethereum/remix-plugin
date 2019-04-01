import { Status, Api, ModuleProfile, PluginProfile } from 'src/types'
import { State, BaseApi, StoreProfile } from './base'

export interface EntityState<T> extends State {
  entities: {
    [key: string]: T
  }
  ids: string[]
  actives: string[]
}

/** Create an empty state */
function emptyEntityState<T>(): EntityState<T> {
  return {
    status: {} as Status,
    ids: [],
    actives: [],
    entities: {},
  }
}

const EntityStoreProfile: Partial<ModuleProfile> = {
  events: [
    ...StoreProfile.events,
    ...['add', 'remove', 'clear', 'update', 'activate', 'deactivate']
  ],
  notifications: {
    ...StoreProfile.notifications
  }
}

export class EntityApi<T, U extends Api> extends BaseApi<EntityState<T>, U> {
  private readonly keyId: string
  protected storeProfile = EntityStoreProfile

  /**
   * Create a entity Store that hold a map entity of the same model
   * @param profile The name of the store
   * @param keyId The name of the key used as a unique ID for the entity
   * @param initialState The initial state used if state is not available in `localStorage`
   */
  constructor(
    profile: ModuleProfile<U> | PluginProfile<U>,
    keyId?: string,
    initialState: EntityState<T> = emptyEntityState(),
  ) {
    super(profile, initialState)
    this.keyId = keyId || ('id' as string)
  }

  /** The entities as a Map */
  get entities() {
    return this.state.entities
  }

  /** List of all the ids */
  get ids() {
    return this.state.ids
  }

  /** List of all active ID */
  get actives() {
    return this.state.actives
  }

  /** Return the length of the entity collection */
  get length() {
    return this.state.ids.length
  }

  /** Add a new entity to the state */
  addEntity(entity: T) {
    const id = entity[this.keyId]
    this.state.entities[id] = entity
    this.state.ids.push(id)
    this.events.emit('add', entity)
  }

  /** Add entities to the state */
  addEntities(entities: T[]) {
    entities.forEach(entity => {
      if (!entity[this.keyId])
        throw new Error(`Key ${this.keyId} doesn't exist in ${entity}`)
      this.addEntity(entity)
    })
    this.events.emit('add', entities)
  }

  /**
   * Remove an entity from the state
   * @param id The id of the entity to remove
   */
  removeEntity(id: string) {
    if (!this.state.entities[id])
      throw new Error(`No entity with key ${id} found in store ${this.profile.name}`)
    delete this.state.entities[id]
    this.state.ids.splice(this.state.ids.indexOf(id), 1)
    this.state.actives.splice(this.state.ids.indexOf(id), 1)
    this.events.emit('remove', id)
  }

  /** Remove all entity from the state and reset actives and ids to empty */
  clearState() {
    this.state = emptyEntityState()
    this.events.emit('clear')
  }

  /**
   * Update one entity of the state
   * @param id The id of the entity to update
   * @param update The fields to update in the entity
   */
  updateEntity(id: string, update: Partial<T>) {
    if (!this.state.entities[id])
      throw new Error(`No entity with key ${id} found in store ${this.profile.name}`)
    this.state.entities[id] = {
      ...this.state.entities[id],
      ...update,
    }
    this.events.emit('update', this.state.entities[id])
  }

  /**
   * Activate one or several entity from the state
   * @param ids An id or a list of id to activate
   */
  setActive(ids: string | string[]) {
    Array.isArray(ids)
      ? this.state.actives.concat(ids)
      : this.state.actives.push(ids)
    this.events.emit('activate', ids)
  }

  /**
   * Deactivate one or several entity from the state
   * @param ids An id or a list of id to deactivate
   */
  removeActive(ids: string | string[]) {
    if (!Array.isArray(ids)) ids = [ids]
    ids.forEach(id => {
      const index = this.state.actives.indexOf(id)
      this.state.actives.splice(index, 1)
    })
    this.events.emit('deactivate', ids)
  }

  ///////////
  // QUERY //
  ///////////

  /**
   * Get one entity
   * @param id The id of the entity to get
   */
  getOne(id: string) {
    return this.state.entities[id]
  }

  /**
   * Get many entities as an array
   * @param ids An array of id of entity to get
   */
  getMany(ids: string[]) {
    return ids.map(id => this.state.entities[id])
  }

  /**
   * Get all the entities as an array
   */
  getAll(): T[] {
    return this.state.ids.map(id => this.state.entities[id])
  }

  /** Get all active entities */
  getActives() {
    return this.state.actives.map(id => this.state.entities[id])
  }

  /**
   * Is the entity active
   * @param id The id of the entity to check
   */
  isActive(id: string) {
    return this.state.actives.includes(id)
  }

  /**
   * Is this id inside the store
   * @param id The id of the entity to check
   */
  hasEntity(id: string) {
    return this.state.ids.includes(id)
  }

  /** Is the state empty */
  isEmpty() {
    return this.state.ids.length === 0
  }
}