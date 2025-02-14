import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { KeyboardGestureArea } from 'react-native-keyboard-controller'
import { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { useKeyboardAnimation } from 'lib/hooks/useKeyboardAnimation'

export interface InteractiveKeyboardI {
  contentStyle?: StyleProp<ViewStyle>
}

export const withInteractiveKeyboard =
  (WrappedComponent: any) => (props: any) => {
    const styles = getStyles()
    const { bottom: safeAreaBottomPadding } = useSafeAreaInsets()
    const { height, duration } = useKeyboardAnimation()

    const animationConfig = useMemo(
      () => ({
        duration: duration.value,
        easing: Easing.inOut(Easing.ease),
      }),
      [duration.value],
    )

    const contentStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: withTiming(-height.value, animationConfig) }],
    }))

    return (
      <KeyboardGestureArea
        style={styles.container}
        offset={safeAreaBottomPadding}
        interpolator="ios"
        enableSwipeToDismiss={false}
      >
        <WrappedComponent {...props} contentStyle={contentStyle} />
      </KeyboardGestureArea>
    )
  }

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    container: {
      ...s.container,
    },
  })
  return styles
})

export default withInteractiveKeyboard
