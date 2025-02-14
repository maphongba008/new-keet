import React, { memo, useCallback, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import {
  cancelSyncDevice,
  getIdentityDevices,
  getIsIdentityAnonymous,
  getIsIdentityComplete,
  getSyncDeviceRequest,
  getSyncDeviceSeedId,
  getSyncDeviceWaitingApprove,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import Device from 'component/Device'
import GestureContainer from 'component/GestureContainer'
import IdentitySyncOrBackup from 'component/IdentitySyncOrBackup'
import { KeetLoading } from 'component/Loading'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_12, UI_SIZE_16, UI_SIZE_48 } from 'lib/commonStyles'
import { navigate, SCREEN_IDENTITY_DEVICE_ADD } from 'lib/navigation'

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

const MyDevices = memo(() => {
  const strings = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()

  const isIdentityComplete = useSelector(getIsIdentityComplete)
  const isIdentityAnonymous = useSelector(getIsIdentityAnonymous)
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

  const onPressAddDevice = useCallback(
    () => navigate(SCREEN_IDENTITY_DEVICE_ADD),
    [],
  )

  const [thisDevice, linkedDevices]: [
    null | IdentityDeviceProps,
    Array<IdentityDeviceProps>,
  ] = useMemo(
    () =>
      devices.reduce(
        (
          acc: [null | IdentityDeviceProps, Array<IdentityDeviceProps>],
          device,
        ) => {
          device.current ? (acc[0] = device) : acc[1].push(device)
          return acc
        },
        [null, []],
      ),
    [devices],
  )

  useFocusEffect(
    useCallback(() => {
      if (shouldCleanup) {
        dispatch(cancelSyncDevice(seedId))
      }
    }, [dispatch, seedId, shouldCleanup]),
  )

  if (isIdentityAnonymous) {
    return (
      <>
        <ScreenSystemBars />
        <IdentitySyncOrBackup />
      </>
    )
  }

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.account.myDevices} />
      <ScrollView style={styles.root}>
        {isIdentityComplete ? (
          <>
            <Device device={thisDevice} title={strings.myDevices.thisDevice} />
            {linkedDevices.length > 0 && (
              <>
                {linkedDevices.map((device, index) => (
                  <Device
                    key={device.deviceId}
                    device={device}
                    hideTitle={index > 0}
                    title={
                      linkedDevices.length > 1
                        ? strings.myDevices.linkedDevices
                        : strings.myDevices.linkedDevice
                    }
                    style={styles.device}
                  />
                ))}
              </>
            )}
            <TextButton
              text={strings.myDevices.addDevice}
              onPress={onPressAddDevice}
              type={TextButtonType.primaryTransparentBg}
              style={styles.actionBtn}
            />
          </>
        ) : (
          <View style={s.centeredLayout}>
            <KeetLoading />
          </View>
        )}
      </ScrollView>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      height: UI_SIZE_48,
      marginVertical: UI_SIZE_16,
      paddingVertical: 0,
    },
    device: {
      marginBottom: UI_SIZE_12,
    },
    root: {
      padding: theme.spacing.standard,
    },
  })
  return styles
})

export default MyDevices
