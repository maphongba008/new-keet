// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/call/call-controls.js
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
  getCallSettingsState,
  getMyVideoAllowed,
  getScreenStreams,
} from '@holepunchto/keet-store/store/call'
import { getAudioOutput } from '@holepunchto/webrtc'

import { getIsSpeakerOn } from 'reducers/application'
import { videoCameraToggleAction } from 'sagas/callSaga'

import { IconButton } from 'component/Button'
import SvgIcon, { SvgIconType } from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { Arrow } from 'component/Tooltip'
import { APPIUM_IDs } from 'lib/appium'
import s, {
  ICON_SIZE_15,
  ICON_SIZE_72,
  TRANSPARENT,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'

import { useStrings } from 'i18n/strings'

import {
  handleEndCall,
  handleSpeaker,
  onToggleMicrophone,
  onToggleVideo,
} from './Call.helpers'
import { CallControlProps } from './type'

type AudioOutputType = 'speaker' | 'earpiece' | 'headset'

const SpeakerControlTooltipRow = memo(
  ({
    icon,
    name,
    isActive,
    hasTopBorder,
  }: {
    icon: SvgIconType
    name: string
    isActive: boolean
    hasTopBorder?: boolean
  }) => {
    const styles = getStyles()

    return (
      <View
        style={[
          s.centerAlignedRow,
          styles.speakerControlTooltipRowContainer,
          hasTopBorder && styles.speakerControlTooltipRowToBorder,
        ]}
      >
        <SvgIcon
          color={colors.white_snow}
          name={icon}
          width={UI_SIZE_16}
          height={UI_SIZE_16}
        />
        <Text style={styles.speakerControlTooltipRowText}>{name}</Text>
        <SvgIcon
          color={isActive ? colors.white_snow : TRANSPARENT}
          name="checkFat"
          width={UI_SIZE_16}
          height={UI_SIZE_16}
        />
      </View>
    )
  },
)

enum SpeakerTooltipShowType {
  NONE,
  EARPIECE,
  SPEAKER,
  HEADSET,
}

const SpeakerControl = memo(
  ({ speaker, disabled }: { speaker: boolean; disabled: boolean }) => {
    const strings = useStrings()
    const styles = getStyles()
    const [isShowTooltip, setShowTooltip] = useState(false)
    const [tooltipShowType, setTooltipShowType] = useState(
      SpeakerTooltipShowType.NONE,
    )
    const [availableOutputs, setAvailableOutputs] = useState<AudioOutputType[]>(
      [],
    )

    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const checkAvailableOutputs = useCallback(async () => {
      try {
        const { type } = await getAudioOutput()
        const outputs: AudioOutputType[] = ['speaker']

        if (type === 'bluetooth') {
          outputs.push('headset')
          setTooltipShowType(SpeakerTooltipShowType.EARPIECE)
          handleSpeaker(false)
        } else if (type === 'default') {
          outputs.push('earpiece')
        }

        setAvailableOutputs(outputs)
      } catch (error) {
        console.error('Error checking audio outputs:', error)
      }
    }, [])

    useEffect(() => {
      checkAvailableOutputs().catch(console.error)
    }, [checkAvailableOutputs])

    const handleSpeakerControlPress = useCallback(async () => {
      try {
        timeoutRef.current && clearTimeout(timeoutRef.current)
        handleSpeaker(!speaker)
        setShowTooltip(true)

        const isSpeakerAndHeadsetAvailable =
          availableOutputs.length === 2 &&
          availableOutputs.includes('speaker') &&
          availableOutputs.includes('headset')

        if (isSpeakerAndHeadsetAvailable) {
          setTooltipShowType(
            !speaker
              ? SpeakerTooltipShowType.SPEAKER
              : SpeakerTooltipShowType.HEADSET,
          )
        } else {
          setTooltipShowType(
            !speaker
              ? SpeakerTooltipShowType.SPEAKER
              : SpeakerTooltipShowType.EARPIECE,
          )
        }
      } finally {
        timeoutRef.current = setTimeout(() => {
          setShowTooltip(false)
        }, 2000)
      }
    }, [speaker, availableOutputs])

    useEffect(() => {
      return () => {
        timeoutRef.current && clearTimeout(timeoutRef.current)
      }
    }, [])

    return (
      <View collapsable={false}>
        {isShowTooltip && (
          <View style={styles.tooltipContentStyle}>
            <View style={styles.tooltipContainer}>
              {availableOutputs.includes('earpiece') && (
                <SpeakerControlTooltipRow
                  icon="phoneDevice"
                  name={strings.call.speakerControlPhone}
                  isActive={tooltipShowType === SpeakerTooltipShowType.EARPIECE}
                />
              )}
              {availableOutputs.includes('speaker') && (
                <SpeakerControlTooltipRow
                  icon="volume"
                  name={strings.call.speakerControlSpeaker}
                  isActive={tooltipShowType === SpeakerTooltipShowType.SPEAKER}
                  hasTopBorder={availableOutputs.includes('earpiece')}
                />
              )}
              {availableOutputs.includes('headset') && (
                <SpeakerControlTooltipRow
                  icon="headsetDevice"
                  name={strings.call.speakerControlHeadsetDevice}
                  isActive={tooltipShowType === SpeakerTooltipShowType.HEADSET}
                />
              )}
            </View>
            <Arrow placement="bottom" style={styles.arrow} />
          </View>
        )}
        <IconButton
          style={[styles.icon, !speaker && styles.whiteIcon]}
          onPress={handleSpeakerControlPress}
          testID={APPIUM_IDs.room_call_speaker}
          disabled={disabled}
        >
          <SvgIcon
            color={speaker ? colors.white_snow : colors.blue_900}
            name={speaker ? 'volume' : 'volumeX'}
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </IconButton>
      </View>
    )
  },
)

export const CallControls = memo(
  ({ showSpeakerIcon, isPortraitUpOrientation }: CallControlProps) => {
    const screenStreams = useDeepEqualSelector(getScreenStreams)
    const myVideoAllowed = useSelector(getMyVideoAllowed)
    const speaker = useSelector(getIsSpeakerOn)
    const { isAudioMuted, isVideoMuted } = useSelector(getCallSettingsState)

    const [disableControls, setDisableControls] = useState(true)
    const styles = getStyles()

    const videoDisabled = useMemo(
      () =>
        !isVideoMuted
          ? false
          : !myVideoAllowed || disableControls || !!screenStreams.length,
      [disableControls, isVideoMuted, myVideoAllowed, screenStreams.length],
    )

    useEffect(() => {
      const timeout = setTimeout(() => setDisableControls(false), 1200)
      return () => clearTimeout(timeout)
    }, [])

    return (
      <View style={[styles.wrapper, !isPortraitUpOrientation && s.column]}>
        <IconButton
          style={[
            styles.icon,
            isVideoMuted ? styles.whiteIcon : styles.greyIcon,
          ]}
          onPress={onToggleVideo}
          disabled={videoDisabled}
          testID={APPIUM_IDs.room_call_video}
        >
          <SvgIcon
            color={isVideoMuted ? colors.blue_900 : colors.white_snow}
            name={isVideoMuted ? 'videoSlash' : 'video'}
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </IconButton>
        <IconButton
          style={[
            styles.icon,
            isAudioMuted ? styles.whiteIcon : styles.greyIcon,
          ]}
          onPress={onToggleMicrophone}
          testID={APPIUM_IDs.room_call_mute}
          disabled={disableControls}
        >
          <SvgIcon
            color={isAudioMuted ? colors.blue_900 : colors.white_snow}
            name={isAudioMuted ? 'microphoneSlash' : 'microphone'}
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </IconButton>
        {showSpeakerIcon && (
          <SpeakerControl speaker={speaker} disabled={disableControls} />
        )}
        <IconButton
          style={[styles.icon, styles.redIcon]}
          onPress={handleEndCall}
          testID={APPIUM_IDs.room_call_end}
          disabled={disableControls}
        >
          <SvgIcon
            color={colors.white_snow}
            name="phoneHangup"
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </IconButton>
      </View>
    )
  },
)

export const SwapCameraButton = memo(() => {
  const dispatch = useDispatch()
  const styles = getStyles()

  const swapCamera = useCallback(() => {
    dispatch(videoCameraToggleAction())
  }, [dispatch])

  return (
    <IconButton onPress={swapCamera} style={styles.swapCamera}>
      <SvgIcon
        name="cameraRotate"
        width={UI_SIZE_20}
        height={UI_SIZE_20}
        color={colors.white_snow}
      />
    </IconButton>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    arrow: {
      alignSelf: 'center',
      borderBottomColor: theme.color.grey_500,
    },
    greyIcon: {
      backgroundColor: theme.color.grey_600,
    },
    icon: {
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusLarge,
      height: ICON_HEIGHT,
      marginHorizontal: ICON_MARGIN,
      marginVertical: ICON_MARGIN,
      width: ICON_WIDTH,
    },
    redIcon: {
      backgroundColor: theme.color.red_400,
    },
    speakerControlTooltipRowContainer: {
      paddingHorizontal: UI_SIZE_20,
      paddingVertical: UI_SIZE_12,
    },
    speakerControlTooltipRowText: {
      ...theme.text.body,
      flexGrow: 1,
      fontSize: ICON_SIZE_15,
      marginLeft: UI_SIZE_8,
      marginRight: UI_SIZE_16,
    },
    speakerControlTooltipRowToBorder: {
      borderTopColor: theme.color.grey_400,
      borderTopWidth: 1,
    },
    swapCamera: {
      borderColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
      borderWidth: theme.border.width,
      height: undefined,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_4 + UI_SIZE_2,
      width: undefined,
    },
    tooltipContainer: {
      backgroundColor: theme.color.grey_500,
      borderRadius: UI_SIZE_12,
    },
    tooltipContentStyle: {
      bottom: TOOL_TIP_BOTTOM,
      left: TOOL_TIP_LEFT,
      position: 'absolute',
      width: TOOL_TIP_WIDTH,
    },
    whiteIcon: {
      backgroundColor: colors.white_snow,
    },
    wrapper: {
      ...s.row,
      ...s.centeredLayout,
      paddingVertical: UI_SIZE_16,
    },
  })
  return styles
})

const ICON_WIDTH = ICON_SIZE_72
const ICON_HEIGHT = UI_SIZE_48
const ICON_MARGIN = UI_SIZE_4
const TOOL_TIP_WIDTH = 150
const TOOL_TIP_LEFT = -(TOOL_TIP_WIDTH / 2 - ICON_WIDTH / 2)
const TOOL_TIP_BOTTOM = ICON_HEIGHT + ICON_MARGIN + UI_SIZE_4
