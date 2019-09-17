/** List of available gateways for decentralised storage */
export const defaultGateways = {
    'ipfs://': 'https://ipfsgw.komputing.org/ipfs/',
    'swarm://': 'https://swarm-gateways.net/bzz-raw://'
}

/** Transform the URL to use a gateway if decentralised storage is specified */
export function transformUrl(url: string) {
    const network = Object.keys(defaultGateways).find(key => url.startsWith(key))
    return network ? url.replace(network, defaultGateways[network]) : url
}
