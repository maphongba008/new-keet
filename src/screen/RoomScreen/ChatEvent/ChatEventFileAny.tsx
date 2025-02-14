import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import getMimeType from 'get-mime-type'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { doPreview } from 'screen/MediaPreviewScreen'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_28,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_44,
} from 'lib/commonStyles'
import { getFileIcon } from 'lib/fileManager'
import { getMediaType } from 'lib/fs'
import { useFile } from 'lib/hooks/useFile'
import { calculateImgPreviewDimension, readableFileSize } from 'lib/size'

import { ChatEventFilePlaceholder } from './ChatEventFilePlaceholder'
import { CHAT_EVENT_COLUMN_WIDTH } from './ChatEventMessage/TextMessageMarkdown'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEventFileContext } from './context/ChatEventFileContext'
import { useChatEvent } from './hooks/useChatEvent'
import { CHAT_EVENT_FILE_GROUP_ID } from '../Chat.hooks'

interface ChatEventFileAnyProps {
  onToggleClear: () => void
  onLongPress?: () => void
}

export const ChatEventFileAny = memo(
  ({ onToggleClear, onLongPress }: ChatEventFileAnyProps) => {
    const {
      path: name,
      type,
      dimensions,
      id: fileId,
    } = useChatEventFileContext()
    const [fileEntry, { isLoading: loading }] = useFile(fileId)
    const { httpLink: uri, previews } = fileEntry || {}
    const previewUri = previews?.large || undefined
    const { cleared = false, byteLength = 0 } = fileEntry || {}
    const styles = getStyles()
    const theme = useTheme()
    const { messageId } = useChatEventContext()
    const event = useChatEvent(messageId)
    const fileType = type || getMimeType(name) || ''
    const { isVideo, isSupportedFileType } = useMemo(
      () => getMediaType(name, fileType),
      [name, fileType],
    )

    const isMine = event.local

    const imageDimensions = useMemo(
      () =>
        calculateImgPreviewDimension({
          width: dimensions?.width,
          height: dimensions?.height,
        }),
      [dimensions],
    )

    const size: any = useMemo(() => {
      return {
        width: imageDimensions.width,
        height: imageDimensions.height,
      }
    }, [imageDimensions.height, imageDimensions.width])
    const showPlaceholder = cleared || loading
    const onPress = useCallback(() => {
      if (loading) {
        return
      }

      if (showPlaceholder) return onToggleClear()
      if (uri && isVideo && isSupportedFileType)
        return doPreview({
          id: fileId,
          name,
          uri,
          previewUri,
          mediaType: 'video',
          groupId: CHAT_EVENT_FILE_GROUP_ID,
          aspectRatio: dimensions
            ? dimensions.height / dimensions.width
            : undefined,
        })

      onLongPress?.()
    }, [
      dimensions,
      fileId,
      isSupportedFileType,
      isVideo,
      loading,
      name,
      onLongPress,
      onToggleClear,
      previewUri,
      showPlaceholder,
      uri,
    ])

    return (
      <ButtonBase
        onPress={onPress}
        onLongPress={onLongPress}
        style={showPlaceholder && size}
        testID="ChatEventFileAny"
      >
        {showPlaceholder && (
          <ChatEventFilePlaceholder
            name={name}
            type="any"
            style={size}
            byteLength={byteLength}
            loading={loading && !cleared}
            isRemovedFromCache={cleared}
          />
        )}
        {!cleared && !loading && (
          <View style={styles.placeholderMessage}>
            <View
              style={[styles.iconWrapper, isMine && styles.mineIconWrapper]}
            >
              <SvgIcon
                name={getFileIcon(fileType)}
                color={theme.color.accent}
                width={ICON_SIZE_28}
                height={ICON_SIZE_28}
              />
            </View>
            <View style={s.container}>
              <Text
                style={styles.text}
                ellipsizeMode="middle"
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text style={styles.textSize}>
                {readableFileSize(byteLength)}
              </Text>
            </View>
          </View>
        )}
      </ButtonBase>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    iconWrapper: {
      ...s.centeredLayout,
      backgroundColor: theme.color.grey_500,
      borderRadius: theme.border.radiusNormal,
      height: UI_SIZE_44,
      width: UI_SIZE_44,
    },
    mineIconWrapper: {
      backgroundColor: theme.color.blue_600,
    },
    placeholderMessage: {
      ...s.centerAlignedRow,
      borderRadius: UI_SIZE_14,
      gap: UI_SIZE_8,
      padding: theme.spacing.standard / 2,
      width: CHAT_EVENT_COLUMN_WIDTH,
    },
    text: {
      ...theme.text.bodySemiBold,
      fontSize: 16,
      writingDirection: DIRECTION_CODE,
    },
    textSize: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: 13,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

ChatEventFileAny.displayName = 'ChatEventFileAny'
