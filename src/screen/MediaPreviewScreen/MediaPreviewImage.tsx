import React, { memo, useCallback } from 'react'
import { ImageErrorEventData, StyleSheet } from 'react-native'
import { Image, ImageLoadEventData, useImage } from 'expo-image'
import isEqual from 'react-fast-compare'
import Animated from 'react-native-reanimated'
import { useSafeAreaFrame } from 'react-native-safe-area-context'

import { createThemedStylesheetWithHooks } from 'component/theme'
import { usePreviewImageSource } from 'lib/hooks'

import { updateMediaPreviewFileEntry } from './MediaPreview.Store'
import { useMediaPreviewOffset } from './useMediaPreviewOffset'

interface MediaPreviewImageProps {
  uri: string
  previewUri?: string
  groupId: string
  onLoadEnd: () => void
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

export const MediaPreviewImage = memo(
  ({ uri, previewUri, groupId, onLoadEnd }: MediaPreviewImageProps) => {
    const styles = getStyles()

    const onErrorOrigin = useCallback((e: Error) => {
      const errMsg = e?.message?.toLowerCase() || ''
      console.error(errMsg)
    }, [])
    const onError = useCallback(
      (e: ImageErrorEventData) => {
        onErrorOrigin(e?.error)
      },
      [onErrorOrigin],
    )

    const imgSource = useImage(uri, { onError: onErrorOrigin })
    const imgPreviewSource = usePreviewImageSource(previewUri)

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
        source={imgSource || imgPreviewSource}
        onLoad={onLoad}
        contentFit="cover"
        style={styles.image}
        cachePolicy={'memory-disk'}
        onError={onError}
      />
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheetWithHooks(
  () => {
    const styles = StyleSheet.create({
      image: {
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
