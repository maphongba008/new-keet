import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ButtonBase } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { QRScannerView } from 'component/QRScannerView'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  BORDER_SEPARATOR_COLOR,
  UI_SIZE_20,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { ensureExpoCameraPermissions } from 'lib/media'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

function WalletScannerView() {
  const styles = getStyles()
  const {
    wallet: { send: strings },
  } = useStrings()
  const [cameraPermission, setCameraPermission] = useState(false)

  const requestPermission = useCallback(async () => {
    try {
      await ensureExpoCameraPermissions({
        isOverrideDefaultPermission: true,
      })
      setCameraPermission(true)
    } catch (e) {}
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const handleBack = useCallback(() => back(), [])

  const onBarCodeScanned = useCallback(() => {
    // TODO: implement onScan
  }, [])

  return (
    <>
      <NavBar
        title=""
        right={
          <ButtonBase {...appiumTestProps(APPIUM_IDs.wallet_send_scanner_btn)}>
            <SvgIcon name="bolt" width={UI_SIZE_24} height={UI_SIZE_24} />
          </ButtonBase>
        }
        left={
          <ButtonBase
            onPress={handleBack}
            {...appiumTestProps(APPIUM_IDs.wallet_send_scanner_back_btn)}
          >
            <SvgIcon name="close" width={UI_SIZE_24} height={UI_SIZE_24} />
          </ButtonBase>
        }
        middle={<Text style={styles.title}>{strings.scanCode}</Text>}
        style={styles.navbar}
      />
      <SafeAreaView style={s.container} edges={['left', 'right']}>
        <QRScannerView
          styleProp={styles.scannerView}
          onBarCodeScanned={onBarCodeScanned}
          cameraPermission={cameraPermission}
        />
      </SafeAreaView>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    navbar: { backgroundColor: BORDER_SEPARATOR_COLOR },
    scannerView: {
      backgroundColor: BORDER_SEPARATOR_COLOR,
    },
    title: {
      ...theme.text.bodySemiBold,
      ...s.textAlignCenter,
      fontSize: UI_SIZE_20,
    },
  })
  return styles
})

export default WalletScannerView
