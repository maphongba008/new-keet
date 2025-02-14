import { ReactRenderer } from 'marked-react'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  cancelSyncDevice,
  confirmSyncDevice,
  getSyncDeviceRequest,
  getSyncDeviceSeedId,
  getSyncDeviceWaitingApprove,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import Device from 'component/Device'
import { Loading } from 'component/Loading'
import { mdRenderer as defaultRenderer, MarkDown } from 'component/MarkDown'
import { BackButton, NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_18,
} from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'

import { useStrings } from 'i18n/strings'

import { PAGES } from './IdentitySync.helpers'
import IdentitySyncInput from './IdentitySync.input'
import SyncDeviceQR from './IdentitySync.qr'

const IdentitySyncSearching = memo(
  ({ onChangeFormMode }: { onChangeFormMode: (value: PAGES) => void }) => {
    const strings = useStrings()

    const [requesting, setRequesting] = useState(false)

    const dispatch = useDispatch()
    const syncRequest: { roomId: string; seedId: string } =
      useSelector(getSyncDeviceRequest)
    const loading = !syncRequest

    const syncDevice = useMemo(
      () => ({ deviceId: syncRequest.roomId }),
      [syncRequest?.roomId],
    )

    const styles = getStyles()

    const onPressBack = useCallback(() => {
      onChangeFormMode(PAGES.camera)
      return true
    }, [onChangeFormMode])
    useFocusedBackHandler(onPressBack)

    const onConfirm = useCallback(() => {
      setRequesting(true)
      dispatch(confirmSyncDevice())
    }, [dispatch])

    const onPressNotMyDevice = useCallback(
      () => dispatch(cancelSyncDevice(syncRequest?.seedId)),
      [dispatch, syncRequest?.seedId],
    )

    return (
      <>
        <NavBar
          title={null}
          left={<BackButton overrideOnPress={onPressBack} />}
          middle={<ThreeDotsIndicator currentIndex={2} />}
        />
        <View style={styles.root}>
          <Text style={styles.title}>
            {strings.syncDevice.searching.accountInvite}
          </Text>
          <Text style={styles.text}>
            {strings.syncDevice.searching.checkIsCorrectDevice}
          </Text>
          {loading && (
            <View style={s.centeredLayout}>
              <Loading />
            </View>
          )}
          {!loading && (
            <>
              <Device
                device={syncDevice}
                title={strings.syncDevice.searching.requestDevice}
              />
            </>
          )}
          <View style={s.container} />
          <TextButton
            text={
              requesting
                ? strings.common.loading
                : strings.syncDevice.searching.confirmAction
            }
            onPress={onConfirm}
            type={TextButtonType.primary}
            disabled={loading || requesting}
            {...appiumTestProps(
              APPIUM_IDs.identity_sync_invite_request_confirm,
            )}
          />
          <TextButton
            text={strings.syncDevice.modal.notMyDevice}
            onPress={onPressNotMyDevice}
            type={TextButtonType.secondary}
            disabled={loading}
            style={styles.notMyDeviceBtn}
            {...appiumTestProps(
              APPIUM_IDs.identity_sync_invite_request_notMyDevice,
            )}
          />
        </View>
      </>
    )
  },
)

const DeviceSyncSyncing = memo(
  ({ onChangeFormMode }: { onChangeFormMode: (value: PAGES) => void }) => {
    const strings = useStrings()
    const styles = getStyles()

    const syncRequest: any = useSelector(getSyncDeviceRequest)
    const loading = !syncRequest?.deviceId

    const syncDevice = useMemo(
      () => ({ deviceId: syncRequest?.deviceId }),
      [syncRequest?.deviceId],
    )

    const onPressBack = useCallback(() => {
      onChangeFormMode(PAGES.camera)
      return true
    }, [onChangeFormMode])
    useFocusedBackHandler(onPressBack)

    const mdRenderer = useMemo(
      (): Partial<ReactRenderer> => ({
        ...defaultRenderer,
        // eslint-disable-next-line react/no-unstable-nested-components
        text(text: string) {
          return (
            <Text style={styles.textMD} key={`${this.elementId}`}>
              {text}
            </Text>
          )
        },
      }),
      [styles.textMD],
    )
    const renderer = useCallback(() => mdRenderer, [mdRenderer])

    return (
      <>
        <NavBar
          title={null}
          left={<BackButton overrideOnPress={onPressBack} />}
          middle={<ThreeDotsIndicator currentIndex={1} />}
        />
        <View style={styles.root}>
          <Text style={styles.title}>
            {strings.syncDevice.syncing.waitingForRequest}
          </Text>
          <MarkDown
            md={strings.syncDevice.syncing.openDeviceToProceed}
            renderer={renderer}
            style={styles.textMDContainer}
          />
          <Text style={styles.text}>
            {strings.syncDevice.syncing.doubleCheck}
          </Text>
          {!loading && (
            <Device
              device={syncDevice}
              title={strings.syncDevice.syncing.asked}
            />
          )}
        </View>
      </>
    )
  },
)

const IdentitySyncForm = memo(
  ({
    formMode,
    onChangeFormMode,
  }: {
    formMode: PAGES
    onChangeFormMode: (value: PAGES) => void
  }) => {
    const waitingApprove = useSelector(getSyncDeviceWaitingApprove)
    const seedId = useSelector(getSyncDeviceSeedId)

    if (waitingApprove) {
      return <DeviceSyncSyncing onChangeFormMode={onChangeFormMode} />
    }

    if (seedId) {
      return <IdentitySyncSearching onChangeFormMode={onChangeFormMode} />
    }

    if (formMode === PAGES.camera) {
      return <SyncDeviceQR onChangeFormMode={onChangeFormMode} />
    }

    return <IdentitySyncInput onChangeFormMode={onChangeFormMode} />
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    notMyDeviceBtn: {
      marginTop: UI_SIZE_16,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
      color: theme.color.grey_100,
      marginTop: UI_SIZE_16,
    },
    textMD: {
      color: theme.color.grey_100,
      fontSize: UI_SIZE_16,
    },
    textMDContainer: {
      marginBottom: UI_SIZE_8,
      marginTop: UI_SIZE_16,
    },
    title: {
      ...theme.text.title,
      fontSize: UI_SIZE_18,
    },
  })
  return styles
})

export default IdentitySyncForm
