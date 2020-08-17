export interface ContentImport {
  content: string
  cleanUrl: string
  type: 'github' | 'http' | 'https' | 'swarm' | 'ipfs'
  url: string
}