
export let defaultGateways: {
    'ipfs://': 'https://ipfsgw.komputing.org/ipfs/',
    'swarm://': 'https://swarm-gateways.net/bzz-raw://'
}

export function transformUrl (url: string) {
    const network = Object.keys(defaultGateways).find(key => url.startsWith(key))
    return network ? url.replace(network, defaultGateways[network]) : url
}
