import React, { memo, useCallback, useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import isEqual from 'react-fast-compare'
import { Swipeable } from 'react-native-gesture-handler'

import { UI_SIZE_4, UI_SIZE_14 } from 'lib/commonStyles'

import { ButtonBase } from './Button'
import { createThemedStylesheet } from './theme'

export type SwipeableButton = {
  text: string
  onPress?: () => void
  icon: any
  backgroundColor?: string
  disabled?: boolean
  testID?: string
}

export type SwipeableViewProps = {
  children: any
  buttons: SwipeableButton[]
  onOpen?: () => void
  onClose?: () => void
  isOpen?: boolean
}

const BUTTON_WIDTH = 72
const ChildButtons = memo(
  ({ btn, onPress }: { btn: SwipeableButton; onPress: () => void }) => {
    const styles = getStyles()
    const onBtnPress = useCallback(() => {
      onPress() // close the swipeable
      btn.onPress && btn.onPress()
    }, [btn, onPress])

    return (
      <ButtonBase
        onPress={onBtnPress}
        style={[styles.iconButton, { backgroundColor: btn.backgroundColor }]}
        disabled={btn.disabled}
        testID={btn.testID}
      >
        {btn.icon}
        <Text style={styles.iconText}>{btn.text}</Text>
      </ButtonBase>
    )
  },
  isEqual,
)

const RightActions = memo(
  ({
    progress,
    buttons,
    onPress,
  }: {
    progress: Animated.AnimatedInterpolation<number>
    buttons: SwipeableButton[]
    onPress: () => void
  }) => {
    const styles = getStyles()
    const animatedStyle = {
      transform: [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [buttons.length * BUTTON_WIDTH, 0],
            extrapolate: 'clamp',
          }),
        },
      ],
    }

    return (
      <Animated.View style={[animatedStyle, styles.buttonContainer]}>
        {buttons.map((btn) => (
          <ChildButtons btn={btn} onPress={onPress} key={btn.text} />
        ))}
      </Animated.View>
    )
  },
  isEqual,
)

export const SwipeableView = memo(
  ({ children, isOpen, buttons = [], ...props }: SwipeableViewProps) => {
    const mRef = useRef<Swipeable | null>(null)
    const onPress = () => {
      mRef.current?.close()
    }

    useEffect(() => {
      if (!isOpen) {
        mRef.current?.close()
      }
    }, [isOpen])

    const renderRightActions = useCallback(
      (progress: Animated.AnimatedInterpolation<string | number>) => (
        <RightActions {...{ onPress, progress, buttons }} />
      ),
      [buttons],
    )
    return (
      <Swipeable
        onSwipeableWillOpen={props.onOpen}
        onSwipeableWillClose={props.onClose}
        ref={mRef}
        renderRightActions={renderRightActions}
      >
        {children}
      </Swipeable>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
    },
    iconButton: {
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      width: BUTTON_WIDTH,
    },
    iconText: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_4,
    },
  })
  return styles
})
