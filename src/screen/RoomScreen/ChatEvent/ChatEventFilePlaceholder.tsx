import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import prettyBytes from 'pretty-bytes'

import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_32,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

interface ChatEventFilePlaceholderProps {
  name: string
  byteLength: number
  loading: boolean
  style?: StyleProp<ViewStyle>
  type: 'video' | 'image' | 'any'
  isRemovedFromCache?: boolean
  isSmallPreview?: boolean
  isTinyPreview?: boolean
  isSupportedFileType?: boolean
}

const CHAT_EVENT_PLACEHOLDER_LOADER_TIMEOUT = 5000

export const ChatEventFilePlaceholder = memo(
  ({
    name,
    byteLength,
    type,
    loading,
    style,
    isRemovedFromCache = false,
    isSmallPreview = false,
    isTinyPreview = false,
    isSupportedFileType,
  }: ChatEventFilePlaceholderProps) => {
    const styles = getStyles()
    const strings = useStrings()
    const [isLoadingTimeout, setIsLoadingTimeout] =
      useState(isSupportedFileType)
    const isLoaderVisible = isLoadingTimeout && loading
    const loaderTimer = useRef<NodeJS.Timeout>()

    useEffect(() => {
      if (!isLoadingTimeout) return
      if (!isRemovedFromCache) {
        loaderTimer.current = setTimeout(() => {
          setIsLoadingTimeout(false)
        }, CHAT_EVENT_PLACEHOLDER_LOADER_TIMEOUT)
      }

      return () => {
        loaderTimer.current && clearTimeout(loaderTimer.current)
      }
    }, [isLoadingTimeout, isRemovedFromCache, isSupportedFileType])

    useEffect(() => {
      if (!loading && loaderTimer.current) {
        clearTimeout(loaderTimer.current)
      }
    }, [loading])

    const icon = useMemo(() => {
      if (type === 'video') return 'play'
      if (type === 'image') return 'chat_placeholder_image'

      return 'chat_placeholder_file_any'
    }, [type])

    const loadingDesc = useMemo(() => {
      if (!isSupportedFileType) return strings.chat.fileIsNotSupported
      if (!isLoadingTimeout) return strings.chat.waitingFile
      if (type === 'video') return strings.chat.loadingFileVideo
      if (type === 'image') return strings.chat.loadingFileImage

      return strings.chat.loadingFileFile
    }, [
      isLoadingTimeout,
      isSupportedFileType,
      strings.chat.fileIsNotSupported,
      strings.chat.loadingFileFile,
      strings.chat.loadingFileImage,
      strings.chat.loadingFileVideo,
      strings.chat.waitingFile,
      type,
    ])

    const isImageSmall = isSmallPreview || isTinyPreview
    const shouldShowIcon = !isLoaderVisible && !isImageSmall
    const shouldShowDesc = loading && !isImageSmall
    const shouldShowFileName = !isTinyPreview || !isLoaderVisible

    return (
      <View style={[styles.placeholderMessage, style]}>
        {shouldShowIcon && <SvgIcon name={icon} />}
        {isLoaderVisible && (
          <View style={styles.loaderContainer}>
            <Loading style={styles.loader} />
          </View>
        )}
        {shouldShowFileName && (
          <Text
            style={styles.fileTitle}
            numberOfLines={isRemovedFromCache ? undefined : 1}
            ellipsizeMode={isRemovedFromCache ? 'head' : 'middle'}
          >
            {isRemovedFromCache ? strings.chat.thisFileHasBeenDeleted : name}
          </Text>
        )}
        {shouldShowDesc && (
          <Text style={styles.fileLoadingDesc}>{loadingDesc}</Text>
        )}
        {!isTinyPreview && (
          <Text style={styles.editedText}>{prettyBytes(byteLength)}</Text>
        )}
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    editedText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 12,
      paddingHorizontal: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
    fileLoadingDesc: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 12,
      paddingHorizontal: UI_SIZE_4,
      textAlign: 'center',
      writingDirection: DIRECTION_CODE,
    },
    fileTitle: {
      ...theme.text.title,
      fontSize: 14,
      paddingHorizontal: UI_SIZE_4,
      textAlign: 'center',
      writingDirection: DIRECTION_CODE,
    },
    loader: {
      height: UI_SIZE_32,
      width: UI_SIZE_32,
    },
    loaderContainer: {
      alignItems: 'center',
      height: 56,
      justifyContent: 'center',
      width: 46,
    },
    placeholderMessage: {
      ...s.centeredLayout,
      backgroundColor: theme.color.bg2,
      borderRadius: UI_SIZE_14,
      padding: theme.spacing.standard / 2,
      paddingVertical: UI_SIZE_16,
      rowGap: UI_SIZE_8,
    },
  })
  return styles
})
