import { ModuleManager } from '../module-manager'
import { RemixPlugin } from './types'
import { execution } from 'remix-lib'

const { executionContext } = execution

export class AppApi extends RemixPlugin {

  protected manager: ModuleManager

  constructor(private service) {
    super('app')
  }

  public activate(manager: ModuleManager) {
    this.manager = manager

    this.addMethod('getExecutionContextProvider', () => {
      return executionContext.getProvider()
    })

    this.addMethod('getProviderEndpoint', () => {
      if (executionContext.getProvider() === 'web3') {
        return executionContext.web3().currentProvider.host
      } else {
        throw new Error('no endpoint: current provider is either injected or vm')
      }
    })

  }

  public deactivate() {}
}