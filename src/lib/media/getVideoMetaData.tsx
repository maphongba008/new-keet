import { getVideoMetaData as RNCgetVideoMetaData } from 'react-native-compressor'

import { getImageDimensions } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

import { getIsValidDimensions } from './getIsValidDimensions'
import { getUploadPreviewUri } from './getUploadPreviewUri'

type VideoMetaData = Pick<UploadFile, 'dimensions' | 'duration' | 'previewPath'>

export const getVideoMetaData = async (
  uri: string,
  file: UploadFile,
): Promise<VideoMetaData> => {
  const previewPath = await getUploadPreviewUri({
    uri: uri,
    isVideo: true,
  })
  const duration = (await RNCgetVideoMetaData(uri)).duration || 0
  const dimensions = getIsValidDimensions(file.dimensions)
    ? file.dimensions
    : await getImageDimensions(uri)

  return { dimensions, duration, previewPath }
}
