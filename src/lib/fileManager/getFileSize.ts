import { getFileSize as _getFileSize } from 'react-native-compressor'

export const getFileSize = async (uri: string) => {
  try {
    const size = await _getFileSize(uri)
    const byteLength = Number.parseFloat(size)

    if (isNaN(byteLength)) return null

    return byteLength
  } catch (error) {}

  return null
}
