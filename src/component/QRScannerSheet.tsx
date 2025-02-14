// Can't convert this to showBottomSheet({}) because
// This sheet is a child of RoomActionSheet, and onDismiss we need to go back to existing RoomActionSheet
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Keyboard, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'

import { height as deviceHeight } from 'lib/commonStyles'
import { consoleError } from 'lib/errors'
import { useTimeout } from 'lib/hooks'
import { showErrorNotifier } from 'lib/hud'
import { isRoomUrl } from 'lib/linking'
import { ensureExpoCameraPermissions, pickBarcodeImage } from 'lib/media'

import { useStrings } from 'i18n/strings'

import { BottomSheetBase, BtmSheetHeader } from './BottomSheetBase'
import { TextButton, TextButtonType } from './Button'
import { QRScannerView } from './QRScannerView'
import { useTheme } from './theme'

/**
 * Sanitize text from
 * "Join me in Keet pear://dev/yrb67d46" to
 * "pear://dev/yrb67d46"
 */
export const normalizeRoomUrl = (text: string) => {
  const match = text.match(/(pear[a-z]*:\/\/[^\s]+)/i)
  return match ? match[0] : text
}

export const containsRoomUrl = (text: string) =>
  isRoomUrl(normalizeRoomUrl(text))
export const isValidRoomName = (text: string) => text.trim().length > 0

const isValidQR = (value: string) => {
  return containsRoomUrl(value)
}

interface QRScannerSheetInterface {
  setText: (text: string) => void | React.Dispatch<React.SetStateAction<string>>
  isSeedPhrase?: boolean
}
const QRScannerSheet = forwardRef(
  ({ setText, isSeedPhrase = false }: QRScannerSheetInterface, ref) => {
    const theme = useTheme()
    const strings = useStrings()

    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const { top, bottom } = useSafeAreaInsets()
    const sheetHeight = deviceHeight - top - bottom

    const [scanEnabled, setScanEnabled] = useState(true)
    const [cameraPermission, setCameraPermission] = useState(false)

    const presentSheet = useCallback(async () => {
      bottomSheetRef.current?.present()
      Keyboard.dismiss()
      setScanEnabled(true)
      try {
        await ensureExpoCameraPermissions({
          isOverrideDefaultPermission: true,
        })
        setCameraPermission(true)
      } catch (e) {}
    }, [])

    // When user open sheet -> scan & auto dismiss -> open sheet -> scan & auto dismiss, (fast & repeatedly), eventually will cause sheet unable to dismiss.
    // https://app.asana.com/0/0/1206035056294640/1206120043620290/f
    // Here we add a cooldown
    const closeSheetWithDelay = useTimeout(
      () => bottomSheetRef.current?.dismiss({ duration: theme.animation.ms }),
      500,
    )

    const setScanEnabledWithDelay = useTimeout(() => setScanEnabled(true), 2000)

    useImperativeHandle(
      ref,
      () => ({
        presentSheet,
      }),
      [presentSheet],
    )

    const onPickImage = useCallback(async () => {
      try {
        const pickedInput = await pickBarcodeImage()

        if (pickedInput.didCancel) {
          return
        }

        const res = pickedInput.qrCode ?? ''

        if (!isValidQR(res)) {
          return showErrorNotifier(strings.cameraQrScan.invalidQr, false)
        }
        closeSheetWithDelay()
        setText(res)
      } catch (e) {
        showErrorNotifier((e as Error)?.message)
        consoleError(e)
      }
    }, [closeSheetWithDelay, setText, strings.cameraQrScan.invalidQr])

    const onBarCodeScanned = useCallback(
      (value: any) => {
        if (scanEnabled) {
          setScanEnabled(false) // Pause scanning & process result
          if (!isValidQR(value?.data)) {
            // Show error msg for 2sec for user to see, after that re-enable scanning.
            setScanEnabledWithDelay()
            return showErrorNotifier(strings.cameraQrScan.invalidQr, false)
          }
          closeSheetWithDelay()
          setText(value.data)
        }
      },
      [
        closeSheetWithDelay,
        scanEnabled,
        setText,
        strings.cameraQrScan.invalidQr,
        setScanEnabledWithDelay,
      ],
    )

    return (
      <BottomSheetBase
        sheetRef={bottomSheetRef}
        backdropPressBehaviour="none"
        enablePanDownToClose
      >
        <View
          style={
            cameraPermission && {
              height: (sheetHeight * 3) / 4,
            }
          }
        >
          <BtmSheetHeader
            title={
              cameraPermission
                ? isSeedPhrase
                  ? strings.lobby.roomActions.roomSeedPhraseQR.title
                  : strings.lobby.roomActions.joinActionQr.title
                : strings.common.permissionRequired
            }
            onClose={closeSheetWithDelay}
          />
          <QRScannerView
            onBarCodeScanned={onBarCodeScanned}
            cameraPermission={cameraPermission}
          />
          <TextButton
            text={strings.cameraQrScan.chooseImage}
            onPress={onPickImage}
            type={TextButtonType.gray}
          />
        </View>
      </BottomSheetBase>
    )
  },
)

export default QRScannerSheet
