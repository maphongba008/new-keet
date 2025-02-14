import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Image, ImageErrorEventData, ImageStyle } from 'expo-image'
import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { ButtonBase } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { doPreview } from 'screen/MediaPreviewScreen'
import s, { UI_SIZE_14 } from 'lib/commonStyles'
import { DEFAULT_SVG_DIMENSIONS } from 'lib/constants'
import { useForceRender } from 'lib/hooks'
import { useFile } from 'lib/hooks/useFile'
import { useRetryWhenOnline } from 'lib/hooks/useRetryWhenOnline'
import { calculateImgPreviewDimension } from 'lib/size'

import { ChatEventFileMediaProps, ImageLoadStatus } from './ChatEventFileImage'
import { ChatEventFilePlaceholder } from './ChatEventFilePlaceholder'
import { useChatEventFileContext } from './context/ChatEventFileContext'
import { CHAT_EVENT_FILE_GROUP_ID } from '../Chat.hooks'

interface ChatEventFileSVGProps extends ChatEventFileMediaProps {
  style?: ImageStyle | AnimatedStyle<any>
  children?: (
    cachedImage: React.ReactNode,
    imageLoadStatus: ImageLoadStatus,
    imageDimensions: {
      width: number
      height: number
    },
  ) => React.ReactNode
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

export const ChatEventFileSVG = memo(
  ({
    onToggleClear,
    onLongPress,
    isSupportedFileType,
    style,
    children,
  }: ChatEventFileSVGProps) => {
    const { path: name, dimensions, id: fileId } = useChatEventFileContext()
    const [fileEntry, { isLoading: loading }] = useFile(fileId)
    const uri = fileEntry?.httpLink || ''
    const byteLength = fileEntry?.byteLength || 0
    const isHidden = fileEntry?.cleared || false
    const scale = useSharedValue(0.98)
    const [imageLoadStatus, setImageLoadStatus] = useState(
      ImageLoadStatus.loading,
    )
    const [triggerRerender, renderKey] = useForceRender(fileId)
    const retryWhenOnline = useRetryWhenOnline(
      fileId,
      imageLoadStatus === ImageLoadStatus.mount,
    )

    const shouldMountImage = useMemo(
      () => Boolean(uri && !isHidden && isSupportedFileType),
      [isHidden, isSupportedFileType, uri],
    )

    const showPlaceholder =
      isHidden || imageLoadStatus !== ImageLoadStatus.mount

    const imageDimensions = useMemo(
      () =>
        calculateImgPreviewDimension({
          width: dimensions?.width || DEFAULT_SVG_DIMENSIONS.width,
          height: dimensions?.height || DEFAULT_SVG_DIMENSIONS.height,
        }),
      [dimensions],
    )

    const placeholderStyle = useMemo(
      () => ({
        height: imageDimensions.height,
        width: imageDimensions.width,
      }),
      [imageDimensions],
    )

    const styles = getStyles()

    const imageStyle = useMemo(
      () => [imageDimensions, styles.imgBorder, showPlaceholder && s.hidden],
      [imageDimensions, showPlaceholder, styles],
    )

    const onPress = useCallback(() => {
      if (isHidden) {
        setImageLoadStatus(ImageLoadStatus.loading)
        triggerRerender()
        onToggleClear()
        return
      }
      if (loading || !uri) {
        return
      }

      doPreview({
        id: fileId,
        name,
        uri,
        mediaType: 'image/svg+xml',
        groupId: CHAT_EVENT_FILE_GROUP_ID,
        aspectRatio: dimensions
          ? dimensions.height / dimensions.width
          : DEFAULT_SVG_DIMENSIONS.height / DEFAULT_SVG_DIMENSIONS.width,
      })
    }, [
      isHidden,
      loading,
      uri,
      fileId,
      name,
      dimensions,
      triggerRerender,
      onToggleClear,
    ])

    const onLoad = useCallback(() => {
      setImageLoadStatus(ImageLoadStatus.mount)
      scale.value = withSpring(1)
    }, [scale])

    const onLoadError = useCallback(
      (err?: ImageErrorEventData) => {
        const errMsg = err?.error?.toLowerCase() || ''
        if (errMsg.includes('timed') || errMsg.includes('timeout')) {
          retryWhenOnline(triggerRerender)
          return
        }
        setImageLoadStatus(ImageLoadStatus.error)
      },
      [retryWhenOnline, triggerRerender],
    )

    const animatedImgStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))

    const getCachedImage = useCallback(() => {
      return (
        <AnimatedImage
          key={renderKey}
          style={[imageStyle, animatedImgStyle, style]}
          source={{ uri }}
          alt={name}
          contentFit="contain"
          onLoad={onLoad}
          onError={onLoadError}
          recyclingKey={fileId}
          cachePolicy="disk"
        />
      )
    }, [
      renderKey,
      imageStyle,
      animatedImgStyle,
      style,
      uri,
      name,
      onLoad,
      onLoadError,
      fileId,
    ])

    return (
      <ButtonBase
        onPress={onPress}
        onLongPress={onLongPress}
        style={[s.centeredLayout, style]}
        testID="ChatEventFileSVG"
        disableFade
      >
        {shouldMountImage &&
          (children?.(getCachedImage(), imageLoadStatus, imageDimensions) ||
            getCachedImage())}
        {showPlaceholder && (
          <ChatEventFilePlaceholder
            name={name}
            type="image"
            style={placeholderStyle}
            byteLength={byteLength}
            loading={loading}
            isRemovedFromCache={isHidden}
            isSmallPreview={false}
            isTinyPreview={false}
            isSupportedFileType={isSupportedFileType}
          />
        )}
      </ButtonBase>
    )
  },
)

ChatEventFileSVG.displayName = 'ChatEventFileSVG'

export default ChatEventFileSVG

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    imgBorder: {
      borderRadius: UI_SIZE_14,
    },
  })
  return styles
})
