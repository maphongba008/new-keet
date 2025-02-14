import { ImagePickerAsset } from 'expo-image-picker'
import { PastedFile } from '@mattermost/react-native-paste-input'

import { getImageSizeAsync } from 'lib/KeetVideoUtilsModule'

import { OnSendFiles, processAndSendAssets } from './processAndSendAssets'
import { setPendingUploadsAmount } from '../uploads'

export const pasteImageFromClipboard = async (
  roomId: string,
  files: Array<PastedFile>,
  onSendFiles: OnSendFiles,
) => {
  try {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    const imageAssetsPromises = imageFiles.map(async (file) => {
      const dimensions = await getImageSizeAsync(file.uri)
      return {
        uri: file.uri,
        assetId: file.uri,
        fileName: file.fileName || 'pasted-image.png',
        fileSize: file.fileSize,
        type: file.type,
        width: dimensions?.width,
        height: dimensions?.height,
        duration: undefined,
        base64: undefined,
        exif: undefined,
        canceled: false,
      } as ImagePickerAsset
    })

    const imageAssets = await Promise.all(imageAssetsPromises)
    if (imageAssets.length === 0) return

    await processAndSendAssets(roomId, imageAssets, onSendFiles)
  } catch (err: any) {
    setPendingUploadsAmount(0)
    throw new Error(err.message)
  }
}
