// BASE
export class BaseStore<S extends {}> {
  private initialState: S = {} as S
  protected state: S

  constructor(initialState: S) {
    this.initialState = initialState
  }

  /**
   * Update one field of the state
   * @param state The part of the state updated
   */
  public update(state: Partial<S>)
  public update<R>(callback: (store: S) => Partial<S>)
  public update<R>(update: keyof S | Partial<S> | ((store: S) => R)) {
    switch (typeof update) {
      case 'function': {
        this.state = { ...this.state, ...update(this.state) }
        break
      }
      case 'object': {
        this.state = { ...this.state, ...update }
        break
      }
    }
  }

  /** Get the state or a part of it */
  public get(): S
  public get<K extends keyof S>(key: K): S[K]
  public get<R>(query: (store: S) => R): R
  public get<K extends keyof S, R>(
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
}
