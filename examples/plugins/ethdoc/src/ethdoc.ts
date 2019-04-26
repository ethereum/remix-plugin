import {
  CompilationFileSources,
  CompilationResult,
  CompilatedContract,
  DeveloperDocumentation,
  UserDocumentation,
  DevMethodList,
  DevMethodDoc,
  UserMethodList,
  ABIDescription,
  FunctionDescription,
  UserMethodDoc,
} from 'remix-plugin'

type TemplateDoc<T> = { [key in keyof T]: (...params: any[]) => string }

const devdocTemplate: TemplateDoc<DeveloperDocumentation> = {
  author: (author: string) => `> Created By ${author}`,
  details: () => ``,
  construction: () => ``,
  title: () => ``,
  invariants: () => ``,
  methods: (methods: DevMethodList) => ''
}

const devMethodDocTemplate: TemplateDoc<DevMethodDoc> = {
  author: () => '',
  details: (details: string) => details,
  params: () => '',
  return: (value: string) => `Return : ${value}`
}

const userdocTemplate: TemplateDoc<UserDocumentation> = {
  construction: () => ``,
  source: () => ``,
  language: () => ``,
  languageVersion: () => ``,
  invariants: () => ``,
  notice: () => ``,
  methods: (methods: UserMethodList) => ''
}


export async function getCompilation(
  file: string,
  src: CompilationFileSources,
  version: string,
  result: CompilationResult,
) {
  if (!result) return
  const doc = createDoc(result)
  console.log(doc)
}

function createDoc(result: CompilationResult) {
  const files = Object.keys(result.contracts)
  return files
    .map(fileName => {
      const file = result.contracts[fileName]
      const contractNames = Object.keys(file)
      return contractNames.map(contract =>
        contractDoc(contract, file[contract]),
      )
    })
    .map(contracts => [].concat(contracts))
    .join('\n')
}


function contractDoc(name: string, contract: CompilatedContract) {
  const doc = contract.abi.map((def: FunctionDescription) => {
    if (def.type === 'function') {
      const method = Object.keys(contract.devdoc.methods).find(key => key.includes(def.name))
      const devdoc =  contract.devdoc.methods[method]
      return getMethod(def, devdoc)
    }
    // if (def.type === 'constructor') {
    //   getConstructor(def, contract.devdoc.construction, contract.userdoc.construction)
    // }

  })
  return doc
}

/** Create a table of param */
const getParams = (params: string[]) => (params.length === 0) ? '' : `
|name |type |description
|-----|-----|-----------
${params.join('\n')}`

const getMethodDetails = (devMethod) => !devMethod
  ? ''
  : Object.keys(devMethod)
    .map(key => devMethodDocTemplate[key](devMethod[key]))
    .join('\n')

/** Get the doc for a method */
function getMethod(def: FunctionDescription, devdoc: DevMethodDoc) {
  const devparams = devdoc ? devdoc.params : {}
  const params = def.inputs.map(input => {
    const description = devparams[input.name] || ''
    return `|${input.name}|${input.type}|${description}`
  })
  console.log(devdoc)
  return `
### ${def.name}
${getParams(params)}
${getMethodDetails(devdoc)}
`
}


