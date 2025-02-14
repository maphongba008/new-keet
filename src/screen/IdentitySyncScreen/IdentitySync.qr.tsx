import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  getSyncDeviceErrorMsg,
  setSyncDeviceAgreement,
  setSyncDeviceErrorMsg,
  submitSyncIdentity,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import { BackButton, NavBar } from 'component/NavBar'
import QRScannerSheet from 'component/QRScannerSheet'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  TRANSPARENT,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'
import { showErrorNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

import { PAGES } from './IdentitySync.helpers'

type qrBottomSheetRef = {
  presentSheet: () => void
  closeSheet: () => void
}
const IdentitySyncQR = ({
  onChangeFormMode,
}: {
  onChangeFormMode: (value: PAGES) => void
}) => {
  const styles = getStyles()
  const strings = useStrings()
  const [qrValue, setQRValue] = useState<string>('')
  const qrBottomSheetRef = useRef<qrBottomSheetRef>(null)

  const dispatch = useDispatch()
  const errorMsg: any = useSelector(getSyncDeviceErrorMsg)
  const onPressScanQR = useCallback(
    () => qrBottomSheetRef.current?.presentSheet(),
    [],
  )

  useEffect(() => {
    if (qrValue) {
      dispatch(submitSyncIdentity(qrValue))
    }
  }, [dispatch, qrValue])

  useEffect(() => {
    if (errorMsg.length > 0) {
      showErrorNotifier(strings.syncDevice.syncDeviceOpts.qrError, false)
      dispatch(setSyncDeviceErrorMsg(''))
    }
  }, [dispatch, errorMsg, strings.syncDevice.syncDeviceOpts.qrError])

  const onPressBack = useCallback(() => {
    dispatch(setSyncDeviceAgreement(false))
    return true
  }, [dispatch])
  useFocusedBackHandler(onPressBack)

  const changeFormModeToInput = useCallback(
    () => onChangeFormMode(PAGES.input),
    [onChangeFormMode],
  )

  return (
    <>
      <NavBar
        title={strings.syncDevice.syncDeviceOpts.title}
        left={<BackButton overrideOnPress={onPressBack} />}
      />
      <View style={styles.root}>
        <Text style={styles.text}>
          {strings.syncDevice.syncDeviceOpts.cameraScan}
        </Text>
        <TextButton
          text={strings.syncDevice.syncDeviceOpts.cameraAction}
          onPress={onPressScanQR}
          type={TextButtonType.primaryOutline}
          style={styles.actionBtn}
          {...appiumTestProps(APPIUM_IDs.identity_btn_use_camera_action)}
        />
        <Text style={styles.separatorText}>
          {strings.syncDevice.syncDeviceOpts.separator}
        </Text>
        <Text style={styles.text}>
          {strings.syncDevice.syncDeviceOpts.inputScan}
        </Text>
        <TextButton
          text={strings.syncDevice.syncDeviceOpts.inputAction}
          onPress={changeFormModeToInput}
          type={TextButtonType.primaryOutline}
          style={styles.actionBtn}
          {...appiumTestProps(APPIUM_IDs.identity_btn_use_invite_link)}
        />
        <QRScannerSheet
          ref={qrBottomSheetRef}
          setText={setQRValue}
          isSeedPhrase
        />
      </View>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      backgroundColor: TRANSPARENT,
      borderColor: theme.color.blue_900,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    separatorText: {
      ...theme.text.bodySemiBold,
      ...s.textAlignCenter,
      marginVertical: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
      ...s.textAlignCenter,
      color: theme.color.grey_100,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_8,
    },
  })
  return styles
})

export default memo(IdentitySyncQR)
