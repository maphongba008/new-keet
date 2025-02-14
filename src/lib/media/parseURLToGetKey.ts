import { getFileName } from 'lib/fs'

export const getQueryParams = (uri: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g
  let params = {} as any
  let match
  while ((match = regex.exec(uri))) {
    params[match[1]] = match[2]
  }
  return {
    key: params.key,
    version: params.version,
  }
}

export const parseURLToGetKey = (uri: string) => {
  try {
    const fileName = getFileName(uri)
    if (fileName) {
      const endIndex = fileName.lastIndexOf('.')
      const version = getQueryParams(uri).version || -1

      return fileName.slice(0, endIndex) + version
    }
  } catch (e) {
    console.error('Error from parseURLToGetKey', e)
  }
  return ''
}
