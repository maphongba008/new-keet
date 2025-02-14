import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Rive, { RiveRef } from 'rive-react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Audio } from 'expo-av'
import isEqual from 'react-fast-compare'
import { useIsFocused } from '@react-navigation/native'
import _debounce from 'lodash/debounce'

import {
  getAppCurrentCallRoomId,
  getAppCurrentRoomId,
  hasAppCurrentRoomCallMatch,
  isOngoingCallByRoomId,
} from '@holepunchto/keet-store/store/app'
import {
  CALL_STATUS,
  callJoinCmd,
  getCallKnownMemberCount,
  getCallSettingsReady,
  getCallStatus,
  getCallUnknownPresenceIds,
  getMyVideoMuted,
  openCallSettings,
  setMyAudioMuted,
  setMyVideoMuted,
} from '@holepunchto/keet-store/store/call'
import { getChatMessageInitialLoading } from '@holepunchto/keet-store/store/chat'
import {
  getRoomItemById,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'
import { setInCall, setKeepScreenOn } from '@holepunchto/webrtc'

import {
  getIsAppBackgrounded,
  getIsAppForegrounded,
} from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { dismissCall, showCallOnGoingAlert } from 'lib/call'
import {
  ICON_SIZE_24,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_32,
  UI_SIZE_36,
} from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'
import { consoleError } from 'lib/errors'
import { doVibrateSuccess } from 'lib/haptics'
import { useTimeout } from 'lib/hooks'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { useIsCallEnabled } from 'lib/hooks/useRoom'
import { showErrorNotifier, showInfoNotifier } from 'lib/hud'
import {
  getStorageShowCallTooltip,
  setStorageCallTooltipShownDone,
} from 'lib/localStorage/storageRoomTooltip'
import { navigate, SCREEN_ROOM, SCREEN_ROOM_CALL } from 'lib/navigation'
import { isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

import {
  closeBottomSheet,
  showBottomSheet,
} from './AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from './AppBottomSheet/SheetComponents/BottomSheetEnum'
import { Tooltip } from './Tooltip'

type CallButtonProps = {
  roomId?: string
  onPress?: () => void
  fromLobby?: boolean
  joinCall?: boolean
}

const CallButtonWithRiv = memo(({ onPress }: CallButtonProps) => {
  const riveRef = React.useRef<RiveRef>(null)
  const styles = getStyles()
  const roomId = useSelector(getAppCurrentRoomId)
  const isCallOnGoing = useSelector((state) =>
    isOngoingCallByRoomId(state, roomId),
  )

  const isFocused = useIsFocused()
  const isCallEnabled = useIsCallEnabled(roomId)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRivAnimation = useCallback(
    _debounce(
      () => {
        if (riveRef?.current && isCallEnabled) {
          if (isCallOnGoing && isFocused) {
            riveRef?.current?.play()
          } else {
            riveRef?.current?.stop()
            riveRef?.current?.reset()
          }
        }
      },
      200,
      BACK_DEBOUNCE_OPTIONS,
    ),
    [isCallEnabled, isCallOnGoing],
  )

  useEffect(() => {
    // add timeout to rivAnimation otherwise leads to crash https://github.com/rive-app/rive-react-native/issues/148
    const timer = setTimeout(() => handleRivAnimation(), 200)
    return () => clearTimeout(timer)
  }, [handleRivAnimation, isFocused])

  return (
    <>
      <Rive
        ref={riveRef}
        // @ts-ignore
        style={[styles.rivAnimation, !isCallEnabled && styles.disabled]}
        resourceName="join_call"
        autoplay={false}
      />
      <Pressable
        style={styles.rivTouchWrapper}
        onPress={onPress}
        testID={APPIUM_IDs.room_call_join}
      />
    </>
  )
})

export const CallButton = memo(
  ({
    onPress,
    roomId = '',
    fromLobby = false,
    joinCall = false,
  }: CallButtonProps) => {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const isCallOnGoing = useSelector((state) =>
      isOngoingCallByRoomId(state, roomId),
    )
    const isCallEnabled = useIsCallEnabled(roomId)
    const videoDisabled = useSelector(getMyVideoMuted)
    const isReady = useSelector(getCallSettingsReady)
    const isAppBackgrounded = useSelector(getIsAppBackgrounded)
    const isAppForegrounded = useSelector(getIsAppForegrounded)
    const callStatus = useSelector(getCallStatus)
    const currentRoomId = useDeepEqualSelector(getAppCurrentCallRoomId)
    const currentRoomCallMatch = useSelector(hasAppCurrentRoomCallMatch)
    const unknownMemberPresence = useSelector(getCallUnknownPresenceIds)
    const knowMemberPresenceCount: number = useSelector(getCallKnownMemberCount)
    const isChatMessageInitialLoading = useSelector(
      getChatMessageInitialLoading,
    )
    const { title }: { title: string } =
      useDeepEqualSelector(getRoomItemById(roomId)) || {}
    const shouldMuteCall = useMemo(() => {
      const totalPresenceCount =
        unknownMemberPresence.length + knowMemberPresenceCount
      return totalPresenceCount > 4
    }, [knowMemberPresenceCount, unknownMemberPresence.length])
    const isCallOnGoingBeforePermission = useRef<boolean>(false)
    const [isTooltipVisible, setIsTooltipVisible] = useState(false)
    const ref = React.useRef(null)

    const theme = useTheme()
    const styles = getStyles()
    const strings = useStrings()

    useEffect(() => {
      if (
        isChatMessageInitialLoading ||
        !isReady ||
        !loading ||
        (isCallOnGoingBeforePermission.current && !isCallOnGoing) ||
        isAppBackgrounded ||
        currentRoomId === '' ||
        callStatus !== CALL_STATUS.SETTINGS
      )
        return
      dispatch(callJoinCmd())
      navigate(SCREEN_ROOM_CALL, {
        roomId,
        shouldToggleMicrophoneAtInit: !shouldMuteCall,
      })
      setKeepScreenOn(true)
      setLoading(false)
    }, [
      callStatus,
      currentRoomId,
      dispatch,
      isAppBackgrounded,
      isCallOnGoing,
      isCallOnGoingBeforePermission,
      isChatMessageInitialLoading,
      isReady,
      loading,
      onPress,
      roomId,
      shouldMuteCall,
    ])

    const initCallWithDelay = useTimeout(async () => {
      await initCall()
    }, 200)

    const hasMicrophonePermission = useCallback(async () => {
      const permisson = await Audio.getPermissionsAsync()
      if (!permisson.granted) {
        // @ts-ignore
        isCallOnGoingBeforePermission.current = isCallOnGoing
        setLoading(false)
        showBottomSheet({
          bottomSheetType: BottomSheetEnum.PermissionRequired,
          title: strings.common.microphonePermissionRequired,
          close: () => closeBottomSheet(),
        })
        return false
      }
      return true
    }, [isCallOnGoing, strings.common.microphonePermissionRequired])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initCall = useCallback(
      _debounce(
        async () => {
          try {
            setLoading(true)
            if (!(await hasMicrophonePermission())) return
            setInCall({
              enabled: true,
              title: strings.call.foregroundService,
              body: isIOS ? title : strings.call.tapToCall,
              uri: 'keet://screen/call',
            })
            onPress?.()
            doVibrateSuccess()
            if (shouldMuteCall) {
              dispatch(setMyAudioMuted(true))
            }
            if (!videoDisabled) {
              dispatch(setMyVideoMuted(true))
            }
            dispatch(openCallSettings())
          } catch (err) {
            setLoading(false)
            showErrorNotifier(strings.call.callError)
            consoleError(err)
          }
        },
        BACK_DEBOUNCE_DELAY,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [
        dispatch,
        roomId,
        isCallOnGoing,
        callStatus,
        isAppForegrounded,
        shouldMuteCall,
        strings.call.foregroundService,
        strings.call.tapToCall,
        title,
      ],
    )

    const onPressCall = useCallback(async () => {
      if (getStorageShowCallTooltip()) {
        setIsTooltipVisible(true)
        return
      }
      if (!isCallEnabled) {
        showInfoNotifier(strings.room.callDisabledNotification)
        return
      }

      if (callStatus === CALL_STATUS.JOINED && !currentRoomCallMatch) {
        showCallOnGoingAlert({
          alertDesc: strings.call.alertDesc,
          onPressLeave: () => {
            dismissCall()
            initCallWithDelay()
          },
          strings,
        })
        return
      }

      await initCall()
    }, [
      callStatus,
      currentRoomCallMatch,
      initCall,
      isCallEnabled,
      strings,
      initCallWithDelay,
    ])

    const onCloseTipTooltip = useCallback(() => {
      setStorageCallTooltipShownDone()
      setIsTooltipVisible(false)
      onPressCall()
    }, [onPressCall])

    useEffect(() => {
      if (joinCall) {
        const timeout = setTimeout(async () => {
          await onPressCall()
        }, 500)

        return () => clearTimeout(timeout)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [joinCall])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const roomNavigation = useCallback(
      _debounce(
        () => {
          closeBottomSheet()
          dispatch(switchRoomSubmit({ roomId }))
          navigate(SCREEN_ROOM, { joinCall: true })
        },
        BACK_DEBOUNCE_DELAY + 100,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [dispatch, roomId],
    )

    const callIcon = useCallback(
      () => (
        <SvgIcon
          name="phoneFilled"
          color={theme.color.blue_400}
          width={ICON_SIZE_24}
          height={ICON_SIZE_24}
        />
      ),
      [theme.color.blue_400],
    )

    if (fromLobby) {
      return (
        <TextButton
          text={strings.lobby.roomActions.joinCall}
          hint={strings.lobby.roomActions.joinCall}
          onPress={roomNavigation}
          style={styles.joinButton}
          type={TextButtonType.primaryOutline}
          testID={APPIUM_IDs.lobby_btn_join_room}
          icon={callIcon}
          disabled={loading}
        />
      )
    }

    if (callStatus === CALL_STATUS.JOINED && currentRoomCallMatch) return null

    return (
      <View pointerEvents={loading ? 'none' : 'auto'}>
        {loading ? (
          <Loading style={styles.loading} />
        ) : (
          <Tooltip
            step={0}
            componentRef={ref}
            placement="top"
            title={strings.callTooltip.title}
            description={strings.callTooltip.desc}
            content={
              <SvgIcon
                name="phoneGradient"
                width={UI_SIZE_36}
                height={UI_SIZE_36}
              />
            }
            toShow={isTooltipVisible}
            onClose={onCloseTipTooltip}
            testProps={appiumTestProps(APPIUM_IDs.room_call_join)}
          >
            <View ref={ref}>
              <CallButtonWithRiv onPress={onPressCall} />
            </View>
          </Tooltip>
        )}
      </View>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    disabled: {
      opacity: 0.5,
    },
    joinButton: {
      marginBottom: theme.spacing.standard,
    },
    loading: {
      height: UI_SIZE_16,
      marginHorizontal: UI_SIZE_8,
      width: UI_SIZE_16,
    },
    rivAnimation: {
      height: UI_SIZE_32,
      width: UI_SIZE_32,
    },
    rivTouchWrapper: {
      height: '100%',
      position: 'absolute',
      width: '100%',
    },
  })
  return styles
})
