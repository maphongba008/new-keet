import { useCallback, useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import {
  cancelAnimation,
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SpringConfig } from 'react-native-reanimated/lib/typescript/animation/springUtils.js'

interface MediaTransformParams {
  height: number
  width: number
  mountStateChange: () => void
  unmountStateChange: () => void
  onRequestClose: () => void
  handleViewFocus: () => void
}

const MIN_ZOOM_SCALE = 1
const MAX_ZOOM_SCALE = 3
const PINCH_MAX_ZOOM_SCALE = MAX_ZOOM_SCALE * 2
const BG_OPACITY_ANIMATED_DURATION = 100

export const useMediaTransform = ({
  height: maxHeight,
  width: maxWidth,
  mountStateChange,
  unmountStateChange,
  onRequestClose,
  handleViewFocus,
}: MediaTransformParams) => {
  /**
   * SpringConfig is a discriminated union that requires you to choose between two configurations:
   * 1. Mass-based spring (using mass and damping)
   * 2. Duration-based spring (using duration and dampingRatio)
   */
  const config: SpringConfig = useMemo(
    () => ({
      stiffness: 100,
      overshootClamping: true,
      restDisplacementThreshold: 0.5,
      restSpeedThreshold: 5,
      duration: 300,
    }),
    [],
  )

  const isScrollEnabled = useSharedValue(false)

  const offset = useSharedValue(0)
  const opacity = useSharedValue(0)

  const _scale = useSharedValue(1)
  const _translationX = useSharedValue(0)
  const _translationY = useSharedValue(0)
  const _viewHeight = useSharedValue(maxHeight)
  const _viewWidth = useSharedValue(maxWidth)

  const _prevTranslationX = useSharedValue(0)
  const _prevTranslationY = useSharedValue(0)
  const _panTranslateX = useSharedValue(0)
  const _panTranslateY = useSharedValue(0)

  const _originX = useSharedValue(0)
  const _originY = useSharedValue(0)
  const _prevScale = useSharedValue(0)
  const _isPinching = useSharedValue(false)
  const _isZoomed = useSharedValue(false)
  const _offsetScale = useSharedValue(0)
  const touchStart = useSharedValue({ x: 0, y: 0 })
  const adjustedFocal = useSharedValue({ x: 0, y: 0 })

  const resetZoomState = useCallback(() => {
    'worklet'
    // reset all state
    _translationX.value = withTiming(0)
    _translationY.value = withTiming(0)
    _scale.value = withTiming(1)
    _originX.value = 0
    _originY.value = 0
    _isPinching.value = false
    _prevScale.value = 0
    _prevTranslationX.value = 0
    _prevTranslationY.value = 0
    _panTranslateX.value = 0
    _panTranslateY.value = 0
  }, [
    _isPinching,
    _originX,
    _originY,
    _panTranslateX,
    _panTranslateY,
    _prevScale,
    _prevTranslationX,
    _prevTranslationY,
    _scale,
    _translationX,
    _translationY,
  ])

  const mountTransition = useCallback(() => {
    'worklet'
    offset.value = withSpring(1, config, (isFinished) => {
      if (isFinished) {
        mountStateChange()
        isScrollEnabled.value = true
      }
    })
    opacity.value = withSpring(1, {
      ...config,
      duration: BG_OPACITY_ANIMATED_DURATION,
    })
  }, [config, isScrollEnabled, mountStateChange, offset, opacity])

  const unmountTransition = useCallback(() => {
    'worklet'
    isScrollEnabled.value = false
    unmountStateChange()
    opacity.value = withSpring(0, config)
    offset.value = withSpring(0, config, () => {
      resetZoomState()
      runOnJS(onRequestClose)()
    })
  }, [
    isScrollEnabled,
    unmountStateChange,
    resetZoomState,
    opacity,
    config,
    offset,
    onRequestClose,
  ])

  const setAdjustedFocalPoint = useCallback(
    ({ focalX, focalY }: any) => {
      'worklet'
      const offsetX = focalX - _viewWidth.value / 2
      const offsetY = Math.max(
        Math.min(
          (focalY - _viewHeight.value) / 2,
          (_viewHeight.value * 2 - focalY) / 2,
        ),
        0,
      )
      adjustedFocal.value.x = offsetX
      adjustedFocal.value.y = offsetY
    },
    [adjustedFocal.value, _viewHeight.value, _viewWidth.value],
  )

  const [imageGestureEvent, videoGestureEvent] = useMemo(() => {
    const pinch = Gesture.Pinch()
      .onStart(() => {
        cancelAnimation(_translationX)
        cancelAnimation(_translationY)
        cancelAnimation(_scale)
        _prevScale.value = _scale.value
        _offsetScale.value = _scale.value
      })
      .onUpdate((e) => {
        // when pointer is 1 we don't want to translate origin
        if (e.numberOfPointers === 1 && _isPinching.value) {
          _prevTranslationX.value = _translationX.value
          _prevTranslationY.value = _translationY.value
          _isPinching.value = false
        } else if (e.numberOfPointers === 2) {
          const newScale = _prevScale.value * e.scale

          if (newScale < MIN_ZOOM_SCALE || newScale > PINCH_MAX_ZOOM_SCALE)
            return

          _scale.value = _prevScale.value * e.scale

          // reset the origin
          if (!_isPinching.value) {
            _isPinching.value = true
            _originX.value = e.focalX
            _originY.value = e.focalY
            _prevTranslationX.value = _translationX.value
            _prevTranslationY.value = _translationY.value
            _offsetScale.value = _scale.value
          }

          if (_isPinching.value) {
            // translate the image to the focal point as we're zooming
            _translationX.value =
              _prevTranslationX.value +
              -1 *
                ((_scale.value - _offsetScale.value) *
                  (_originX.value - _viewWidth.value / 2))
            _translationY.value =
              _prevTranslationY.value +
              -1 *
                ((_scale.value - _offsetScale.value) *
                  (_originY.value - _viewHeight.value / 2))
          }
        }
      })
      .onEnd(() => {
        _isPinching.value = false
        _prevTranslationX.value = _translationX.value
        _prevTranslationY.value = _translationY.value

        if (_scale.value < 1.1) {
          resetZoomState()
        }
      })

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd((e) => {
        const scaledImageWidth = _viewWidth.value * MAX_ZOOM_SCALE
        const scaledImageHeight = _viewHeight.value * MAX_ZOOM_SCALE

        const maxTranslateX = (scaledImageWidth - _viewWidth.value) / 2
        const maxTranslateY = (scaledImageHeight - _viewHeight.value) / 2

        setAdjustedFocalPoint({ focalX: e.x, focalY: e.y })

        // if zoomed in or zoomed out, we want to reset
        if (_scale.value !== 1) {
          resetZoomState()
        } else {
          // translate the image to the focal point and zoom
          _scale.value = withTiming(MAX_ZOOM_SCALE)
          _translationX.value = withTiming(
            clamp(
              -1 * adjustedFocal.value.x * MAX_ZOOM_SCALE,
              -maxTranslateX,
              maxTranslateX,
            ),
          )
          _translationY.value = withTiming(
            clamp(
              -1 * adjustedFocal.value.y * MAX_ZOOM_SCALE,
              -maxTranslateY,
              maxTranslateY,
            ),
          )
        }
      })

    const pan = Gesture.Pan()
      .manualActivation(true)
      .onTouchesDown((e) => {
        touchStart.value = {
          x: e.changedTouches[0].x,
          y: e.changedTouches[0].y,
        }
      })
      .onTouchesMove((e, state) => {
        if (
          e.eventType === 2 &&
          touchStart.value.y - e.changedTouches[0].y < 0
        ) {
          isScrollEnabled.value = false
          return state.activate()
        }
        if (_isPinching.value || _isZoomed.value) {
          isScrollEnabled.value = false
          return state.activate()
        }

        return state.fail()
      })
      .onStart((_) => {
        if (_isPinching.value || !_isZoomed.value) return

        cancelAnimation(_translationX)
        cancelAnimation(_translationY)
        cancelAnimation(_scale)

        _prevTranslationX.value = _translationX.value
        _prevTranslationY.value = _translationY.value
      })
      .onUpdate((e) => {
        'worklet'

        if (_isPinching.value || !_isZoomed.value) {
          const interpolateValue = e.translationY
          _translationY.value = interpolateValue
          opacity.value = interpolate(
            interpolateValue,
            [0, maxHeight / 2],
            [1, 0.4],
            Extrapolation.CLAMP,
          )
          return
        } else {
          // imagine what happens to pixels when we zoom in. (they get multiplied by x times scale)
          const maxTranslateX =
            (_viewWidth.value / 2) * _scale.value - _viewWidth.value / 2
          const minTranslateX = -maxTranslateX

          const maxTranslateY =
            (_viewHeight.value / 2) * _scale.value - _viewHeight.value / 2
          const minTranslateY = -maxTranslateY

          const nextTranslateX =
            _prevTranslationX.value + e.translationX - _panTranslateX.value
          const nextTranslateY =
            _prevTranslationY.value + e.translationY - _panTranslateY.value

          if (nextTranslateX > maxTranslateX) {
            _translationX.value = maxTranslateX
          } else if (nextTranslateX < minTranslateX) {
            _translationX.value = minTranslateX
          } else {
            _translationX.value = nextTranslateX
          }

          if (nextTranslateY > maxTranslateY) {
            _translationY.value = maxTranslateY
          } else if (nextTranslateY < minTranslateY) {
            _translationY.value = minTranslateY
          } else {
            _translationY.value = nextTranslateY
          }
          return
        }
      })
      .onEnd((event) => {
        'worklet'
        if (!_isPinching.value && !_isZoomed.value) {
          isScrollEnabled.value = true
          if (event.velocityY > 0 || event.translationY > 150) {
            return unmountTransition()
          } else {
            // transition media to full screen position
            opacity.value = withSpring(1)
          }
          return
        }
        if (_scale.value !== 0) {
          _panTranslateY.value = 0
          _panTranslateX.value = 0
          return
        }
      })
    const tapGesture = Gesture.Tap()
      .numberOfTaps(1)
      .onStart((_) => {
        'worklet'
        return handleViewFocus()
      })
    return [
      Gesture.Exclusive(
        Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan)),
        tapGesture,
      ),
      pan,
    ]
  }, [
    _translationX,
    _translationY,
    _scale,
    _prevScale,
    _offsetScale,
    _isPinching,
    _prevTranslationX,
    _prevTranslationY,
    _originX,
    _originY,
    _viewWidth.value,
    _viewHeight.value,
    resetZoomState,
    touchStart,
    _isZoomed.value,
    isScrollEnabled,
    opacity,
    maxHeight,
    _panTranslateX,
    _panTranslateY,
    unmountTransition,
    adjustedFocal.value,
    handleViewFocus,
    setAdjustedFocalPoint,
  ])

  useDerivedValue(() => {
    if (_scale.value > 1 && !_isZoomed.value) {
      _isZoomed.value = true
      isScrollEnabled.value = false
    } else if (_scale.value === 1 && _isZoomed.value) {
      _isZoomed.value = false
      isScrollEnabled.value = true
    }
  }, [])

  return {
    imageGestureEvent,
    videoGestureEvent,
    translateY: _translationY,
    translateX: _translationX,
    scale: _scale,
    opacity,
    offset,
    mountTransition,
    unmountTransition,
    isScrollEnabled,
  }
}
