import React, { useCallback, useMemo, useRef } from 'react'
import { StatusBar, StyleSheet } from 'react-native'
import PagerView, {
  PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view'
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated'

import { OnlyBackNavBar } from 'component/NavBar'
import useImagePreview, {
  MEDIA_FOCUSED_SEEN_INDEX,
} from 'screen/MediaPreviewScreen/useMediaPreview'
import s from 'lib/commonStyles'
import { consoleError } from 'lib/errors'
import { getMediaTypeFromUrl } from 'lib/fs'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'
import { parseURLToGetKey } from 'lib/media'
import { back, setCurrentNavParams } from 'lib/navigation'
import { isIOS } from 'lib/platform'

import {
  getMediaViewRef,
  parsePosition,
  useMediaPreviewFileEntries,
} from './MediaPreview.Store'
import {
  MediaPreviewEntryBase,
  MediaPreviewType,
  PageScrollStateTypes,
} from './MediaPreview.Types'
import {
  getIsMediaPreviewPriority,
  getMediaInitialPreview,
  MediaPreviewItem,
} from './MediaPreviewItem'
import { MediaPreviewVideoControls } from './MediaPreviewVideo'
import { usePageScrollHandler } from './usePageScrollHandler'

interface MediaPreviewScreenProps {
  route: { params: MediaPreviewType }
}

const AnimatedPager = Animated.createAnimatedComponent(PagerView)
// props: any <- is temporary solution until navigator will be typed
export default function MediaPreviewScreen(props: any) {
  const {
    position: focusedPosition,
    uri: focusedUri,
    aspectRatio: focusedAspectRatio,
    groupId,
  } = (props as MediaPreviewScreenProps).route.params
  const allFileEntries = useMediaPreviewFileEntries()
  const fileEntries = useMemo(
    () =>
      allFileEntries.reduce((acc, el) => {
        const isInCurrentGroup = el.groupId === groupId
        if (isInCurrentGroup && el.isReversed) {
          acc.unshift(el)
        }
        if (isInCurrentGroup && !el.isReversed) {
          acc.push(el)
        }

        return acc
      }, [] as MediaPreviewEntryBase[]),
    [allFileEntries, groupId],
  )

  const {
    animatedImageStyle,
    staticImageStyle,
    overlayAnimatedStyle,
    onClosePreview,
    mountTransition,
    imageGestureEvent,
    videoGestureEvent,
    paperViewProps,
    isViewFocused,
    isMounted,
  } = useImagePreview({
    position: focusedPosition,
    onRequestClose: back,
    aspectRatio: focusedAspectRatio,
  })

  useFocusedBackHandler(() => {
    onClosePreview()
    return true
  })

  const focusedIndex = useMemo(
    () => fileEntries?.findIndex((c) => c.uri === focusedUri),
    [fileEntries, focusedUri],
  )
  const isScrolling = useSharedValue(false)

  const videoRefs = useRef<Record<string, MediaPreviewVideoControls>>({})
  const pagerViewRef = useRef<PagerView>(null)

  const initialFocusedIndex = useRef<number>(focusedIndex)
  const showStatBar = useMemo(
    () => (isIOS ? !isViewFocused : false),
    [isViewFocused],
  )

  const onLoadEnd = useCallback(() => {
    mountTransition()
  }, [mountTransition])

  const setActualPosition = useCallback(
    (newIndex: number) => {
      try {
        if (newIndex === focusedIndex) return

        const entry = fileEntries[newIndex]
        const isTop = newIndex <= focusedIndex
        const { isVideo } = getMediaTypeFromUrl(focusedUri)

        if (isVideo) {
          const eventId = parseURLToGetKey(focusedUri)
          videoRefs.current?.[eventId]?.reset()
        }

        if (!entry) return
        getMediaViewRef(groupId, fileEntries[newIndex].uri)?.measureInWindow(
          (...params) => {
            setCurrentNavParams({
              position: parsePosition(isTop, ...params),
              uri: entry.uri,
              groupId: entry.groupId,
              aspectRatio: entry.aspectRatio || 1,
            })
          },
        )
      } catch (err) {
        consoleError(err)
      }
    },
    [fileEntries, focusedIndex, focusedUri, groupId],
  )

  const pauseVideo = useCallback(() => {
    const { isVideo } = getMediaTypeFromUrl(focusedUri)
    if (isVideo) {
      const eventId = parseURLToGetKey(focusedUri)
      videoRefs.current?.[eventId]?.pause()
    }
  }, [focusedUri])

  const pageScrollHandlers = usePageScrollHandler({
    onPageScroll: (e) => {
      'worklet'

      if (!isScrolling.value) {
        isScrolling.value = true
        runOnJS(pauseVideo)()
      } else if (e.offset === 0) {
        isScrolling.value = false
      }
    },
    onPageSelected: (e) => {
      'worklet'

      runOnJS(setActualPosition)(e.position)
    },
  })

  const resetInitialFocusIndex = useCallback(
    (event: PageScrollStateChangedNativeEvent) => {
      // reset initial focus index after initial preview
      if (event.nativeEvent.pageScrollState === PageScrollStateTypes.IDLE) {
        initialFocusedIndex.current = MEDIA_FOCUSED_SEEN_INDEX
      }
    },
    [],
  )

  const renderItem = useCallback(
    ({ uri, previewUri }: MediaPreviewEntryBase, itemIndex: number) => {
      const isInitialPreview = getMediaInitialPreview({
        uri,
        itemIndex,
        initialFocusedIndex,
      })

      return (
        <MediaPreviewItem
          key={uri}
          uri={uri}
          previewUri={previewUri}
          priority={getIsMediaPreviewPriority(
            itemIndex,
            focusedIndex,
            isMounted,
          )}
          onLoadEnd={onLoadEnd}
          initialPreview={isInitialPreview}
          transitionStyle={animatedImageStyle}
          videoRefs={videoRefs}
          groupId={groupId}
          imageGestureEvent={imageGestureEvent}
          videoGestureEvent={videoGestureEvent}
          staticImageStyle={staticImageStyle}
        />
      )
    },
    [
      focusedIndex,
      isMounted,
      animatedImageStyle,
      groupId,
      imageGestureEvent,
      videoGestureEvent,
      staticImageStyle,
      onLoadEnd,
    ],
  )

  return (
    <>
      <StatusBar hidden={showStatBar} />
      <Animated.View
        style={[StyleSheet.absoluteFillObject, overlayAnimatedStyle]}
        renderToHardwareTextureAndroid
      />
      <AnimatedPager
        ref={pagerViewRef}
        style={s.container}
        initialPage={focusedIndex}
        onPageScroll={pageScrollHandlers}
        offscreenPageLimit={1}
        animatedProps={paperViewProps}
        useNext={false}
        onPageScrollStateChanged={resetInitialFocusIndex}
      >
        {fileEntries.map(renderItem)}
      </AnimatedPager>

      <OnlyBackNavBar overrideOnPress={onClosePreview} />
    </>
  )
}
