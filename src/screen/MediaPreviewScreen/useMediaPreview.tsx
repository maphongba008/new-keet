import { useCallback, useState } from 'react'
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import { colors } from 'component/theme'
import { MediaPreviewPosition } from 'screen/MediaPreviewScreen'
import { UI_SIZE_8 } from 'lib/commonStyles'
import {
  lockScreenPortraitUpAsync,
  unlockScreenAsync,
} from 'lib/screenOrientation'

import { useMediaPreviewSizes } from './useMediaPreviewSizes'
import { useMediaTransform } from './useMediaTransform'

type PreviewType = {
  position: MediaPreviewPosition
  onRequestClose: () => void
  aspectRatio?: number
}

export const MEDIA_FOCUSED_SEEN_INDEX = -1

const useMediaPreview = ({
  aspectRatio,
  position,
  onRequestClose,
}: PreviewType) => {
  const {
    topInset,
    leftInset,
    scaleX: initScaleX,
    scaleY: initScaleY,
    height,
    width,
  } = useMediaPreviewSizes({
    aspectRatio: aspectRatio || 1,
    ...position,
  })
  const [isMounted, setIsMounted] = useState(false)
  const [isViewFocused, setIsViewFocused] = useState(true)
  const isAnimating = useSharedValue(true)

  const mountStateChange = useCallback(() => {
    'worklet'
    runOnJS(unlockScreenAsync)()
    runOnJS(setIsMounted)(true)
    isAnimating.value = false
  }, [isAnimating])

  const unmountStateChange = useCallback(() => {
    'worklet'
    isAnimating.value = true
    runOnJS(setIsMounted)(false)
    runOnJS(lockScreenPortraitUpAsync)()
  }, [isAnimating])

  const handleViewFocus = useCallback(() => {
    'worklet'
    runOnJS(setIsViewFocused)(!isViewFocused)
  }, [isViewFocused])

  const {
    imageGestureEvent,
    videoGestureEvent,
    translateY: _translationY,
    translateX: _translationX,
    scale: _scale,
    opacity: backgroundOpacity,
    mountTransition,
    unmountTransition,
    offset,
    isScrollEnabled,
  } = useMediaTransform({
    height,
    width,
    handleViewFocus,
    unmountStateChange,
    mountStateChange,
    onRequestClose,
  })

  const animatedImageStyle = useAnimatedStyle(() => {
    const interpolateOffset = (startValue: number, endValue: number) => {
      'worklet'
      return interpolate(
        offset.value,
        [0, 1],
        [startValue, endValue],
        Extrapolation.CLAMP,
      )
    }

    let translateX = _translationX.value,
      scaleX = _scale.value,
      scaleY = _scale.value,
      borderRadius = 0,
      translateY = _translationY.value

    if (isAnimating.value) {
      translateY = interpolateOffset(topInset, translateY)
      translateX = interpolateOffset(leftInset, translateX)
      scaleX = interpolateOffset(initScaleX, 1)
      scaleY = interpolateOffset(initScaleY, 1)
      borderRadius = interpolateOffset(UI_SIZE_8 * 2, 0)
    }

    return {
      transform: [{ translateY }, { translateX }, { scaleX }, { scaleY }],
      borderRadius,
    }
  })

  const staticImageStyle = useAnimatedStyle(() => {
    return {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }
  })

  const paperViewProps = useAnimatedProps(() => ({
    scrollEnabled: isScrollEnabled.value,
  }))
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.black,
    opacity: backgroundOpacity.value,
  }))

  return {
    imageGestureEvent,
    videoGestureEvent,
    animatedImageStyle,
    staticImageStyle,
    overlayAnimatedStyle,
    mountTransition,
    onClosePreview: unmountTransition,
    paperViewProps,
    isMounted,
    isViewFocused,
  }
}
export default useMediaPreview
