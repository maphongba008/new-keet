/* eslint-disable react/jsx-no-bind */
import React, { memo, useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native'
import {
  GestureEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { createThemedStylesheet } from './theme'

export const InteractiveKeyboard = memo(() => {
  const styles = getStyles()
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const translateY = useSharedValue(0)

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height)
        translateY.value = withTiming(-event.endCoordinates.height, {
          duration: 300,
        })
      },
    )

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      translateY.value = withTiming(0, { duration: 300 })
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const handleGesture = (
    event: GestureEvent<PanGestureHandlerEventPayload>,
  ) => {
    if (event.nativeEvent.translationY > 50) {
      Keyboard.dismiss()
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View style={[styles.inputContainer, animatedStyle]}>
          <TextInput
            placeholder="Type a message..."
            style={styles.textInput}
            onFocus={() =>
              (translateY.value = withTiming(-keyboardHeight, {
                duration: 300,
              }))
            }
          />
        </Animated.View>
      </PanGestureHandler>
    </KeyboardAvoidingView>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    // eslint-disable-next-line react-native/no-color-literals
    container: {
      backgroundColor: '#f4f4f4',
      flex: 1,
    },
    // eslint-disable-next-line react-native/no-color-literals
    inputContainer: {
      backgroundColor: theme.color.grey_000,
      borderColor: '#ddd',
      borderTopWidth: 1,
      bottom: 0,
      left: 0,
      padding: 10,
      position: 'absolute',
      right: 0,
    },
    // eslint-disable-next-line react-native/no-color-literals
    textInput: {
      backgroundColor: '#f9f9f9',
      borderColor: '#ccc',
      borderRadius: 20,
      borderWidth: 1,
      height: 40,
      paddingHorizontal: 10,
    },
  })

  return styles
})
