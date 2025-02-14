import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av'
import isEqual from 'react-fast-compare'
import { useIsFocused } from '@react-navigation/native'
import _isEmpty from 'lodash/isEmpty'

import { getCurrentSoundUri, setSoundUri } from 'reducers/application'

import s, {
  ICON_SIZE_32,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_32,
  UI_SIZE_120,
} from 'lib/commonStyles'
import {
  ONE_HOUR_IN_MILLISECONDS,
  ONE_MINUTE_IN_MILLISECONDS,
  ONE_SECOND_IN_MILLISECONDS,
} from 'lib/constants'
import useStateDeepEqual from 'lib/hooks/useStateDeepEqual'
import { isAndroid } from 'lib/platform'
import { getMessageCellAvailableWidth } from 'lib/size'

import { useAppBottomSheetState } from './AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from './AppBottomSheet/SheetComponents/BottomSheetEnum'
import { IconButton } from './Button'
import { Loading } from './Loading'
import Slider from './Slider'
import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet } from './theme'
import WaveformVisual from './WaveformVisual'

type PlayerStatus = {
  durationMillis?: number
  isPlaying?: boolean
  positionMillis?: number
  isBuffering?: boolean
}

type AudioPlayerProps = {
  showShowSlider?: boolean
  onAudioLoaded?: Function
  uri: string
  fromChat?: boolean
  fromAttachment?: boolean
  loading?: boolean
  samples?: number[]
}

export const millisecondsToAudioDurationFormat = (ms?: number) => {
  if (!ms) return '0:00'

  let msLeft = ms
  const hours = Math.floor(msLeft / ONE_HOUR_IN_MILLISECONDS)
  msLeft -= hours * ONE_HOUR_IN_MILLISECONDS
  const minutes = Math.floor(msLeft / ONE_MINUTE_IN_MILLISECONDS)
  msLeft -= minutes * ONE_MINUTE_IN_MILLISECONDS
  const seconds = Math.floor(msLeft / ONE_SECOND_IN_MILLISECONDS)

  const minutesString = String(minutes).padStart(2, '0')
  const secondsString = String(seconds).padStart(2, '0')

  if (!hours) return `${minutes}:${secondsString}`

  return `${hours}:${minutesString}:${secondsString}`
}

const defaultDuration = millisecondsToAudioDurationFormat()

const PLAYSPEED_OPTIONS = {
  half: 0.5,
  normal: 1,
  double: 2,
}

const nextPlaySpeed = (ps: number) => {
  if (ps === PLAYSPEED_OPTIONS.half) return PLAYSPEED_OPTIONS.normal
  if (ps === PLAYSPEED_OPTIONS.normal) return PLAYSPEED_OPTIONS.double
  return PLAYSPEED_OPTIONS.half
}

const AudioPlayer = ({
  uri,
  fromChat,
  onAudioLoaded,
  fromAttachment,
  showShowSlider = true,
  loading = false,
  samples = [],
}: AudioPlayerProps) => {
  const styles = getStyles()

  const dispatch = useDispatch()
  const currentSoundUri = useSelector(getCurrentSoundUri)

  const isFocused = useIsFocused()
  const { showBottomSheet, sheetType } = useAppBottomSheetState()

  const [playback, setPlayback] = useStateDeepEqual<PlayerStatus>()
  const [sound, setSound] = useState<Audio.Sound>()
  const [sliderValue, setSliderValue] = useState(0)
  const [wasPlaying, setWasPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(PLAYSPEED_OPTIONS.normal)

  const duration = useRef<string>(defaultDuration)

  const isVoiceNote = !_isEmpty(samples)
  const iconSize = fromAttachment ? UI_SIZE_24 : UI_SIZE_32 - UI_SIZE_2

  useEffect((): any => {
    return async () => {
      return sound ? await sound?.unloadAsync() : undefined
    }
  }, [isFocused, sound])

  const initSoundMode = useCallback(
    async () =>
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      }),
    [],
  )

  const handleDuration = useCallback((millis?: number) => {
    const durationTimestamp = millisecondsToAudioDurationFormat(millis)
    duration.current = durationTimestamp
  }, [])

  const totalDuration = useMemo(
    () => millisecondsToAudioDurationFormat(playback?.durationMillis),
    [playback?.durationMillis],
  )

  const isBuffering = useMemo(
    () => (playback?.isPlaying && playback?.isBuffering) || false,
    [playback?.isBuffering, playback?.isPlaying],
  )

  const unloadAudioFromMemory = useCallback(async () => {
    if (!sound) return
    await sound?.unloadAsync()
    setSound(undefined)
  }, [sound])

  const stopSound = useCallback(async () => {
    await sound?.stopAsync()
    duration.current = defaultDuration
    setSliderValue(0)
    unloadAudioFromMemory()
  }, [sound, unloadAudioFromMemory])

  useEffect(() => {
    if (
      (totalDuration !== defaultDuration || playback?.durationMillis !== 0) &&
      playback?.positionMillis === playback?.durationMillis
    ) {
      const timeout = setTimeout(() => stopSound(), 200)
      return () => clearTimeout(timeout)
    }
  }, [
    playback?.durationMillis,
    playback?.positionMillis,
    stopSound,
    totalDuration,
  ])

  const playbackStatusUpdate = useCallback(
    async (playStatus: AVPlaybackStatus) => {
      if (!playStatus.isLoaded) {
        if (playStatus.error) {
          console.log(
            `Encountered a fatal error during playback: ${playStatus.error}`,
          )
        }
        return
      }
      setPlayback({
        isPlaying: playStatus.isPlaying,
        positionMillis: playStatus.positionMillis,
        durationMillis: playStatus.durationMillis,
        isBuffering: playStatus.isBuffering,
      })
      if (wasPlaying && playStatus.positionMillis === 0) {
        setWasPlaying(false)
        return
      }
      handleDuration(playStatus?.positionMillis)
      setSliderValue(playStatus?.positionMillis)
    },
    [setPlayback, wasPlaying, handleDuration],
  )

  useEffect((): any => {
    const initSound = async () => {
      try {
        const soundObj = new Audio.Sound()
        const audio = await soundObj.loadAsync({ uri })
        if (audio.isLoaded) {
          onAudioLoaded?.()
        }
        const playStatus = await soundObj.getStatusAsync()
        // @ts-ignore
        playbackStatusUpdate({ ...playStatus, isBuffering: false }) // Buffering will be handled while play
        // Init just to load the audio meta like duration, So safe to unload from memory. Will load again while play
        await soundObj?.unloadAsync()
      } catch (e) {
        console.log('initSound Error', e)
      }
    }
    if (!isFocused) return
    initSound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, isFocused])

  const playAudio = useCallback(async () => {
    try {
      if (!uri) return
      let _sound: Audio.Sound | null = null
      if (!sound) {
        const { sound: soundObj } = await Audio.Sound.createAsync({ uri })
        _sound = soundObj
        setSound(soundObj)
      } else {
        // @ts-ignore
        _sound = sound
      }
      _sound?.setProgressUpdateIntervalAsync(isAndroid ? 200 : 150)
      _sound?.setOnPlaybackStatusUpdate(playbackStatusUpdate)
      _sound?.setStatusAsync({ rate: playSpeed })
      await initSoundMode()
      await _sound?.playFromPositionAsync(sliderValue)
      dispatch(setSoundUri(uri))
    } catch (e) {
      console.log('playAudio error', e)
    }
  }, [
    dispatch,
    initSoundMode,
    playSpeed,
    playbackStatusUpdate,
    sliderValue,
    sound,
    uri,
  ])

  const pauseAndUnloadAudio = useCallback(async () => {
    await sound?.pauseAsync()
    await unloadAudioFromMemory()
    setWasPlaying(true)
  }, [sound, unloadAudioFromMemory])

  useEffect(() => {
    // Pause audio if option sheet is opened on android to avoid core issue
    if (!sound || !playback || !isAndroid) return
    if (
      playback?.isPlaying &&
      showBottomSheet &&
      sheetType === BottomSheetEnum.OptionsSheet
    ) {
      pauseAndUnloadAudio()
    }
  }, [pauseAndUnloadAudio, playback, sheetType, showBottomSheet, sound])

  useEffect(() => {
    if (
      uri !== currentSoundUri &&
      currentSoundUri !== '' &&
      playback?.isPlaying
    ) {
      pauseAndUnloadAudio()
    }
  }, [currentSoundUri, pauseAndUnloadAudio, playback?.isPlaying, uri])

  const handleOnValueChange = useCallback(
    (_sliderValue: number) => {
      const value = Math.floor(_sliderValue)
      setSliderValue(value)
      handleDuration(value)
    },
    [handleDuration],
  )

  const handleOnSlidingStart = useCallback(async () => {
    setWasPlaying(true)
    if (!playback?.isPlaying) return
    await sound?.pauseAsync()
  }, [playback?.isPlaying, sound])

  const handleOnSlidingComplete = useCallback(
    async (_sliderValue: number) => {
      try {
        const value = Math.floor(_sliderValue)
        const status = await sound?.setPositionAsync(value)
        if (!status) return
        await sound?.setStatusAsync(status)
        if (wasPlaying) {
          await playAudio()
          setWasPlaying(false)
        }
      } catch (e) {
        console.log('slider change error', e)
      }
    },
    [playAudio, sound, wasPlaying],
  )

  const onTogglePlaybackSpeed = useCallback(async () => {
    try {
      const nextSpeed = nextPlaySpeed(playSpeed)
      setPlaySpeed(nextSpeed)
      sound?.setStatusAsync({ rate: nextSpeed })
    } catch (e) {
      console.log('toggle playback speed change error', e)
    }
  }, [playSpeed, sound])

  const containerStyle = useMemo(
    () => ({
      ...(fromAttachment
        ? styles.attachmentPlayer
        : { paddingVertical: isVoiceNote ? UI_SIZE_8 : undefined }),
    }),
    [fromAttachment, styles.attachmentPlayer, isVoiceNote],
  )

  const waveformWidth = useMemo(() => {
    const availableWidth = getMessageCellAvailableWidth()

    if (fromChat) {
      if (isVoiceNote) {
        return availableWidth - UI_SIZE_120 - UI_SIZE_20
      }
      return availableWidth - UI_SIZE_120 // extra space for mute icon
    }

    return availableWidth - (UI_SIZE_120 - UI_SIZE_20) // -100
  }, [fromChat, isVoiceNote])

  const SliderComponent = useCallback(() => {
    if (!showShowSlider) return null

    return (
      <Slider
        style={styles.slider}
        disabled={isBuffering}
        onValueChange={handleOnValueChange}
        value={sliderValue}
        minimumValue={0}
        maximumValue={playback?.durationMillis}
        onSlidingStart={handleOnSlidingStart}
        onSlidingComplete={handleOnSlidingComplete}
        minimumTrackTintColor={_isEmpty(samples) ? null : 'transparent'}
        maximumTrackTintColor={_isEmpty(samples) ? null : 'transparent'}
        offset={0}
        thumbVisible={!isVoiceNote}
      />
    )
  }, [
    handleOnSlidingComplete,
    handleOnSlidingStart,
    handleOnValueChange,
    isBuffering,
    playback?.durationMillis,
    samples,
    showShowSlider,
    sliderValue,
    styles.slider,
    isVoiceNote,
  ])

  if (loading) return null

  return (
    <View
      style={[
        s.centerAlignedRow,
        !fromChat ? s.container : s.flexSpaceBetween,
        !fromChat && !fromAttachment ? styles.attachmentVoicePlayer : {},
        containerStyle,
      ]}
    >
      <View style={[s.row, styles.playbackAction]}>
        {isBuffering ? (
          <IconButton disabled style={styles.icon}>
            <Loading style={styles.audioBuffering} />
          </IconButton>
        ) : !playback?.isPlaying ? (
          <IconButton onPress={playAudio} style={styles.icon}>
            <SvgIcon
              name="playCircleFilled"
              width={iconSize}
              height={iconSize}
            />
          </IconButton>
        ) : (
          <IconButton onPress={pauseAndUnloadAudio} style={styles.icon}>
            <SvgIcon
              name="pauseCircleFilled"
              width={iconSize}
              height={iconSize}
            />
          </IconButton>
        )}
      </View>
      {fromAttachment && (
        <Text
          style={[
            styles.duration,
            isVoiceNote && styles.durationPartial,
            fromAttachment && styles.durationAttachment,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {isVoiceNote
            ? `${duration.current}`
            : `${duration.current}/${totalDuration}`}
        </Text>
      )}
      <View style={s.centerAlignedRow}>
        {!fromAttachment && (
          <View style={[styles.waveformContainer, { width: waveformWidth }]}>
            <WaveformVisual
              waveform={samples}
              width={waveformWidth}
              positionMillis={sliderValue}
              durationMillis={playback?.durationMillis || 0}
            />
            {SliderComponent()}
          </View>
        )}
        {isVoiceNote && (
          <Text
            style={[styles.duration, styles.durationPartial]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {totalDuration}
          </Text>
        )}
      </View>
      {!fromAttachment && (
        <>
          {fromChat && (
            <IconButton
              style={styles.playbackSpeed}
              onPress={onTogglePlaybackSpeed}
            >
              <Text style={styles.playbackSpeedText}>{playSpeed}x</Text>
            </IconButton>
          )}
        </>
      )}
    </View>
  )
}

export default memo(AudioPlayer, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    attachmentPlayer: {
      padding: UI_SIZE_4,
      ...s.centeredLayout,
      ...s.fullHeight,
    },
    attachmentVoicePlayer: {
      justifyContent: 'space-between',
      paddingHorizontal: UI_SIZE_8,
    },
    audioBuffering: {
      height: UI_SIZE_16,
      width: UI_SIZE_16,
    },
    duration: {
      ...s.textAlignCenter,
      ...theme.text.bodySemiBold,
      fontSize: 13,
    },
    durationAttachment: {
      marginHorizontal: UI_SIZE_4,
    },
    durationPartial: {
      width: UI_SIZE_32,
    },
    icon: {
      height: ICON_SIZE_32,
      width: ICON_SIZE_32,
    },
    playbackAction: {
      width: ICON_SIZE_32,
      ...s.alignItemsCenter,
    },
    playbackSpeed: {
      borderColor: colors.white_snow,
      borderRadius: UI_SIZE_32,
      borderWidth: 1,
      height: UI_SIZE_24,
      paddingVertical: UI_SIZE_2,
      width: 38,
    },
    playbackSpeedText: {
      ...theme.text.bodySemiBold,
      fontSize: 13,
    },
    slider: {
      position: 'absolute',
      zIndex: 1,
      ...s.fullWidth,
      minHeight: 40,
    },
    waveformContainer: {
      justifyContent: 'center',
      marginHorizontal: UI_SIZE_4,
    },
  })
  return styles
})
