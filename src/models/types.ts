import { EventManager } from 'remix-lib'

/****************
 *  NOTIFICATIONS
 *****************/
export interface Notif {
  app: {
    unfocus(): any
    focus(): any
  }
  compiler: {
    compilationFinished(params: {
      success: boolean
      data: CompilationResult['contracts']
      source: CompilationResult['sources']
    }): any
    compilationData(params: { compilationResult: object }): any
  }
  txlistener: {
    newTransaction(params: { tx: object }): any
  }
  editor: {
    currentFileChanged(params: { file: string }): any
  }
}

export type NotifKeys = 'app' | 'compiler' | 'txlistener' | 'editor'

export type NotifTypes =
  | keyof Notif['app']
  | keyof Notif['compiler']
  | keyof Notif['txlistener']
  | keyof Notif['editor']

/**********
 * REQUESTS
 ***********/

export type RequestKeys = 'app' | 'compiler' | 'config' | 'udapp' | 'editor'

export type RequestTypes =
  | keyof Request['app']
  | keyof Request['compiler']
  | keyof Request['config']
  | keyof Request['udapp']
  | keyof Request['editor']

export interface RequestInterface {
  [key: string]: {
    [type: string]: {
      params: object
      cb: Function
    }
  }
}

export interface Request extends RequestInterface {
  app: {
    getExecutionContextProvider: {
      params: {}
      cb: (params: { provider: 'injected' | 'web3' | 'vm' }) => any
    }
    getProviderEndpoint: {
      params: {}
      cb: (params: {}) => any
    }
    updateTitle: {
      params: { title: string }
      cb: () => any
    }
  }
  compiler: {
    getCompilationResult: {
      params: {}
      cb: (params: { compilationResult: object }) => any
    }
  }
  config: {
    setConfig: {
      params: { path: string; content: string }
      cb: () => any
    }
    getConfig: {
      params: { path: string }
      cb: (params: { config: string }) => any
    }
    removeConfig: {
      params: { path: string }
      cb: () => any
    }
  }
  udapp: {
    runTx: {
      params: { tx: object }
      cb: () => any
    }
    getAccounts: {
      params: {}
      cb: (params: { accounts: string[] }) => any
    }
    createVMAccount: {
      params: { privateKey: string; balance: string }
      cb: () => any
    }
  }
  editor: {
    getCurrentFile: {
      params: {}
      cb: (params: { name: string }) => any
    }
    getFile: {
      params: { path: string }
      cb: (params: { content: string }) => any
    }
    setFile: {
      params: { path: string; content: string }
      cb: () => any
    }
    highlight: {
      params: { lineColumnPos: object; filePath: string; hexcolor: string }
      cb: () => any
    }
  }
}

/*********
 * MESSAGE
 *********/
export interface Message {
  action: 'request' | 'response' | 'notification'
  key: RequestKeys | NotifKeys
  type: RequestTypes | NotifTypes
}

export interface NotifMsg extends Message {
  action: 'notification',
  key: NotifKeys,
  type: NotifTypes
  value: any[]
}

export interface RequestMsg extends Message {
  id: number,
  action: 'request',
  key: RequestKeys,
  type: RequestTypes,
  value: any[],
}

export interface ResponseMsg extends Message {
  id: number,
  action: 'response',
  key: RequestKeys,
  type: RequestTypes,
  value: any[] | null,
  error: string | undefined
}

/*********
 * PLUGINS
 *********/
export interface PluginList {
  [name: string]: {
    content: any
    modal: any
    origin: any
  }
}

export interface OriginList {
  [name: string]: any
}

export interface PluginDesc {
  title: string
  url: string
}

/***************
 * EventListener
 **************/
// TODO : To remove when remix-lib is written in typescript
export interface EventListener {
  event: EventManager
  [key: string]: any
}

/*********
 * NETWORK
 ********/
export interface Network {
  id: string
  name: string
}

/****************
 * COMPILER TYPES
 ****************/
export interface CompilationResponse {
  data: {
    contracts: CompilationResult['contracts']
  }
  source: {
    sources: CompilationResult['sources']
  }
}

export interface CompilationResult {
  contracts: {
    [contractTarget: string]: {
      [contractName: string]: Contract
    }
  }
  sources: {
    [contractTarget: string]: { content: string }
  }
}

export interface Contract {
  abi: ABIDefinition[]
  devdoc: Devdoc
  evm: EVMInfos
  metadata: string
  userdoc: Userdoc
}

export interface Devdoc {
  title: string
  author: string
  methods: {
    [methodName: string]: {
      details: string
      return: string
    }
  }
}

export interface Userdoc {
  notice: string
  methods: {
    [methodName: string]: {
      notice: string
    }
  }
}

export interface EVMInfos {
  bytecode: {
    linkReferences: any
    object: string
    opcodes: string
    sourceMap: string
  }
  deployedBytecode: {
    linkReferences: any
    object: string
    opcodes: string
    sourceMap: string
  }
}

/*****
 * ABI
 *****/

export interface ABIDefinition {
  constant?: boolean
  payable?: boolean
  anonymous?: boolean
  inputs?: ABIInput[]
  name?: string
  stateMutability?: 'view' | 'pure' | 'payable' | 'nonpayable'
  outputs?: ABIOutput[]
  type: 'function' | 'constructor' | 'event' | 'fallback'
}

export type ABIDataTypes = 'uint256' | 'boolean' | 'string' | 'bytes' | string // TODO complete list

export interface ABIInput {
  name: string
  type: ABIDataTypes
  indexed?: boolean
}

export interface ABIOutput {
  name: string
  type: ABIDataTypes
}

/*************
 * TRANSACTION
 *************/
export interface Tx {
  to: string
  nonce: number
  gasLimit: string
  gasPrice: string
  data: string
  value: string
}
