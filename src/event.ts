export class EventEmitter<T> {
  constructor(private name: string) {}

  public emit(detail: T) {
    dispatchEvent(new CustomEvent(this.name, { detail }))
  }

  public on(cb: (detail: T) => void) {
    addEventListener(this.name, e => cb((e as CustomEvent<T>).detail))
  }
}

