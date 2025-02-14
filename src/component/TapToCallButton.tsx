import React, { memo, useCallback, useEffect } from 'react'
import { StyleSheet, Text } from 'react-native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'

// @ts-ignore
import { getAppCurrentCallRoomId } from '@holepunchto/keet-store/store/app'
import {
  CALL_STATUS,
  getCallStatus,
  // @ts-ignore
} from '@holepunchto/keet-store/store/call'
import { switchRoomSubmit } from '@holepunchto/keet-store/store/room'

import { ButtonBase } from 'component/Button'
import {
  colors,
  createThemedStylesheet,
  useReanimatedLayoutAnimation,
} from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import s, {
  ICON_SIZE_20,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
} from 'lib/commonStyles'
import { navigate, SCREEN_ROOM_CALL } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import SvgIcon from './SvgIcon'

const BUTTON_HEIGHT = 40
const BUTTON_OFFSET = UI_SIZE_12

const TapToCallButton = () => {
  const strings = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()
  const callStatus = useSelector(getCallStatus, shallowEqual)
  const currentCallRoomId = useSelector(getAppCurrentCallRoomId, shallowEqual)
  const scale = useSharedValue(1)
  const { layout } = useReanimatedLayoutAnimation()
  const isFocused = useIsFocused()
  const callBtnOffset = useSharedValue(0)

  useFocusEffect(
    useCallback(() => {
      callBtnOffset.value = withSpring(1)

      return () => {
        callBtnOffset.set(0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      callBtnOffset.value,
      [0, 1],
      [BUTTON_HEIGHT, BUTTON_HEIGHT + BUTTON_OFFSET],
    ),
  }))

  const onTapToCall = useCallback(() => {
    if (currentCallRoomId) {
      dispatch(switchRoomSubmit({ roomId: currentCallRoomId }))
      navigate(SCREEN_ROOM_CALL, {
        roomId: currentCallRoomId,
        shouldToggleMicrophoneAtInit: false,
      })
    }
  }, [currentCallRoomId, dispatch])

  useEffect(() => {
    if (isFocused) {
      scale.value = withRepeat(withTiming(0.97, { duration: 800 }), -1, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused])

  if (callStatus !== CALL_STATUS.JOINED || !isFocused) return null

  return (
    <Animated.View style={containerAnimatedStyle}>
      <ButtonBase
        onPress={onTapToCall}
        style={[s.row, s.centeredLayout, styles.button, animatedStyle]}
        layout={layout}
        testID={APPIUM_IDs.lobby_tap_to_call}
      >
        <SvgIcon
          name="phoneFilled"
          color={colors.keet_almostBlack}
          width={ICON_SIZE_20}
          height={ICON_SIZE_20}
        />
        <Text style={styles.text}>{strings.call.tapToCall}</Text>
      </ButtonBase>
    </Animated.View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.color.green_400,
      borderColor: theme.color.red_300,
      borderRadius: UI_SIZE_8,
      borderWidth: 1,
      height: BUTTON_HEIGHT,
      marginBottom: BUTTON_OFFSET,
      marginHorizontal: BUTTON_OFFSET,
      paddingVertical: 0,
      shadowColor: theme.color.red_300,
    },
    text: {
      ...theme.text.title,
      color: theme.color.almost_black,
      fontSize: UI_SIZE_14,
      paddingLeft: UI_SIZE_8,
    },
  })
  return styles
})

export default memo(TapToCallButton)
