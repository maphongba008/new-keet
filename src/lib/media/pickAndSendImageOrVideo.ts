import * as EXImagePicker from 'expo-image-picker'

import { ensureExpoCameraPermissions } from './ensureExpoCameraPermissions'
import { ensureGalleryPermissions } from './ensureGalleryPermissions'
import { OnSendFiles, processAndSendAssets } from './processAndSendAssets'
import { MAX_SHARE_COUNT } from '../constants'
import { setPendingUploadsAmount } from '../uploads'

type ImagePickerAsset = EXImagePicker.ImagePickerAsset & {
  // available on android: node_modules/expo-image-picker/android/src/main/java/expo/modules/imagepicker/ImagePickerResponse.kt
  rotation?: number
}

type ImagePickerResult =
  | {
      canceled: false
      assets: ImagePickerAsset[]
    }
  | EXImagePicker.ImagePickerCanceledResult

export const pickAndSendImageOrVideo = async (opts: {
  roomId: string
  fromCamera?: boolean
  video?: boolean
  onSendFiles: OnSendFiles
}) => {
  try {
    if (opts?.fromCamera) {
      await ensureExpoCameraPermissions({ isOverrideDefaultPermission: false })
    } else {
      await ensureGalleryPermissions()
    }

    const launchFromCameraOrLibrary = opts?.fromCamera
      ? EXImagePicker.launchCameraAsync
      : EXImagePicker.launchImageLibraryAsync

    const res: ImagePickerResult = await launchFromCameraOrLibrary({
      mediaTypes: opts?.video ? 'videos' : ['images', 'videos', 'livePhotos'],
      allowsMultipleSelection: !opts?.fromCamera,
      selectionLimit: MAX_SHARE_COUNT,
      exif: true,
    })

    if (!res || !res.assets) {
      return
    }

    await processAndSendAssets(opts.roomId, res.assets, opts?.onSendFiles)
  } catch (err: any) {
    setPendingUploadsAmount(0)
    throw new Error(err.message)
  }
}
