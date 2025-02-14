import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Audio } from 'expo-av'
import { RecordingStatus } from 'expo-av/build/Audio'
import isEqual from 'react-fast-compare'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Reanimated, {
  clamp,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Tooltip from 'react-native-walkthrough-tooltip'
import _debounce from 'lodash/debounce'

import { setKeepScreenOn } from '@holepunchto/webrtc'

import {
  getCurrentSoundUri,
  getVMDuration,
  getVMIsLocked,
  getVMIsStopped,
  setAudioSamples,
  setSoundUri,
  setVoiceMessageState,
} from 'reducers/application'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  colorWithAlpha,
  createThemedStylesheet,
  useTheme,
} from 'component/theme'
import s, {
  ICON_SIZE_14,
  ICON_SIZE_16,
  ICON_SIZE_20,
  TRANSPARENT,
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'
import { consoleError } from 'lib/errors'
import { doVibrateSuccess } from 'lib/haptics'
import { waitOnKeyboardDidDismiss } from 'lib/keyboard'
import { isAndroid } from 'lib/platform'

import { useStrings } from 'i18n/strings'

type RecordingProps = {
  getStatusAsync: Function
  stopAndUnloadAsync: Function
  getURI: Function
  pauseAsync: Function
  startAsync: Function
} | null

type AudioRecorderMicrophoneIconProps = {
  resetRecording: Function
  onEventSwipe: (value: number, isAnimating: boolean) => void
  style?: StyleProp<ViewStyle>
}

export const X_THRESHOLD = -150
const Y_THRESHOLD = -90
const VOICE_PROMPT_TIMEOUT = 3000

export const convertToTimestamp = (millis: number) => {
  const date = new Date(Date.UTC(0, 0, 0, 0, 0, 0, millis))
  const timestamp = `${date.getUTCMinutes()}:${date
    .getUTCSeconds()
    .toString()
    .padStart(2, '0')}`
  return timestamp
}

const AudioRecorderMicrophoneIcon = forwardRef(
  (
    { resetRecording, onEventSwipe, style }: AudioRecorderMicrophoneIconProps,
    ref,
  ) => {
    const strings = useStrings()
    const theme = useTheme()
    const styles = getStyles()
    const dispatch = useDispatch()
    const currentSoundUri = useSelector(getCurrentSoundUri)
    const isStopped = useSelector(getVMIsStopped)
    const isLocked = useSelector(getVMIsLocked)
    const duration = useSelector(getVMDuration)
    const { top: topSafeAreaInsect } = useSafeAreaInsets()

    const [recording, setRecording] = useState<RecordingProps>(null)

    const isLongPressed = useSharedValue(1)
    const position = useSharedValue(0)
    const lockPos = useSharedValue(0)
    const lockOpacity = useSharedValue(0)
    const isThresholdReached = useSharedValue(false)

    let promptTimeout = useRef<NodeJS.Timeout>()
    const [showVoicePrompt, setShowVoicePrompt] = useState(false)
    const opacity = useSharedValue(1)

    const showLockIcon = useCallback(() => {
      lockPos.value = withTiming(-135, {
        duration: 350,
        easing: Easing.in(Easing.exp),
      })
      lockOpacity.value = withTiming(1, {
        duration: 350,
        easing: Easing.in(Easing.exp),
      })
    }, [lockOpacity, lockPos])

    const hideLockIcon = useCallback(() => {
      lockPos.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.exp),
      })
      lockOpacity.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.exp),
      })
    }, [lockOpacity, lockPos])

    useEffect(() => {
      if (!duration) return
      if (duration === '0:00' && lockPos.value === 0) {
        showLockIcon()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, lockPos])

    const handleDuration = useCallback(
      (millis: number) => {
        const _duration = convertToTimestamp(millis)
        if (!_duration) return
        dispatch(
          setVoiceMessageState({
            duration: _duration,
          }),
        )
      },
      [dispatch],
    )

    const onRecordingStatusUpdate = useCallback(
      (status: RecordingStatus) => {
        const dBFS = status?.metering
        if (
          dBFS === undefined ||
          isStopped ||
          dBFS === 0 ||
          !status.isRecording
        )
          return

        /*
          https://dsp.stackexchange.com/questions/87520/what-additional-inputs-are-required-to-convert-dbfs-to-db-spl
          formular to convert from dBFS to volume
          dBFS = 10 * log10(N / (2^15)
          it's not 100% correct, will imporve later
        */
        const volume = 32768 * Math.E ** ((dBFS / 10) * Math.log(10))
        dispatch(setAudioSamples(volume))
        handleDuration(status.durationMillis)
      },
      [dispatch, handleDuration, isStopped],
    )

    const unloadRecording = useCallback(
      async ({ force = false }: { force?: boolean } = {}) => {
        try {
          if (!recording) return
          const status = await recording?.getStatusAsync()
          if (status?.isRecording || force) {
            await recording?.stopAndUnloadAsync()
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
            })
            dispatch(
              setVoiceMessageState({
                uri: recording?.getURI(),
              }),
            )
          }
        } catch (e) {
          console.log('unloadRecording error', e)
        }
      },
      [dispatch, recording],
    )

    const micAnimation = useAnimatedStyle(() => ({
      transform: [
        { scale: isLongPressed.value },
        { translateY: position.value },
      ],
    }))

    const lockIcon = useAnimatedStyle(() => ({
      transform: [{ translateY: lockPos.value }],
      opacity: lockOpacity.value,
    }))

    useEffect((): any => {
      return () => unloadRecording({ force: true })
    }, [unloadRecording])

    const hasMicrophonePermission = useCallback(async () => {
      const { granted, canAskAgain } = await Audio.getPermissionsAsync()
      if (!granted) {
        if (!canAskAgain) {
          showBottomSheet({
            bottomSheetType: BottomSheetEnum.PermissionRequired,
            title: strings.common.microphonePermissionRequired,
            close: () => closeBottomSheet(),
          })
          return false
        }
        const askPermission = await Audio.requestPermissionsAsync()
        if (!askPermission.granted) {
          await hasMicrophonePermission()
        }
        return false
      }
      return true
    }, [strings.common.microphonePermissionRequired])

    const startRecording = useCallback(async () => {
      try {
        if (recording) return
        if (currentSoundUri || currentSoundUri === '') {
          dispatch(setSoundUri(null))
        }
        if (!(await hasMicrophonePermission())) return
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        })
        const { recording: _recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          onRecordingStatusUpdate,
          isAndroid ? 100 : 90,
        )
        setRecording(_recording)
        setKeepScreenOn(true)
      } catch (err) {
        consoleError('Failed to start recording', err)
      }
    }, [
      currentSoundUri,
      recording,
      dispatch,
      hasMicrophonePermission,
      onRecordingStatusUpdate,
    ])

    const stopRecording = useCallback(
      async ({ forceStop = false } = {}) => {
        try {
          if (!recording && !isStopped) return
          setRecording(null)
          if (!forceStop) {
            dispatch(
              setVoiceMessageState({
                isStopped: true,
              }),
            )
          }
          await unloadRecording({ force: forceStop })
          setKeepScreenOn(false)
          isLongPressed.value = withTiming(1, {
            duration: 350,
            easing: Easing.in(Easing.exp),
          })
          isThresholdReached.value = false
          lockPos.value = 0
          lockOpacity.value = 0
        } catch (err) {
          consoleError('Failed to stop recording', err)
        }
      },
      [
        dispatch,
        isLongPressed,
        isStopped,
        isThresholdReached,
        lockOpacity,
        lockPos,
        recording,
        unloadRecording,
      ],
    )

    useImperativeHandle(
      ref,
      () => ({
        stopRecording,
        recording,
      }),
      [recording, stopRecording],
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleStop = useCallback(
      _debounce(
        async () => {
          try {
            isLongPressed.value = withTiming(1, {
              duration: 350,
              easing: Easing.out(Easing.exp),
            })
            await stopRecording({ forceStop: true })
            resetRecording()
          } catch (e) {
            console.log('handleStop error', e)
          }
        },
        BACK_DEBOUNCE_DELAY,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [resetRecording, stopRecording],
    )

    const handleLock = useCallback(() => {
      dispatch(setVoiceMessageState({ isLocked: true }))
    }, [dispatch])

    const longPressGesture = Gesture.LongPress()
      .maxDistance(500)
      .onStart(() => {
        isLongPressed.value = withTiming(1.4, {
          duration: 350,
          easing: Easing.in(Easing.exp),
        })
        runOnJS(startRecording)()
      })
      .onTouchesUp(() => {
        if (position.value !== 0) return
        isLongPressed.value = withTiming(1, {
          duration: 350,
          easing: Easing.out(Easing.exp),
        })
        runOnJS(hideLockIcon)()
        runOnJS(stopRecording)()
      })

    const slideGesture = Gesture.Pan()
      .activateAfterLongPress(500)
      .onUpdate((e) => {
        if (e.translationX < X_THRESHOLD && e.translationY > Y_THRESHOLD) {
          isThresholdReached.value = true
          runOnJS(handleStop)()
          return
        }

        if (e.translationY <= Y_THRESHOLD) {
          if (!isLocked) {
            runOnJS(handleLock)()
          }
        }
        runOnJS(onEventSwipe)(e.translationX, true)
        position.value = clamp(e.translationY, -90, 0)
      })
      .onEnd(() => {
        const prevPosition = position.value
        position.value = 0
        runOnJS(hideLockIcon)()
        isLongPressed.value = withTiming(1, {
          duration: 350,
          easing: Easing.out(Easing.exp),
        })
        if ((prevPosition !== 0 && isThresholdReached.value) || isLocked) return
        runOnJS(stopRecording)()
        runOnJS(onEventSwipe)(0, false)
      })

    const gesture = Gesture.Simultaneous(longPressGesture, slideGesture)

    const getIconSize = useCallback((): number => {
      if (!duration) {
        return ICON_SIZE_20
      } else if (isLongPressed.value === 1.4) {
        return ICON_SIZE_14
      }
      return ICON_SIZE_16
    }, [isLongPressed.value, duration])

    const promptAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))

    const animateTooltip = useCallback(
      (_showVoicePrompt: boolean) => {
        opacity.value = withTiming(
          _showVoicePrompt ? 1 : 0,
          { duration: _showVoicePrompt ? 0 : 300 },
          () => runOnJS(setShowVoicePrompt)(_showVoicePrompt),
        )
        if (!_showVoicePrompt && typeof promptTimeout.current === 'number') {
          clearTimeout(promptTimeout.current)
        }
      },
      [opacity, promptTimeout],
    )

    const onPressMicrophone = useCallback(async () => {
      doVibrateSuccess()
      await waitOnKeyboardDidDismiss()
      animateTooltip(true)
      promptTimeout.current = setTimeout(
        () => animateTooltip(false),
        VOICE_PROMPT_TIMEOUT,
      )
    }, [animateTooltip])

    const onCloseTip = useCallback(() => {
      animateTooltip(false)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <>
        <GestureDetector gesture={gesture}>
          <View>
            <Tooltip
              isVisible={showVoicePrompt}
              content={
                <View style={[s.row, s.centeredLayout]}>
                  <Text style={styles.micTooltipLabel}>
                    {strings.chat.holdToRecord}
                  </Text>
                  <TouchableOpacity onPress={onCloseTip}>
                    <SvgIcon
                      name="close"
                      width={UI_SIZE_16}
                      height={UI_SIZE_16}
                    />
                  </TouchableOpacity>
                </View>
              }
              disableShadow
              placement="top"
              tooltipStyle={[styles.tooltipStyle, promptAnimatedStyle]}
              backgroundColor={TRANSPARENT}
              contentStyle={styles.contentStyle}
              onClose={onCloseTip}
              topAdjustment={isAndroid ? -topSafeAreaInsect : 0}
            >
              <TouchableOpacity onPress={onPressMicrophone}>
                <Reanimated.View
                  style={[
                    micAnimation,
                    styles.icon,
                    s.centeredLayout,
                    recording ? styles.recordingContainer : {},
                    style,
                  ]}
                >
                  <SvgIcon
                    name="microphone"
                    width={getIconSize()}
                    height={getIconSize()}
                    color={duration ? colors.white_snow : theme.color.grey_200}
                  />
                </Reanimated.View>
              </TouchableOpacity>
            </Tooltip>
          </View>
        </GestureDetector>
        <Reanimated.View style={[styles.lockIcon, lockIcon]}>
          <SvgIcon
            name="lock"
            width={UI_SIZE_16}
            height={UI_SIZE_16}
            color={theme.color.grey_200}
          />
        </Reanimated.View>
      </>
    )
  },
)

export default memo(AudioRecorderMicrophoneIcon, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    contentStyle: {
      backgroundColor: theme.color.grey_400,
      borderRadius: UI_SIZE_8,
      marginLeft: UI_SIZE_4,
      paddingHorizontal: UI_SIZE_10,
    },
    icon: {
      height: theme.icon.size,
      width: theme.icon.size,
    },
    lockIcon: {
      backgroundColor: theme.color.bg3,
      borderRadius: 50,
      padding: 10,
      position: 'absolute',
      right: -2,
      top: 10,
      zIndex: -1,
    },
    micTooltipLabel: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      marginRight: UI_SIZE_6,
    },
    recordingContainer: {
      backgroundColor: theme.color.blue_400,
      borderRadius: 50,
    },
    send: {
      backgroundColor: colorWithAlpha(theme.color.blue_400, 0.2),
      borderRadius: theme.border.radiusLarge * 1.5,
    },
    tooltipStyle: {
      marginLeft: UI_SIZE_4,
      marginTop: UI_SIZE_4,
    },
  })
  return styles
})
