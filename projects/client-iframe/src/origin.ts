import { PluginDevMode } from "@remixproject/plugin"

/** Fetch the default origins for remix */
export async function getDefaultOrigins() {
  const res = await fetch('https://raw.githubusercontent.com/ethereum/remix-plugin/master/projects/client/assets/origins.json')
  return res.json()
}

/** Get all the origins */
export async function getAllOrigins(devMode: Partial<PluginDevMode> = {}): Promise<string[]> {
  const localhost = devMode.port ? [
    `http://127.0.0.1:${devMode.port}`,
    `http://localhost:${devMode.port}`,
    `https://127.0.0.1:${devMode.port}`,
    `https://localhost:${devMode.port}`,
  ] : []
  const devOrigins = devMode.origins
    ? (typeof devMode.origins === 'string') ? [devMode.origins] : devMode.origins
    : []
  const defaultOrigins = await getDefaultOrigins()
  return [ ...defaultOrigins, ...localhost, ...devOrigins]
}

/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param devMode Devmode options
 */
export async function checkOrigin(origin: string, devMode: Partial<PluginDevMode> = {}) {
  const allOrigins = await getAllOrigins(devMode)
  return allOrigins.includes(origin)
}
