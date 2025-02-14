import * as FileSystem from 'expo-file-system'

import { getUploadsDir } from './getUploadsDir'
import { consoleError } from '../errors'
import { getEncodedLocalUri, getFileName } from '../fs'
import { showErrorNotifier } from '../hud'
import { getMediaSizeAsync, getMimeTypeAsync } from '../KeetVideoUtilsModule'
import { SendFilesInfo } from '../types'

interface ParseAssetParams {
  fileName?: string
  uri?: string
  width?: number
  height?: number
  mimeType?: string
  byteLength?: number
  isInsideAppCache?: boolean
}

export const parseAsset = async (
  asset: ParseAssetParams,
): Promise<SendFilesInfo | null> => {
  try {
    if (!asset || !asset.uri) {
      return null
    }

    const {
      uri: originUri,
      mimeType = await getMimeTypeAsync(originUri),
      fileName = getFileName(originUri),
      byteLength,
      height,
      width,
    } = asset

    const dimensions =
      width && height
        ? { height, width }
        : await getMediaSizeAsync(originUri, mimeType)

    let uri = originUri
    if (fileName && !uri.endsWith(fileName)) {
      const uploadsDir = getUploadsDir()
      const readResult = await FileSystem.getInfoAsync(uploadsDir, {})

      if (!readResult.exists) {
        await FileSystem.makeDirectoryAsync(uploadsDir)
      }

      uri = getEncodedLocalUri(uploadsDir, fileName)
      await FileSystem[asset.isInsideAppCache ? 'moveAsync' : 'copyAsync']({
        from: originUri,
        to: uri,
      })
    }

    if (!mimeType) {
      throw new Error('handleAsset::can`t recognize asset mimeType')
    }

    const result: SendFilesInfo = {
      uri,
      type: mimeType,
      name: fileName,
      byteLength: byteLength ?? 0,
    }

    if (dimensions) {
      result.dimensions = dimensions
    }

    return result
  } catch (err) {
    showErrorNotifier((err as Error).message)
    consoleError(err)
  }
  return null
}
