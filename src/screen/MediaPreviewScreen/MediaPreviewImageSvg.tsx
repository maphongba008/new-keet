import React, { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { Image, ImageErrorEventData, ImageLoadEventData } from 'expo-image'
import isEqual from 'react-fast-compare'
import Animated from 'react-native-reanimated'
import { useSafeAreaFrame } from 'react-native-safe-area-context'

import { createThemedStylesheetWithHooks } from 'component/theme'

import { updateMediaPreviewFileEntry } from './MediaPreview.Store'
import { useMediaPreviewOffset } from './useMediaPreviewOffset'

interface MediaPreviewImageSvgProps {
  uri: string
  groupId: string
  onLoadEnd: () => void
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

export const MediaPreviewImageSvg = memo(
  ({ uri, groupId, onLoadEnd }: MediaPreviewImageSvgProps) => {
    const styles = useStyles()

    const source = { uri }

    const onError = useCallback((e: ImageErrorEventData) => {
      const errMsg = e?.error?.toLowerCase() || ''
      console.error('SVG preview error:', errMsg)
    }, [])

    const onLoad = useCallback(
      (e: ImageLoadEventData) => {
        const { width, height } = e.source
        onLoadEnd()
        updateMediaPreviewFileEntry({
          groupId,
          uri,
          aspectRatio: height / width,
        })
      },
      [groupId, uri, onLoadEnd],
    )

    return (
      <AnimatedImage
        source={source}
        onLoad={onLoad}
        contentFit="contain"
        style={styles.image}
        cachePolicy={'memory-disk'}
        onError={onError}
      />
    )
  },
  isEqual,
)

const useStyles = createThemedStylesheetWithHooks(
  (theme) => {
    const styles = StyleSheet.create({
      image: {
        backgroundColor: theme.background.bg_2,
        height: '100%',
        width: '100%',
      },
    })
    return styles
  },
  () => {
    const { width } = useSafeAreaFrame()
    const { topOffset, bottomOffset } = useMediaPreviewOffset()
    return { width, topOffset, bottomOffset }
  },
)
