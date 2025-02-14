import React, {
  memo,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ImageSourcePropType, StyleSheet, View } from 'react-native'
import { Image, ImageErrorEventData, ImageStyle } from 'expo-image'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { ButtonBase } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { doPreview, MediaFileMimeType } from 'screen/MediaPreviewScreen'
import s, { UI_SIZE_8 } from 'lib/commonStyles'
import { DEFAULT_SVG_DIMENSIONS } from 'lib/constants'
import { getFileExtension, getMediaTypeFromUrl } from 'lib/fs'
import { useForceRender } from 'lib/hooks'
import { useFile } from 'lib/hooks/useFile'
import { useRetryWhenOnline } from 'lib/hooks/useRetryWhenOnline'
import { KeetVideoThumbnailPlaceholder } from 'lib/KeetVideoThumbnail'
import { getStorageDevConsoleEnabled } from 'lib/localStorage'
import { getIsFileOutOfProportion } from 'lib/media/getIsFileOutOfProportion'
import {
  calculateImgPreviewDimension,
  checkIfSmallPreview,
  checkIfTinyPreview,
} from 'lib/size'

import ChatEventFileOutOfProportion from './ChatEventFileOutOfProportion'
import { ChatEventFilePlaceholder } from './ChatEventFilePlaceholder'
import { useChatEventFileContext } from './context/ChatEventFileContext'
import { FileStatsBar } from './FileStatsBar'
import { CHAT_EVENT_FILE_GROUP_ID } from '../Chat.hooks'

export interface ChatEventFileMediaProps {
  onToggleClear: () => void
  onLongPress?: () => void
  isSupportedFileType: boolean
}

interface ChatEventFileImageProps extends ChatEventFileMediaProps {
  placeholderIcon?: 'video' | 'image'
  onSelect?: (uri: string) => void
  children?: (
    cachedImage: ReactNode,
    imageLoadStatus: ImageLoadStatus,
    imageDimensions: {
      width: number
      height: number
    },
  ) => ReactNode
  style?: ImageStyle
  testID?: string
}

export enum ImageLoadStatus {
  loading = 'loading',
  mount = 'mount',
  error = 'error',
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

export const ChatEventFileImage = memo(
  ({
    onToggleClear,
    onSelect,
    onLongPress,
    placeholderIcon = 'image',
    children,
    isSupportedFileType,
    style,
    testID = 'ChatEventFileImage',
  }: ChatEventFileImageProps) => {
    const {
      path: name,
      type,
      dimensions,
      id: fileId,
    } = useChatEventFileContext()
    const [fileEntry, { isLoading: loading }] = useFile(fileId)
    const uri = fileEntry?.httpLink || ''
    const byteLength = fileEntry?.byteLength || 0
    const previewUri = fileEntry?.previews.large || undefined
    const isHidden = fileEntry?.cleared || false
    const scale = useSharedValue(0.98)
    const [imageLoadStatus, setImageLoadStatus] = useState(
      ImageLoadStatus.loading,
    )
    const retryWhenOnline = useRetryWhenOnline(
      fileId,
      imageLoadStatus === ImageLoadStatus.mount,
    )
    const [triggerRerender, renderKey] = useForceRender(fileId)

    const shouldMountImage = useMemo(
      () => Boolean(uri && !isHidden && isSupportedFileType),
      [isHidden, isSupportedFileType, uri],
    )

    const isDebugging = useMemo(() => getStorageDevConsoleEnabled(), [])

    const { isSVG } = getMediaTypeFromUrl(uri)
    let showPlaceholder =
      (isHidden || imageLoadStatus !== ImageLoadStatus.mount) && !isSVG

    const isImageLoading = useMemo(
      () =>
        isHidden
          ? false
          : loading || imageLoadStatus === ImageLoadStatus.loading,
      [imageLoadStatus, isHidden, loading],
    )

    const isFileOutOfProportion = useMemo(() => {
      if (!dimensions || placeholderIcon !== 'image' || isHidden) {
        return false
      }
      return getIsFileOutOfProportion(dimensions)
    }, [dimensions, isHidden, placeholderIcon])

    const styles = getStyles()
    const lastUri = useRef(uri)
    // Needed to handle Flashlist recycling
    // https://shopify.github.io/flash-list/docs/recycling
    if (uri !== lastUri.current) {
      lastUri.current = uri
      if (!isFileOutOfProportion) {
        showPlaceholder = true
        setImageLoadStatus(ImageLoadStatus.loading)
      }
    }

    const imageDimensions = useMemo(() => {
      const dims = isSVG && !dimensions ? DEFAULT_SVG_DIMENSIONS : dimensions

      return calculateImgPreviewDimension({
        width: dims?.width,
        height: dims?.height,
      })
    }, [dimensions, isSVG])

    const imageStyle = useMemo(
      () => [imageDimensions, styles.imgBorder, showPlaceholder && s.hidden],
      [imageDimensions, showPlaceholder, styles],
    )

    const placeholderStyle = useMemo(
      () => ({
        height: imageDimensions.height,
        width: imageDimensions.width,
      }),
      [imageDimensions],
    )

    const onPress = useCallback(() => {
      if (isHidden) {
        setImageLoadStatus(ImageLoadStatus.loading)
        triggerRerender()
        onToggleClear()
        return
      }
      if (loading || imageLoadStatus === ImageLoadStatus.loading || !uri) {
        return
      }

      if (onSelect) {
        onSelect(uri)
      } else {
        // For SVGs without dimensions, use default dimensions
        const previewDimensions =
          isSVG && !dimensions ? DEFAULT_SVG_DIMENSIONS : dimensions

        doPreview({
          id: fileId,
          name,
          uri,
          previewUri,
          mediaType: type?.startsWith('image')
            ? (type as MediaFileMimeType)
            : 'image',
          groupId: CHAT_EVENT_FILE_GROUP_ID,
          aspectRatio: previewDimensions
            ? previewDimensions.height / previewDimensions.width
            : undefined,
        })
      }
    }, [
      isHidden,
      loading,
      imageLoadStatus,
      uri,
      onSelect,
      triggerRerender,
      onToggleClear,
      isSVG,
      dimensions,
      fileId,
      name,
      previewUri,
      type,
    ])

    const onLoad = useCallback(() => {
      setImageLoadStatus(ImageLoadStatus.mount)
      scale.value = withSpring(1)
    }, [scale])

    const animatedImgStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))

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

    const cachePolicy = useMemo(() => {
      if (uri) {
        const fileExtension = getFileExtension(uri)
        return ['png', 'gif', 'svg'].includes(fileExtension) ? 'disk' : null
      }
      return null
    }, [uri])

    const imageSource: ImageSourcePropType = useMemo(() => {
      const fileExtension = getFileExtension(uri)
      let resolvedUri = previewUri || uri
      if (previewUri?.startsWith('data:image')) resolvedUri = uri
      if (fileExtension === 'gif') resolvedUri = uri

      return {
        uri: resolvedUri,
      }
    }, [previewUri, uri])

    const getCachedImage = useCallback(() => {
      const isVideoWithoutPreview = placeholderIcon === 'video' && !previewUri
      const isImageOrHasPreview = placeholderIcon === 'image' || previewUri

      if (isVideoWithoutPreview) {
        return (
          <KeetVideoThumbnailPlaceholder
            style={imageStyle}
            url={uri!}
            onLoad={onLoad}
            onPress={onPress}
            onError={onLoadError}
          />
        )
      }

      if (isImageOrHasPreview) {
        return (
          <AnimatedImage
            key={renderKey}
            style={[imageStyle, animatedImgStyle, style]}
            source={imageSource}
            alt={name}
            contentFit="cover"
            onLoad={onLoad}
            onError={onLoadError}
            recyclingKey={fileId}
            cachePolicy={cachePolicy}
          />
        )
      }

      return null
    }, [
      placeholderIcon,
      previewUri,
      imageStyle,
      uri,
      onLoad,
      onPress,
      onLoadError,
      renderKey,
      animatedImgStyle,
      style,
      imageSource,
      name,
      fileId,
      cachePolicy,
    ])

    if (isFileOutOfProportion) {
      return (
        <ChatEventFileOutOfProportion
          onPress={onPress}
          onLongPress={onLongPress}
          onLoad={onLoad}
          onLoadError={onLoadError}
          source={imageSource?.uri}
          path={name}
          byteLength={byteLength}
        />
      )
    }

    return (
      <ButtonBase
        key={renderKey}
        onPress={onPress}
        onLongPress={onLongPress}
        style={s.centeredLayout}
        testID={testID}
        disableFade
      >
        {shouldMountImage &&
          (children?.(getCachedImage(), imageLoadStatus, imageDimensions) ||
            getCachedImage())}
        {showPlaceholder && (
          <ChatEventFilePlaceholder
            name={name}
            type={placeholderIcon}
            style={placeholderStyle}
            byteLength={byteLength}
            loading={isImageLoading}
            isRemovedFromCache={isHidden}
            isSmallPreview={checkIfSmallPreview(imageDimensions.height)}
            isTinyPreview={checkIfTinyPreview(imageDimensions.height)}
            isSupportedFileType={isSupportedFileType}
          />
        )}
        {isDebugging && (
          <View style={styles.statsContainer}>
            <FileStatsBar fileId={fileId} />
          </View>
        )}
      </ButtonBase>
    )
  },
)
ChatEventFileImage.displayName = 'ChatEventFileImage'

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    imgBorder: {
      borderRadius: UI_SIZE_8,
    },
    statsContainer: {
      alignSelf: 'flex-end',
      right: -UI_SIZE_8,
      width: '100%',
    },
  })
  return styles
})
