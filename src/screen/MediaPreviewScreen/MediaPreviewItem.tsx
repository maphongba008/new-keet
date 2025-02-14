import React, { memo, useMemo } from 'react'
import { FlexStyle, StyleProp, ViewStyle } from 'react-native'
import isEqual from 'react-fast-compare'
import {
  ComposedGesture,
  Gesture,
  PanGesture,
} from 'react-native-gesture-handler'
import { AnimatedStyle } from 'react-native-reanimated'

import { width } from 'lib/commonStyles'
import { getMediaType, getMediaTypeFromUrl } from 'lib/fs'

import { useMediaPreviewFileEntry } from './MediaPreview.Store'
import { MediaPreviewGesture } from './MediaPreviewGesture'
import { MediaPreviewImage } from './MediaPreviewImage'
import { MediaPreviewImageSvg } from './MediaPreviewImageSvg'
import { MediaPreviewVideoControls } from './MediaPreviewVideo'
import { MediaPreviewVideoWithPreview } from './MediaPreviewVideoWithPreview'

interface ListItemProps {
  uri: string
  previewUri?: string
  groupId: string
  initialPreview: boolean
  priority: 'focused' | 'focusedReady' | 'next' | 'nextReady' | 'hidden'
  transitionStyle: StyleProp<AnimatedStyle<ViewStyle>>
  videoRefs: React.MutableRefObject<Record<string, MediaPreviewVideoControls>>
  imageGestureEvent: ComposedGesture
  videoGestureEvent: PanGesture
  staticImageStyle: StyleProp<AnimatedStyle<FlexStyle>>
  onLoadEnd: () => void
}

export const getIsMediaPreviewPriority = (
  index: number,
  focusedIndex: number,
  isMounted: boolean,
) => {
  if (isMounted && focusedIndex === index) return 'focusedReady'
  if (focusedIndex === index) return 'focused'
  if (isMounted && Math.abs(focusedIndex - index) === 1) return 'nextReady'
  if (Math.abs(focusedIndex - index) === 1) return 'next'
  return 'hidden'
}

export const getMediaInitialPreview = ({
  uri: focusedUri,
  itemIndex,
  initialFocusedIndex,
}: {
  uri: string
  itemIndex: number
  initialFocusedIndex: React.RefObject<number>
}) => {
  const { isVideo } = getMediaTypeFromUrl(focusedUri)
  return (isVideo &&
    initialFocusedIndex.current !== null &&
    initialFocusedIndex.current > -1 &&
    initialFocusedIndex?.current === itemIndex) as boolean
}

export const MediaPreviewItem = memo(
  ({
    uri,
    previewUri,
    priority,
    transitionStyle,
    videoRefs,
    groupId,
    initialPreview,
    imageGestureEvent,
    videoGestureEvent,
    staticImageStyle,
    onLoadEnd,
  }: ListItemProps) => {
    const isVisible = useMemo(
      () => ['focused', 'focusedReady', 'nextReady'].includes(priority),
      [priority],
    )

    const fileEntry = useMediaPreviewFileEntry(uri, groupId)
    const fileId = fileEntry?.id || ''

    const { isImage, isVideo, isSVG } = useMemo(
      () => getMediaType(uri, fileEntry?.mediaType),
      [fileEntry?.mediaType, uri],
    )
    const gestureEvent = useMemo(() => {
      if (priority === 'focusedReady' && isImage) return imageGestureEvent
      if (priority === 'focusedReady' && isVideo) return videoGestureEvent
      return Gesture.Native()
    }, [imageGestureEvent, isImage, isVideo, priority, videoGestureEvent])

    const containerStyle = useMemo(
      () => ({ maxHeight: width * (fileEntry?.aspectRatio || 1) }),
      [fileEntry?.aspectRatio],
    )

    const combinedStyle = useMemo(
      () =>
        [
          staticImageStyle,
          containerStyle,
          priority.startsWith('focused') && transitionStyle,
        ] as StyleProp<AnimatedStyle<FlexStyle>>,
      [priority, staticImageStyle, transitionStyle, containerStyle],
    )

    if (isVisible && isSVG) {
      return (
        <MediaPreviewGesture
          gesture={gestureEvent}
          style={combinedStyle}
          fileId={fileId}
          priority={priority}
        >
          <MediaPreviewImageSvg
            uri={uri}
            groupId={groupId}
            onLoadEnd={onLoadEnd}
          />
        </MediaPreviewGesture>
      )
    }

    if (isVisible && isImage) {
      return (
        <MediaPreviewGesture
          gesture={gestureEvent}
          style={combinedStyle}
          fileId={fileId}
          priority={priority}
        >
          <MediaPreviewImage
            uri={uri}
            previewUri={previewUri}
            groupId={groupId}
            onLoadEnd={onLoadEnd}
          />
        </MediaPreviewGesture>
      )
    }

    if (isVisible && isVideo) {
      return (
        <MediaPreviewGesture
          gesture={gestureEvent}
          fileId={fileId}
          priority={priority}
        >
          <MediaPreviewVideoWithPreview
            uri={uri}
            animatedStyles={combinedStyle}
            videoRefs={videoRefs}
            showControls={priority === 'focusedReady'}
            autoPlay={initialPreview}
            previewUri={previewUri}
            onLoadEnd={onLoadEnd}
          />
        </MediaPreviewGesture>
      )
    }

    return null
  },
  isEqual,
)
