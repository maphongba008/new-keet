import { Image } from 'react-native-compressor'

import { ImageDimensions } from 'lib/types'

type CreatePreviewSingleSize = {
  sizePx: number
}
type CreatePreviewParams = (CreatePreviewSingleSize | ImageDimensions | {}) & {
  mimeType?: 'jpg' | 'png'
  compress?: number
  isBase64Output?: boolean
}

const DEFAULT_COMPRESS = 0.8
const DEFAULT_IMAGE_FORMAT = 'jpg'
const DEFAULT_IS_IMAGE_BASE64 = true

export const createImagePreview = async (
  src: string,
  {
    compress = DEFAULT_COMPRESS,
    mimeType = DEFAULT_IMAGE_FORMAT,
    isBase64Output = DEFAULT_IS_IMAGE_BASE64,
    ...size
  }: CreatePreviewParams,
): Promise<string> => {
  let dimensions: ImageDimensions | undefined

  if ('sizePx' in size) {
    dimensions = {
      width: size.sizePx,
      height: size.sizePx,
    }
  }
  if ('width' in size) {
    dimensions = size
  }

  const compressedImage = await Image.compress(src, {
    maxHeight: dimensions?.height,
    maxWidth: dimensions?.width,
    compressionMethod: 'auto',
    output: mimeType.includes('png') ? 'png' : DEFAULT_IMAGE_FORMAT,
    quality: compress,
    returnableOutputType: isBase64Output ? 'base64' : 'uri',
    downloadProgress: (_) => {}, // always triggered in auto mode when we pass image url from server
  })

  if (isBase64Output) {
    return `data:image/${mimeType};base64,${compressedImage}`
  }

  return compressedImage
}
