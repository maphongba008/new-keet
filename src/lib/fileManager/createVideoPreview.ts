import { getThumbnailAsync } from 'expo-video-thumbnails'

import { ImageDimensions } from 'lib/types'

import { createImagePreview } from './createImagePreview'

type CreatePreviewSingleSize = {
  sizePx: number
}
type CreatePreviewParams = (CreatePreviewSingleSize | ImageDimensions | {}) & {
  mimeType?: 'jpg' | 'png'
  compress?: number
  isBase64Output?: boolean
}

export const createVideoPreview = async (
  src: string,
  config: CreatePreviewParams,
): Promise<string> => {
  const { uri: thumbnailUri } = await getThumbnailAsync(src)
  const savedImageUriOrBase64 = await createImagePreview(thumbnailUri, config)

  return savedImageUriOrBase64
}
