const { createIframeClient } = remixPlugin
const devMode = { port: 8080 }
const client = createIframeClient({ devMode })

let latestCompilationResult = null
let fileName

// Listen on new compilation result
client.on(
  'solidity',
  'compilationFinished',
  (file, source, languageVersion, data) => {
    fileName = file
    latestCompilationResult = { data, source }
  },
)

// Get the current compilation result and make a request to the Ehterscan API
async function getResult() {
  const el = document.querySelector('div#results')
  try {
    el.innerText = 'Getting current compilation result, please wait...'
    if (!latestCompilationResult) {
      await client.onload()
      const compilation = await client.call('solidity', 'getCompilationResult')
      if (!compilation) throw new Error('no compilation result available')
      fileName = compilation.source.target
      latestCompilationResult = compilation
    }
    const address = document.querySelector('input[id="verifycontractaddress"]').value
    if (address.trim() === '') {
      throw new Error('Please enter a valid contract address')
    }
    el.innerText = `Verifying contract. Please wait...`
    // fetch results
    const result = await doPost(latestCompilationResult, address)
    document.querySelector('div#results').innerText = result
  } catch (err) {
    el.innerText = err.message
  }
}

// Make a POST request to the Etherscan API
async function doPost(info, address) {
  const network = await client.call('network', 'detectNetwork')
  if (!network) {
    throw new Error('no known network to verify against')
  }
  const etherscanApi =
    network.name === 'main'
      ? `https://api.etherscan.io/api`
      : `https://api-${network.name.toLowerCase()}.etherscan.io/api`

  const name = document.getElementById('verifycontractname').value
  let contractMetadata = info.data.contracts[fileName][name]['metadata']
  contractMetadata = JSON.parse(contractMetadata)
  const data = {
    apikey: 'CC4YVQGTC45H2IXX6BDUNP54TXJHKVMWY5', //A valid API-Key is required
    module: 'contract', //Do not change
    action: 'verifysourcecode', //Do not change
    contractaddress: address, //Contract Address starts with 0x...
    sourceCode: info.source.sources[fileName].content, //Contract Source Code (Flattened if necessary)
    contractname: name, //ContractName
    compilerversion: `v${contractMetadata.compiler.version}`, // see http://etherscan.io/solcversions for list of support versions
    optimizationUsed: contractMetadata.settings.optimizer.enabled ? 1 : 0, //0 = Optimization used, 1 = No Optimization
    runs: contractMetadata.settings.optimizer.runs, //set to 200 as default unless otherwise
    constructorArguements: document.getElementById('verifycontractarguments')
      .value, //if applicable
  }

  try {
    const response = await fetch(etherscanApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: data,
    })
    const json = await response.json()
    return json.result
  } catch (error) {
    document.querySelector('div#results').innerText = error
  }
}