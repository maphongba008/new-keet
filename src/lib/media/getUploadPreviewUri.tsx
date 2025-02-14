import { copyAsync } from 'expo-file-system'

import { createImagePreview, createVideoPreview } from 'lib/fileManager'
import { getPathFromUri } from 'lib/fs'

import { generateThumbnailUri } from './generateThumbnailUri'

interface GetUploadPreviewUriParams {
  uri: string
  isVideo?: boolean
}

export const getUploadPreviewUri = async ({
  uri,
  isVideo,
}: GetUploadPreviewUriParams): Promise<string> => {
  const createPreview = isVideo ? createVideoPreview : createImagePreview
  const thumbnailUri = await createPreview(uri, {
    isBase64Output: false,
    compress: 0.5,
  })
  const thumbnailSpecificPath = generateThumbnailUri(thumbnailUri)
  await copyAsync({ from: thumbnailUri, to: thumbnailSpecificPath })

  return getPathFromUri(thumbnailSpecificPath)
}
