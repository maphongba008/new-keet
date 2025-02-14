import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { setTraceFunction } from 'hypertrace'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { NotifierWrapper } from 'react-native-notifier'
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import { enableFreeze } from 'react-native-screens'
import { useShallow } from 'zustand/react/shallow'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'

import { initEmojis } from '@holepunchto/emojis'
// @ts-ignore
import KeetCallClient from '@holepunchto/keet-call/client'
import { setBackend } from '@holepunchto/keet-store/backend'
import { getAppCurrentCallRoomId } from '@holepunchto/keet-store/store/app'
import { getRoomLeavingId } from '@holepunchto/keet-store/store/room'
import { initWebRTC } from '@holepunchto/webrtc'

import {
  getCollapseStats,
  getShowStats,
  mountNavigator,
  setStoreReady,
} from 'reducers/application'

import AppBottomSheet, {
  useAppBottomSheetStore,
} from 'component/AppBottomSheet/AppBottomSheet'
import CallAutoEndPopup from 'component/CallAutoEndPopup'
import RoomLeaveModal from 'component/RoomLeaveModal'
import Stats, { StatsToggleIcon } from 'component/Stats'
import SyncDevicesRequestPopup from 'component/SyncDevicesRequestPopup'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { DevConsole, setUpDevConsole } from 'screen/DevConsole'
import ErrorBoundary from 'screen/ErrorBoundary'
import PasscodeCheckScreen from 'screen/Passcode/PasscodeCheckScreen'
import { IS_SENTRY_ENABLED, SHOW_PASSCODE } from 'lib/build.constants'
import s from 'lib/commonStyles'
import { consoleError } from 'lib/errors'
import { AppStateProps, useAppState, useAppStore } from 'lib/hooks'
import { useAutoLock } from 'lib/hooks/useAppAutoLock'
import { StreamContext } from 'lib/hooks/useStream'
import { Keys, localStorage } from 'lib/localStorage'
import { navigationRef } from 'lib/navigation'
import { Notifications } from 'lib/notification'
import { setDefaultNotificationsStrings } from 'lib/push'
import { getKeetBackend, installKeetCore } from 'lib/rpc'
import { useScreenOrientationLock } from 'lib/screenOrientation'
import { initSentry, Sentry } from 'lib/sentry'
import { getDispatch } from 'lib/store'

import { useStrings } from 'i18n/strings'

import AppNavigation from './navigation/AppNavigation'
import { createKeetStore } from './store'

initEmojis({ emojisPath: '/resources/emojis/' })
initSentry()
enableFreeze(true)
setUpDevConsole()
initWebRTC()

type leaveBottomSheetRef = {
  closeSheet: () => void
}

const AppContainer = () => {
  const theme = useTheme()
  const { push } = useStrings()
  const dispatch = useDispatch()
  const isAuthenticated = useAppStore(
    useShallow((state: AppStateProps) => state.isAuthenticated),
  )
  const showStats = useSelector(getShowStats)
  const collapseStats = useSelector(getCollapseStats)
  const roomLeavingId = useSelector(getRoomLeavingId)
  const callRoomId = useSelector(getAppCurrentCallRoomId)
  const styles = getStyles()

  const leaveBottomSheetRef = useRef<leaveBottomSheetRef>(null)

  useAutoLock()
  useAppState()

  const showBottomSheet = useAppBottomSheetStore(
    (state) => state.showBottomSheet,
  )

  useEffect(() => {
    setDefaultNotificationsStrings(push)
  }, [push])

  const navigatorReady = useCallback(() => {
    dispatch(mountNavigator())
  }, [dispatch])

  useEffect(() => {
    if (!roomLeavingId) {
      leaveBottomSheetRef.current?.closeSheet()
    }
  }, [roomLeavingId])

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.background.bg_1,
          card: theme.background.bg_1,
        },
      }}
      ref={navigationRef}
      onReady={navigatorReady}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      {showStats && collapseStats && <Stats />}
      <AppNavigation />
      {showBottomSheet && <AppBottomSheet />}
      <SyncDevicesRequestPopup />
      {!!callRoomId && <CallAutoEndPopup />}
      {!isAuthenticated && SHOW_PASSCODE && (
        <View style={styles.fullscreenView}>
          <PasscodeCheckScreen />
        </View>
      )}
      {!!roomLeavingId && (
        <RoomLeaveModal roomId={roomLeavingId} ref={leaveBottomSheetRef} />
      )}
      {showStats && <StatsToggleIcon iconUp={collapseStats} />}
    </NavigationContainer>
  )
}

const App = IS_SENTRY_ENABLED ? Sentry.wrap(AppContainer) : AppContainer

/** Uncomment this to switch to storybook */
// export { default } from '../.storybook'

const keetStore = createKeetStore()

export default function () {
  const [callStreamApi, setCallStreamApi] = useState<any>()
  useScreenOrientationLock()

  useEffect(() => {
    const prepareStore = async () => {
      try {
        await installKeetCore()
        const backendApi = getKeetBackend()
        const swarmId = await backendApi.api.mobile.getSwarmId()
        const callApi = new KeetCallClient(backendApi.api.call, swarmId)
        setBackend({ backendApi, callApi })
        setCallStreamApi({
          getRemoteSrcObject: callApi.getRemoteSrcObject,
          getLocalSrcObj: (streamId: string) =>
            callApi.local.getSrcObject(streamId),
        })

        // Initiate hypertrace as early as possible
        const hypertraceKey = localStorage.getItem(Keys.HYPERTRACE_KEY)
        if (hypertraceKey) {
          backendApi.api.tracing
            .start(hypertraceKey)
            .then(() => console.log('Hypertrace logging started'))
          setTraceFunction(async (params: any) => {
            delete params.object.ctx // If `ctx` is not removed, then the RPC method is not called
            await backendApi.api.tracing.addFrontendTrace(params)
          })
        }

        const dispatch = getDispatch()
        dispatch(setStoreReady())
      } catch (error) {
        consoleError('Error preparing store', error)
      }
    }

    const prepareTimer = setTimeout(() => {
      prepareStore()
    })

    return () => clearTimeout(prepareTimer)
  }, [])

  if (!keetStore) {
    return
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={s.container}>
        <Provider store={keetStore}>
          <NotifierWrapper>
            <ErrorBoundary>
              <>
                <BottomSheetModalProvider>
                  <StreamContext.Provider value={callStreamApi}>
                    <KeyboardProvider navigationBarTranslucent={true}>
                      <App />
                    </KeyboardProvider>
                  </StreamContext.Provider>
                  <DevConsole />
                </BottomSheetModalProvider>
                <Notifications />
              </>
            </ErrorBoundary>
          </NotifierWrapper>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    fullscreenView: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      backgroundColor: theme.background.bg_1,
      justifyContent: 'center',
      zIndex: 10,
    },
  })
  return styles
})
