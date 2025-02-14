import { getImageDimensions } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

import { getIsValidDimensions } from './getIsValidDimensions'
import { getUploadPreviewUri } from './getUploadPreviewUri'

type ImageMetaData = Pick<UploadFile, 'dimensions' | 'previewPath'>

export const getImageMetaData = async (
  uri: string,
  file: UploadFile,
): Promise<ImageMetaData> => {
  const dimensions = getIsValidDimensions(file.dimensions)
    ? file.dimensions
    : await getImageDimensions(uri)
  const previewPath = await getUploadPreviewUri({ uri })

  return { dimensions, previewPath }
}
