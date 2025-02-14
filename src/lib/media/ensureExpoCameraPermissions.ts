import { Camera as ExpoCamera } from 'expo-camera'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { NO_PERMISSION } from 'lib/constants'

import { getStrings } from 'i18n/strings'

export const ensureExpoCameraPermissions = async ({
  isOverrideDefaultPermission,
  throwOnNoPermissions = false,
}: {
  isOverrideDefaultPermission: boolean
  throwOnNoPermissions?: boolean
}) => {
  if (!(await ExpoCamera.getCameraPermissionsAsync()).granted) {
    if (!(await ExpoCamera.requestCameraPermissionsAsync()).granted) {
      if (!isOverrideDefaultPermission) {
        const strings = getStrings()
        showBottomSheet({
          bottomSheetType: BottomSheetEnum.PermissionRequired,
          title: strings.common.cameraPermissionRequired,
          close: () => closeBottomSheet(),
        })
        if (throwOnNoPermissions) {
          throw new Error(NO_PERMISSION)
        }
        return
      }
      throw new Error()
    }
  }
}
