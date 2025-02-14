import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import {
  cancelSyncDevice,
  getIdentityDevices,
  getSyncDeviceRequest,
  getSyncDeviceSeedId,
  getSyncDeviceWaitingApprove,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import Device from 'component/Device'
import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { navigate, SCREEN_IDENTITY_BACKUP_COMPLETE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

interface IdentityDeviceProps {
  confirmed: boolean
  current: boolean
  deviceId: string
  name: string
  type: string
}

type syncRequest = {
  status: string
}

const IdentityBackupDevice = memo(() => {
  const strings = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()

  const devices: Array<IdentityDeviceProps> = useSelector(getIdentityDevices)
  const seedId = useSelector(getSyncDeviceSeedId)
  const waitingApprove = useSelector(getSyncDeviceWaitingApprove)
  const syncRequest: syncRequest = useSelector(getSyncDeviceRequest)

  const shouldCleanup = useMemo(
    () =>
      Boolean(waitingApprove || seedId) &&
      syncRequest?.status !== 'confirm-sync',
    [seedId, syncRequest, waitingApprove],
  )

  const onClickSubmit = useCallback(
    () => navigate(SCREEN_IDENTITY_BACKUP_COMPLETE),
    [],
  )

  const thisDevice = useMemo(
    () => devices.find((device) => device.current),
    [devices],
  )

  useFocusEffect(
    useCallback(() => {
      if (shouldCleanup) {
        dispatch(cancelSyncDevice(seedId))
      }
    }, [dispatch, seedId, shouldCleanup]),
  )

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title="" middle={<ThreeDotsIndicator currentIndex={2} />} />
      <View style={styles.root}>
        <Text style={styles.title}>
          {strings.myDevices.renameDeviceOnboarding}
        </Text>
        <Text style={styles.description}>
          {strings.myDevices.renameDeviceDescriptionOnboarding}
        </Text>
        <Device device={thisDevice} title={strings.myDevices.thisDevice} />
        <View style={s.container} />
        <TextButton
          text={strings.syncDevice.continue}
          type={TextButtonType.primary}
          onPress={onClickSubmit}
        />
      </View>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    description: {
      ...theme.text.body,
      color: theme.color.grey_100,
      marginVertical: UI_SIZE_16,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    title: {
      ...theme.text.title,
    },
  })
  return styles
})

export default IdentityBackupDevice
