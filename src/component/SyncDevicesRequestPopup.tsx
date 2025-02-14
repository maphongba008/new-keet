import React, { memo, useCallback, useEffect } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  approveIdentityInvitedDevice,
  getIdentityInvitedDevices,
  rejectIdentityInvitedDevice,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_12 } from 'lib/commonStyles'
import { back, navigationRef, SCREEN_IDENTITY_DEVICE_ADD } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { CloseButton } from './CloseButton'
import Device from './Device'

const SyncDevicesRequestPopup = memo(() => {
  const styles = getStyles()
  const strings = useStrings()

  const dispatch = useDispatch()
  const devices: Array<any> = useSelector(getIdentityInvitedDevices)
  const { top: safeTop } = useSafeAreaInsets()

  const device = devices[devices.length - 1]

  useEffect(() => {
    if (!device) return
    const route = navigationRef.getCurrentRoute()
    if (route?.name === SCREEN_IDENTITY_DEVICE_ADD) {
      back()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, navigationRef])

  const onPressReject = useCallback(
    () => dispatch(rejectIdentityInvitedDevice(device?.deviceId)),
    [device?.deviceId, dispatch],
  )

  const onPressApprove = useCallback(
    () => dispatch(approveIdentityInvitedDevice(device?.deviceId)),
    [device?.deviceId, dispatch],
  )

  if (!device) {
    return null
  }

  return (
    <Modal transparent visible>
      <View style={[styles.modalWrapper, { paddingTop: safeTop }]}>
        <View style={styles.container}>
          <CloseButton onPress={onPressReject} style={s.alignSelfEnd} />
          <Text style={styles.title}>{strings.syncDevice.modal.title}</Text>
          <Text style={styles.text}>{strings.syncDevice.modal.text1}</Text>
          <Text style={[styles.text, styles.spaceBottom]}>
            {strings.syncDevice.modal.text2}
          </Text>
          <Device
            device={device}
            title={strings.syncDevice.modal.requestFrom}
          />
          <View style={s.container} />
          <TextButton
            style={styles.button}
            onPress={onPressApprove}
            text={strings.syncDevice.modal.confirmSync}
            type={TextButtonType.primary}
          />
          <TextButton
            style={[styles.button, styles.noMarginBottom]}
            onPress={onPressReject}
            text={strings.syncDevice.modal.notMyDevice}
            type={TextButtonType.outline}
          />
        </View>
      </View>
    </Modal>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btnContainer: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_8,
      marginTop: UI_SIZE_12,
    },
    button: {
      borderRadius: theme.border.radiusLarge,
      marginBottom: UI_SIZE_12,
    },
    container: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    modalWrapper: {
      ...s.container,
      backgroundColor: theme.background.bg_2,
    },
    noMarginBottom: {
      marginBottom: 0,
    },
    spaceBottom: {
      marginBottom: UI_SIZE_12,
    },
    text: {
      ...theme.text.body,
      fontSize: 16,
      marginBottom: UI_SIZE_8,
    },
    title: {
      ...theme.text.bodyBold,
      fontSize: 20,
      marginBottom: UI_SIZE_12,
    },
  })
  return styles
})

export default SyncDevicesRequestPopup
