import * as DocumentPicker from 'expo-document-picker'
import * as EXImagePicker from 'expo-image-picker'

import { getStrings } from 'i18n/strings'

import { parseAsset } from './parseAsset'
import { MAX_SHARE_COUNT } from '../constants'
import { showInfoNotifier } from '../hud'
import { SendFilesInfo } from '../types'
import { allowMoreUploads, setPendingUploadsAmount } from '../uploads'

type ImagePickerAsset = EXImagePicker.ImagePickerAsset & {
  // available on android: node_modules/expo-image-picker/android/src/main/java/expo/modules/imagepicker/ImagePickerResponse.kt
  rotation?: number
}

export type OnSendFiles = (file: SendFilesInfo) => void

export const processAndSendAssets = async (
  roomId: string,
  assets: DocumentPicker.DocumentPickerAsset[] | ImagePickerAsset[],
  onSend?: OnSendFiles,
  fromDocumentPicker = false,
) => {
  for (let i = 0; i < assets.length; i++) {
    if (i >= MAX_SHARE_COUNT || !allowMoreUploads(roomId)) {
      const strings = getStrings()
      setPendingUploadsAmount(0)
      showInfoNotifier(strings.chat.fileLimitAmountReached)
      break
    }

    const asset = assets[i]
    const isImage = asset.mimeType?.startsWith('image/')
    const isVideo = asset.mimeType?.startsWith('video/')

    let assetInfo
    if ((isImage || isVideo) && !fromDocumentPicker) {
      // Regular image or video
      const mediaAsset = asset as ImagePickerAsset
      assetInfo = {
        fileName: mediaAsset.fileName!,
        byteLength: mediaAsset.fileSize,
        mimeType: asset.mimeType,
        uri: asset.uri,
      }
      // Avoid case where svg file width and height is -1 which results in CORE_ERROR exception
      if (mediaAsset.height > 0 && mediaAsset.width > 0) {
        const [width, height] =
          mediaAsset.rotation && [270, 90].includes(mediaAsset.rotation)
            ? [mediaAsset.height, mediaAsset.width]
            : [mediaAsset.width, mediaAsset.height]
        assetInfo = {
          ...assetInfo,
          width,
          height,
        }
      }
    } else {
      // Document picker
      const documentAsset = asset as DocumentPicker.DocumentPickerAsset
      assetInfo = {
        fileName: documentAsset.name,
        byteLength: documentAsset.size,
        mimeType: documentAsset.mimeType,
        uri: documentAsset.uri,
        isInsideAppCache: true,
      }
    }

    const parsedAsset = await parseAsset(assetInfo)

    if (!parsedAsset) {
      continue
    }

    onSend?.(parsedAsset)
  }
}
