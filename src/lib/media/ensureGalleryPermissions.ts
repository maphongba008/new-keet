import * as MediaLibrary from 'expo-media-library'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'

import { getStrings } from 'i18n/strings'

import {
  GALLERY_GRANULAR_PERMISSION,
  GALLERY_WRITE_ONLY_MEDIA,
  NO_PERMISSION,
} from '../constants'

export const ensureGalleryPermissions = async () => {
  const permissionResponse = await MediaLibrary.requestPermissionsAsync(
    GALLERY_WRITE_ONLY_MEDIA,
    GALLERY_GRANULAR_PERMISSION,
  )
  if (!permissionResponse.granted) {
    const strings = getStrings()
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.PermissionRequired,
      title: strings.common.imgPermissionRequired,
      close: () => closeBottomSheet(),
    })
    throw new Error(NO_PERMISSION)
  }
}
