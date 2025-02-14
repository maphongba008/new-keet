import React, { memo, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { getRoomPairingCount } from '@holepunchto/keet-store/store/room'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_16,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { navigate, SCREEN_PAIRING_ROOMS } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const RoomsPairingTitle = memo(() => {
  const styles = getStyles()
  const strings = useStrings()

  const height = useSharedValue(0)
  const [contentHeight, setContentHeight] = useState(0)
  const pairingRoomsCount = useDeepEqualSelector(getRoomPairingCount)

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height) // Measure content height
  }, [])

  const onPress = useCallback(() => {
    navigate(SCREEN_PAIRING_ROOMS)
  }, [])

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: withTiming(height.value, { duration: 300 }), // Animate height
      opacity: withTiming(height.value > 0 ? 1 : 0, { duration: 300 }), // Animate opacity to 0 when collapsing to 0 height
    }
  })

  useEffect(() => {
    if (pairingRoomsCount > 0 && height.value <= contentHeight) {
      height.value = contentHeight
    } else if (pairingRoomsCount === 0 && height.value > 0) {
      height.value = 0
    }
  }, [contentHeight, height, pairingRoomsCount])

  return (
    <Animated.View style={animatedStyles}>
      <ButtonBase
        {...appiumTestProps(APPIUM_IDs.lobby_joining_rooms)}
        style={styles.container}
        onPress={onPress}
        onLayout={onContentLayout}
      >
        <SvgIcon
          name="clock"
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
          color={colors.white_snow}
        />
        <Text style={styles.text}>{strings.lobby.joiningRoom}</Text>
        <Text style={styles.countText}>{pairingRoomsCount}</Text>
        <SvgIcon name="chevronRight" color={colors.keet_grey_200} />
      </ButtonBase>
    </Animated.View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.centerAlignedRow,
      borderBottomWidth: 1,
      borderColor: colors.keet_grey_600,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    countText: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    text: {
      ...theme.text.body,
      ...s.container,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_12,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default RoomsPairingTitle
