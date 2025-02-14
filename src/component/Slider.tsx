import React, { memo, useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import _debounce from 'lodash/debounce'
import _includes from 'lodash/includes'
import _noop from 'lodash/noop'

import s, { UI_SIZE_6, UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'

import { createThemedStylesheet } from './theme'

type SliderProps = {
  style?: Object | Array<Object>
  minimumTrackTintColor?: string | null
  maximumTrackTintColor?: string | null
  value: number
  minimumValue?: number
  maximumValue?: number
  onValueChange?: Function
  onSlidingStart?: (...args: unknown[]) => unknown
  onSlidingComplete?: (sliderValue: number) => unknown | Promise<void>
  disabled?: boolean
  offset?: number
  thumbVisible?: boolean
}

const DEFAULT_OFFSET = UI_SIZE_6 // a half of thumb's size

const isTrackLineVisible = (value: string | null | undefined) =>
  !_includes(['transparent', ''], value)

const Slider = ({
  style = {},
  minimumTrackTintColor,
  maximumTrackTintColor,
  value = 0,
  minimumValue = 0,
  maximumValue = 0,
  onValueChange = _noop,
  onSlidingStart = _noop,
  onSlidingComplete = _noop,
  disabled = false,
  offset = DEFAULT_OFFSET,
  thumbVisible = true,
}: SliderProps) => {
  const styles = getStyles()
  const width = useSharedValue(0)
  const translationX = useSharedValue(0)
  const opacity = useSharedValue(0)
  const prevTranslationX = useSharedValue(-100)
  const onTouch = useSharedValue(false)

  const sliderWidth = useDerivedValue(() => width.value / 2 - offset)
  const minThumbLine = useDerivedValue(() =>
    interpolate(value, [minimumValue, maximumValue], [0, width.value]),
  )
  const maxThumbLine = useDerivedValue(() =>
    interpolate(value, [minimumValue, maximumValue], [width.value, 0]),
  )

  const thumbAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
    opacity: opacity.value,
  }))

  const minimumTrackAnimatedStyles = useAnimatedStyle(() => ({
    width: minThumbLine.value,
    ...(minimumTrackTintColor
      ? { backgroundColor: minimumTrackTintColor }
      : {}),
  }))
  const maxmimumTrackAnimatedStyles = useAnimatedStyle(() => ({
    width: maxThumbLine.value,
    ...(maximumTrackTintColor
      ? { backgroundColor: maximumTrackTintColor }
      : {}),
  }))

  const handleValueChange = useCallback(() => {
    if (sliderWidth.value < 0 || onTouch.value) return
    translationX.value = withTiming(
      interpolate(
        value,
        [minimumValue, maximumValue],
        [-sliderWidth.value, sliderWidth.value],
      ),
      { duration: 100 },
    )
  }, [
    sliderWidth.value,
    onTouch.value,
    translationX,
    value,
    minimumValue,
    maximumValue,
  ])

  useEffect(() => {
    handleValueChange()
  }, [handleValueChange])

  const handleOnLayout = useCallback(
    ({ nativeEvent }: { nativeEvent: { layout: { width: number } } }) => {
      const layoutWidth = nativeEvent?.layout?.width
      if (layoutWidth < 0) return
      width.value = layoutWidth
      translationX.value = -(layoutWidth / 2 - offset)
      if (!opacity.value) {
        opacity.value = 1
      }
    },
    [opacity, translationX, width, offset],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSliderChange = useCallback(
    _debounce((sliderValue) => onValueChange(sliderValue)),
    [],
  )

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      prevTranslationX.value = translationX.value
      onTouch.value = true
      runOnJS(onSlidingStart)()
    })
    .onChange((event) => {
      const maxTranslateX = sliderWidth.value
      const nextPos = prevTranslationX.value + event.translationX
      translationX.value = clamp(
        prevTranslationX.value + event.translationX,
        -maxTranslateX,
        maxTranslateX - offset,
      )
      const sliderValue = interpolate(
        translationX.value,
        [
          -sliderWidth.value,
          nextPos >= sliderWidth.value
            ? sliderWidth.value - offset
            : sliderWidth.value,
        ],
        [minimumValue, maximumValue],
      )
      runOnJS(handleSliderChange)(sliderValue)
    })
    .onEnd(() => {
      const sliderValue = interpolate(
        translationX.value,
        [-sliderWidth.value, sliderWidth.value],
        [minimumValue, maximumValue],
      )
      onTouch.value = false
      runOnJS(onSlidingComplete)(sliderValue)
    })

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, style]} onLayout={handleOnLayout}>
        <Animated.View
          style={[thumbVisible && styles.thumb, thumbAnimatedStyles]}
          hitSlop={UI_SIZE_20}
        />
        <View style={styles.trackLineContainer}>
          {isTrackLineVisible(minimumTrackTintColor) && (
            <Animated.View
              style={[styles.minimumTrackLine, minimumTrackAnimatedStyles]}
            />
          )}
          {isTrackLineVisible(maximumTrackTintColor) && (
            <Animated.View
              style={[styles.maximumTrackLine, maxmimumTrackAnimatedStyles]}
            />
          )}
        </View>
      </View>
    </GestureDetector>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.centeredLayout,
    },
    maximumTrackLine: {
      backgroundColor: theme.color.grey_500,
      borderRadius: theme.border.radiusNormal,
      height: 5,
    },
    minimumTrackLine: {
      backgroundColor: theme.color.blue_400,
      borderRadius: theme.border.radiusNormal,
      height: 5,
    },
    thumb: {
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_16,
      height: UI_SIZE_16,
      position: 'absolute',
      width: UI_SIZE_16,
      zIndex: 2,
    },
    trackLineContainer: {
      ...s.row,
    },
  })
  return styles
})

export default memo(Slider, isEqual)
