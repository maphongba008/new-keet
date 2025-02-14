import { version as dhtVersion } from 'hyperdht/package.json'

export async function versions() {
  return {
    dhtVersion,
  }
}
