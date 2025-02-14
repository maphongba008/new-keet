import { ImageSize } from 'react-native'

import { getFileSize } from 'lib/fileManager'
import { getMediaType, getPathFromUri } from 'lib/fs'
import { SendFilesInfo } from 'lib/types'
import { UploadFile } from 'lib/uploads'

import { getAudioMetaData } from './getAudioMetaData'
import { getImageMetaData } from './getImageMetaData'
import { getIsValidDimensions } from './getIsValidDimensions'
import { getSvgMetaData } from './getSvgMetaData'
import { getVideoMetaData } from './getVideoMetaData'

export const getUploadFile = async ({
  uri,
  type,
  name,
  byteLength,
  dimensions,
}: SendFilesInfo) => {
  const { isImage, isVideo, isAudio, isSVG } = getMediaType(uri, type)

  const file: UploadFile = {
    id: name ? `${name}-${Date.now()}` : `${Date.now()}`,
    path: getPathFromUri(uri),
    type,
    byteLength: byteLength || (await getFileSize(uri)) || 0,
    isLinkPreview: false,
  }

  if ((isImage || isVideo) && getIsValidDimensions(dimensions))
    file.dimensions = dimensions as ImageSize

  if (isSVG) Object.assign(file, await getSvgMetaData(uri, file))
  else if (isImage) Object.assign(file, await getImageMetaData(uri, file))
  else if (isVideo) Object.assign(file, await getVideoMetaData(uri, file))
  else if (isAudio) Object.assign(file, await getAudioMetaData(uri))

  return file
}
