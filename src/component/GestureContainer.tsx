import { ReactNode } from 'react'
import { useWindowDimensions, ViewProps } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import s, { height } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { back } from 'lib/navigation'
import { isAndroid } from 'lib/platform'

import { isRTL } from 'i18n/strings'

export type Directions = 'horizontal' | 'vertical' | 'both'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)
const END_POSITION = 30

type ChildrenFunction = (data: any) => JSX.Element

interface GestureDetectorProps {
  children: ChildrenFunction | ReactNode
  swipeDistance?: number
  direction?: Directions
  enabled?: boolean
  disableLeftSwipe?: boolean
  containerStyle?: ViewProps['style']
  skipDirections?: boolean
  onSwipeBack?: () => void
}

const GestureContainer = ({
  children,
  containerStyle = {},
  swipeDistance = END_POSITION,
  direction = 'horizontal',
  enabled = isAndroid,
  skipDirections = isRTL,
  disableLeftSwipe = !isRTL,
  onSwipeBack,
}: GestureDetectorProps) => {
  const { width } = useWindowDimensions()
  const position = useSharedValue(0)
  const pause = useSharedValue(false)
  const context = useSharedValue({ x: 0, y: 0 })
  const translationX = useSharedValue(0)
  const translationY = useSharedValue(0)
  const directionKey =
    direction === 'horizontal' ? 'translationX' : 'translationY'
  const screenEdgeThreshold = width / 4

  const swipeBack = () => {
    back()
    if (onSwipeBack) {
      runOnJS(onSwipeBack)
    }
  }

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .minDistance(swipeDistance)
    .onStart(() => {
      context.value = { x: translationX.value, y: translationY.value }
    })
    .onUpdate((e) => {
      if (!pause.value) {
        const difference = e[directionKey]
        if (direction === 'horizontal') {
          // Enable gesture only from edges
          if (isRTL) {
            if (
              Math.sign(e[directionKey]) === 1 ||
              e.x < width - screenEdgeThreshold
            )
              return
          }
          if (!isRTL && e.x > screenEdgeThreshold) return
          translationX.value =
            disableLeftSwipe && difference < 0
              ? 0
              : difference + context.value.x
        } else {
          translationY.value = difference + context.value.y
        }
        const change = skipDirections ? Math.abs(difference) : difference
        // For swipe back , do not track change when it's swipe right to left (-ve)
        if (change < 0) {
          position.value = 0
          pause.value = true
        } else {
          position.value = change
        }
      }
    })
    .onEnd(() => {
      if (position.value > swipeDistance) {
        runOnJS(swipeBack)()
      } else {
        translationX.value = 0
        translationY.value = 0
      }
      position.value = 0
      pause.value = false
    })

  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: clamp(translationX.value, -width / 3, width / 3),
      },
      {
        translateY: clamp(translationY.value, -height / 4, height / 4),
      },
    ],
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedSafeAreaView
        style={[
          s.container,
          containerStyle,
          typeof children !== 'function' && transformStyle, // Apply pan gesture transforms on the parent container view itself
        ]}
        edges={SAFE_EDGES}
      >
        {typeof children === 'function'
          ? children({ transformStyle }) // pass transformStyle to child container to apply pan gesture transforms
          : children}
      </AnimatedSafeAreaView>
    </GestureDetector>
  )
}

export default GestureContainer
