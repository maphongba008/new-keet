import { getImageMetaData } from 'react-native-compressor'

export const getImageDimensions = async (uri: string) => {
  const metadata = await getImageMetaData(uri)

  return {
    height: metadata.ImageHeight,
    width: metadata.ImageWidth,
  }
}
