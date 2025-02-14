import * as EXImageManipulator from 'expo-image-manipulator'
import * as EXImagePicker from 'expo-image-picker'

import { ICON_SIZE_112, ICON_SIZE_512 } from 'lib/commonStyles'
import { NO_PERMISSION } from 'lib/constants'

import { ensureExpoCameraPermissions } from './ensureExpoCameraPermissions'
import { ensureGalleryPermissions } from './ensureGalleryPermissions'
import { consoleError } from '../errors'
import { showErrorNotifier } from '../hud'

type UpdateAvatarFunction = (
  base64: string,
  metadata: { width: number; height: number; size: number; path: string },
) => void

export const pickAndSetAvatar = async (
  opts: { fromCamera: boolean },
  updateAvatar: UpdateAvatarFunction,
  large?: boolean,
) => {
  try {
    const size = large ? ICON_SIZE_512 : ICON_SIZE_112
    if (opts.fromCamera) {
      await ensureExpoCameraPermissions({
        isOverrideDefaultPermission: false,
        throwOnNoPermissions: true,
      })
    } else {
      await ensureGalleryPermissions()
    }
    const launchFromCameraOrLibrary = opts?.fromCamera
      ? EXImagePicker.launchCameraAsync
      : EXImagePicker.launchImageLibraryAsync

    const res = await launchFromCameraOrLibrary({
      allowsEditing: true,
      aspect: [size, size],
      mediaTypes: 'images',
    })
    if (res.canceled) {
      return
    }
    const { uri, fileSize } = res.assets[0]
    const context = EXImageManipulator.ImageManipulator.manipulate(uri)
    context.resize({ width: size, height: size })
    const imgRef = await context.renderAsync()
    const imageResult = await imgRef.saveAsync({
      compress: 0.8,
      format: EXImageManipulator.SaveFormat.JPEG,
      base64: true,
    })
    const { base64, width, height } = imageResult
    if (!base64) return
    updateAvatar(base64, { width, height, size: fileSize!, path: uri })
  } catch (err: any) {
    if (err.message?.includes(NO_PERMISSION)) {
      // This is not an error, handle it silently
      return
    }

    consoleError(err)

    if (err.message) {
      showErrorNotifier(err.message)
    }
  }
}
