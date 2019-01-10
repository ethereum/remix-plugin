export type Factory = (...deps: any[]) => any

export class InjectorFactory {
  static create(name: string, deps: string[], useFactory: Factory) {
    const injector = Injector
    injector.entryName = name
    injector.deps = deps
    injector.useFactory = useFactory
    return injector
  }
}

export class Injector {
  public static entryName: string
  public static deps: string[]
  public static useFactory: Factory

  constructor(...deps: any[]) {}

  public activate() {}
  public deactivate() {}
}

interface ModuleConfig {
  name: string
  deps: string[]
}

interface OnActivate {
  onActivate(): void
}

interface OnDeactivate {
  onDeactivate(): void
}

export function Module(config: ModuleConfig) {
  return function<T extends typeof Injector>(constructor: T) {
    return class extends constructor {
      static entryName = config.name
      static deps = config.deps
      static useFactory = (...deps) => new constructor(...deps)

      // To be implemented
      public onActivate() {}
      public onDeactivate() {}

      public activate() {
        this.onActivate()
      }

      public deactivate() {
        this.onDeactivate()
      }
    }
  }
}


export class EventEmitter<T> {

  constructor(private name: string) {}

  public emit(detail: T) {
    dispatchEvent(new CustomEvent(this.name, { detail }))
  }

  public on(cb: (detail: T) => void) {
    addEventListener(this.name, e => cb((e as CustomEvent<T>).detail))
  }
}


interface InjectorMap {
  [name: string]: Injector
}

export class AppManager {

  public modules: InjectorMap

  constructor(modules: (typeof Injector)[]) {
    this.modules = this.addModules(modules)
  }

  private addModules(injectors) {
    const names: InjectorMap = {}
    injectors.forEach(injector => addInjector(injector))

    function addInjector(injector: typeof Injector) {
      if (names[injector.name]) return
      injector.deps.forEach(dep => {
        const depModule = findInjector(dep)
        if (!depModule) return
        addInjector(depModule)
      })
      const deps = injector.deps.map(dep => names[dep])
      names[injector.name] = injector.useFactory(...deps)
    }

    function findInjector(name: string) {
      return injectors.find(module => module.name === name)
    }
    return names
  }

}
