import React, { useCallback } from 'react'
import { Linking, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { CameraView as Camera, CameraType } from 'expo-camera'

import { useStrings } from 'i18n/strings'

import { TextButton } from './Button'
import { createThemedStylesheet } from './theme'

interface QRScannerViewInterface {
  onBarCodeScanned: (value: any) => void
  cameraPermission: boolean
  styleProp?: ViewStyle
}

const CameraView = ({
  onBarCodeScanned,
  styleProp,
}: Partial<QRScannerViewInterface>) => {
  const styles = getStyles()
  const cameraFacing: CameraType = 'back'

  return (
    <View style={[styles.cameraContainer, styleProp]}>
      <Camera
        autofocus={'on'}
        style={[styles.camera, styleProp]}
        facing={cameraFacing}
        onBarcodeScanned={onBarCodeScanned}
      />
      <View style={styles.viewFinderOverlayContainer}>
        <View style={styles.viewFinder} />
      </View>
    </View>
  )
}

const NoCameraAccess = () => {
  const strings = useStrings()
  const styles = getStyles()
  return (
    <View style={styles.noCameraContainer}>
      <Text style={styles.noCameraDesc}>{strings.common.enablePermission}</Text>
    </View>
  )
}

export const QRScannerView = React.memo(
  ({
    onBarCodeScanned,
    cameraPermission,
    styleProp,
  }: QRScannerViewInterface) => {
    const styles = getStyles()
    const strings = useStrings()

    const openSetting = useCallback(() => {
      Linking.openSettings()
    }, [])

    if (cameraPermission) {
      return (
        <CameraView onBarCodeScanned={onBarCodeScanned} styleProp={styleProp} />
      )
    } else {
      return (
        <>
          <NoCameraAccess />
          <TextButton
            style={styles.settingsButton}
            text={strings.common.openSettings}
            onPress={openSetting}
          />
        </>
      )
    }
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    camera: {
      flex: 1,
      height: '100%',
      marginBottom: theme.spacing.standard,
      width: '100%',
    },
    cameraContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    noCameraContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.standard,
    },
    noCameraDesc: {
      ...theme.text.body,
      marginBottom: theme.spacing.standard,
    },
    settingsButton: {
      marginBottom: theme.spacing.standard,
    },

    viewFinder: {
      borderColor: theme.color.blue_400,
      borderRadius: 24,
      borderWidth: 6,
      height: 216,
      width: 216,
    },
    viewFinderOverlayContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
  })
  return styles
})
