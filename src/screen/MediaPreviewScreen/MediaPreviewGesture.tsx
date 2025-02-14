import React, { memo, ReactNode } from 'react'
import {
  FlexStyle,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import isEqual from 'react-fast-compare'
import {
  ComposedGesture,
  GestureDetector,
  NativeGesture,
  PanGesture,
} from 'react-native-gesture-handler'
import Animated, { AnimatedStyle } from 'react-native-reanimated'

import { createThemedStylesheetWithHooks } from 'component/theme'
import { FileStatsBar } from 'screen/RoomScreen/ChatEvent/FileStatsBar'

import { useMediaPreviewOffset } from './useMediaPreviewOffset'

interface MediaPreviewGestureProps {
  gesture: ComposedGesture | PanGesture | NativeGesture
  children: ReactNode
  style?: StyleProp<AnimatedStyle<FlexStyle>>
  fileId: string
  priority: 'focused' | 'focusedReady' | 'next' | 'nextReady' | 'hidden'
}

export const MediaPreviewGesture = memo(
  ({
    gesture,
    children,
    style,
    fileId,
    priority,
  }: MediaPreviewGestureProps) => {
    const styles = useStyles()

    return (
      <View style={styles.gesture} renderToHardwareTextureAndroid>
        <GestureDetector gesture={gesture}>
          {style ? (
            <Animated.View style={style}>{children}</Animated.View>
          ) : (
            children
          )}
        </GestureDetector>
        {priority === 'focusedReady' && (
          <View style={styles.statsBar}>
            <FileStatsBar fileId={fileId} isWithStreamingLabel />
          </View>
        )}
      </View>
    )
  },
  isEqual,
)

const useStyles = createThemedStylesheetWithHooks(
  (_, { width, statsBarOffset }) => {
    const styles = StyleSheet.create({
      gesture: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        width,
      },
      statsBar: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: statsBarOffset,
      },
    })
    return styles
  },
  () => {
    const { width } = useWindowDimensions()
    const { statsBarOffset } = useMediaPreviewOffset()

    return { width, statsBarOffset }
  },
)
