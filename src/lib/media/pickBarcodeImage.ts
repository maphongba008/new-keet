import { Camera as ExpoCamera } from 'expo-camera'
import * as EXImagePicker from 'expo-image-picker'

import { getStrings } from 'i18n/strings'

import { ensureGalleryPermissions } from './ensureGalleryPermissions'

interface PickBarcodeImageResult {
  didCancel: boolean
  qrCode?: string
}

export const pickBarcodeImage = async (): Promise<PickBarcodeImageResult> => {
  await ensureGalleryPermissions()
  const res = await EXImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsMultipleSelection: false,
  })
  if (res.canceled) {
    return { didCancel: true }
  }

  const asset = res?.assets?.[0]
  if (asset == null || asset.uri == null) {
    return { didCancel: false }
  }

  const scannedBarCodes = await ExpoCamera.scanFromURLAsync(asset?.uri)
  const data = scannedBarCodes?.[0]?.data

  if (data) {
    return { didCancel: false, qrCode: data }
  }

  const strings = getStrings()
  throw new Error(strings.cameraQrScan.noQrFound)
}
