import {
  createIframeClient,
  remixApi,
  CompilationFileSources,
  CompilationResult,
} from 'remix-plugin'

const client = createIframeClient({
  customApi: remixApi,
  devMode: { port: 8080 }
})

async function start() {
  await client.onload()
  client.solidity.on('compilationFinished', getCompilation)
}

async function getCompilation(
  file: string,
  src: CompilationFileSources,
  version: string,
  result: CompilationResult,
) {}
