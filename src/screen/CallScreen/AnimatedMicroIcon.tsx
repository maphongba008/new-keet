import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { Path, Svg } from 'react-native-svg'

import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s from 'lib/commonStyles'

import { AnimatedMicroIconProps } from './type'

export const AnimatedMicroIcon = ({
  isSpeaking,
  volume = 1,
  isMuted,
  style,
}: AnimatedMicroIconProps) => {
  const styles = getStyles()
  const animation = useSharedValue(0)

  useEffect(() => {
    animation.value = isSpeaking ? volume : 0
  }, [animation, isSpeaking, volume])
  const animatedStyle = useAnimatedStyle(() => ({
    height: isMuted ? 0 : interpolate(animation.value, [0, 1], [0, 11]),
  }))
  const theme = useTheme()

  return (
    <Svg style={style} width={24} height={22} viewBox="0 0 24 22" fill="none">
      <View style={styles.container}>
        <Animated.View style={[styles.animatedContainer, animatedStyle]} />
      </View>
      <Path
        d="M13.6875 5.625C13.6875 4.71094 12.9141 3.9375 12 3.9375C11.0508 3.9375 10.3125 4.71094 10.3125 5.625V11.25C10.3125 12.1992 11.0508 12.9375 12 12.9375C12.9141 12.9375 13.6875 12.1992 13.6875 11.25V5.625ZM8.625 5.625C8.625 3.76172 10.1367 2.25 12 2.25C13.8633 2.25 15.375 3.76172 15.375 5.625V11.25C15.375 13.1133 13.8633 14.625 12 14.625C10.1367 14.625 8.625 13.1133 8.625 11.25V5.625ZM7.5 9.84375V11.25C7.5 13.7461 9.50391 15.75 12 15.75C14.4609 15.75 16.5 13.7461 16.5 11.25V9.84375C16.5 9.38672 16.8516 9 17.3438 9C17.8008 9 18.1875 9.38672 18.1875 9.84375V11.25C18.1875 14.4141 15.832 16.9805 12.8438 17.4023V18.5625H14.5312C14.9883 18.5625 15.375 18.9492 15.375 19.4062C15.375 19.8984 14.9883 20.25 14.5312 20.25H12H9.46875C8.97656 20.25 8.625 19.8984 8.625 19.4062C8.625 18.9492 8.97656 18.5625 9.46875 18.5625H11.1562V17.4023C8.13281 16.9805 5.8125 14.4141 5.8125 11.25V9.84375C5.8125 9.38672 6.16406 9 6.65625 9C7.11328 9 7.5 9.38672 7.5 9.84375Z"
        fill={isMuted ? colors.white_snow : theme.color.blue_400}
      />
      {isMuted && (
        <Path
          d="M0.925781 2.60156C1.20703 2.21484 1.73438 2.14453 2.08594 2.46094L22.8984 18.7734C23.2852 19.0547 23.3555 19.582 23.0391 19.9336C22.7578 20.3203 22.2305 20.3906 21.8789 20.0742L1.06641 3.76172C0.679688 3.48047 0.609375 2.95312 0.925781 2.60156Z"
          fill={theme.color.red_400}
        />
      )}
    </Svg>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    animatedContainer: {
      alignSelf: 'center',
      backgroundColor: theme.color.blue_400,
      bottom: 8,
      position: 'absolute',
      width: 4,
    },
    container: {
      ...s.fullHeight,
      ...s.fullWidth,
      ...s.alignItemsCenter,
    },
  })
  return styles
})
