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

const apikeyStorageKey = 'etherscan-api-key'
function saveAPIkey (e) {
  const value = document.querySelector('input#apikey').value
  localStorage.setItem(apikeyStorageKey, value)
  apikey = value
}
let apikey  = localStorage.getItem(apikeyStorageKey)
if (apikey) document.querySelector('input#apikey').value = apikey

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
  const ctrArgument = document.getElementById('verifycontractarguments').value ?
  document.getElementById('verifycontractarguments').value.replace('0x', '') : ''
  const data = {
    apikey: apikey, //A valid API-Key is required
    module: 'contract', //Do not change
    action: 'verifysourcecode', //Do not change
    contractaddress: address, //Contract Address starts with 0x...
    sourceCode: info.source.sources[fileName].content, //Contract Source Code (Flattened if necessary)
    contractname: name, //ContractName
    compilerversion: `v${contractMetadata.compiler.version}`, // see http://etherscan.io/solcversions for list of support versions
    optimizationUsed: contractMetadata.settings.optimizer.enabled ? 1 : 0, //0 = Optimization used, 1 = No Optimization
    runs: contractMetadata.settings.optimizer.runs, //set to 200 as default unless otherwise
    constructorArguements: ctrArgument, //if applicable
  }
  let formData = new FormData()
  for (var k in data) {
    formData.append(k, data[k])
  }

  try {
    client.emit('statusChanged', { key: 'loading', type: 'info', title: 'Verifying ...' })
    const response = await fetch(etherscanApi, {
      method: 'POST',
      body: formData
    })
    const json = await response.json()
    if (json.message === 'OK' && json.status === '1') checkValidation(etherscanApi, json.result)
    if (json.message === 'NOTOK') {
      client.emit('statusChanged', { key: 'failed', type: 'error', title: json.result })
      scheduleResetStatus()
    }
    return json.result
  } catch (error) {
    document.querySelector('div#results').innerText = error
  }
}

async function checkValidation (etherscanApi, guid) {
  try {
    let params = `?guid=${guid}&module=contract&action=checkverifystatus`
    const response = await fetch(etherscanApi + params, {
      method: 'GET'
    })
    const json = await response.json()
    document.querySelector('div#results').innerText = json.message + ' ' + json.result
    if (json.message === 'NOTOK' && json.result === 'Pending in queue') {
      setTimeout(() => {
        document.querySelector('div#results').innerText += '. Polling...'
        checkValidation(etherscanApi, guid)
      }, 4000);
    } else  if (json.message === 'OK') {
      client.emit('statusChanged', { key: 'succeed', type: 'success', title: json.result + ' Verified!' })
    } else {
      client.emit('statusChanged', { key: 'failed', type: 'error', title: json.result })
    }
    scheduleResetStatus()
  } catch (error) {
    document.querySelector('div#results').innerText = error
  }
}

function scheduleResetStatus () {
  setTimeout(() => {
    client.emit('statusChanged', { key: 'none' })
  }, 10000)
}