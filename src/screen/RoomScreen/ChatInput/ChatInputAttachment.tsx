// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/chat-input.js
import React, { FC, memo, useCallback, useMemo, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import isEqual from 'react-fast-compare'

import AudioPlayer from 'component/AudioPlayer'
import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  createThemedStylesheet,
  hexToRgbOpacity,
  useTheme,
} from 'component/theme'
import {
  doPreview,
  MediaFileMimeType,
  useMediaPreviewSource,
} from 'screen/MediaPreviewScreen'
import {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { CHAT_INPUT_PREVIEW } from 'lib/constants'
import { getFileIcon } from 'lib/fileManager'
import { getFileName, getMediaType } from 'lib/fs'
import { KeetVideoThumbnail } from 'lib/KeetVideoThumbnail'
import { clear as clearUpload, UploadFile } from 'lib/uploads'

import { ChatInputLinkPreviewMessage } from './ChatInputLinkPreviewItem'

enum AttachmentState {
  loading = 'loading',
  ready = 'ready',
  error = 'error',
}
export const CHAT_INPUT_FILE_GROUP_ID = 'CHAT_INPUT_FILE'

interface ChatInputAttachmentProps extends UploadFile {
  index: number
}

export const ChatInputAttachment: FC<ChatInputAttachmentProps> = memo(
  ({
    id: uploadId,
    path,
    type: uploadType,
    isDownloading,
    dimensions,
    previewPath,
    index,
    icon,
    title,
    description,
    isLinkPreview = false,
  }) => {
    const theme = useTheme()
    const styles = getStyles()
    const uri = useMemo(
      () => (path?.includes('://') ? path : `file://${path}`),
      [path],
    )
    const previewUri = useMemo(() => {
      if (previewPath?.includes('://')) {
        return previewPath
      }
      if (previewPath) {
        return `file://${previewPath}`
      }
      return undefined
    }, [previewPath])
    const { isImage, isVideo, isAudio, isSupportedFileType } = useMemo(
      () => getMediaType(uri, uploadType),
      [uploadType, uri],
    )
    const isOtherFile = [isImage, isVideo, isAudio].every((state) => !state)

    const [attachmentState, setAttachmentState] = useState(
      isOtherFile ? AttachmentState.ready : AttachmentState.loading,
    )
    const isLoading = attachmentState === AttachmentState.loading
    const isError = attachmentState === AttachmentState.error

    const setRefs = useMediaPreviewSource(
      {
        uri,
        previewUri,
        groupId: CHAT_INPUT_FILE_GROUP_ID,
        mediaType: uploadType as MediaFileMimeType,
        index,
        aspectRatio: dimensions
          ? dimensions.height / dimensions.width
          : undefined,
        id: uploadId,
      },
      isSupportedFileType && (isImage || isVideo),
    )

    const onRemoveAttachment = useCallback(() => {
      clearUpload({ id: uploadId })
    }, [uploadId])
    const onLoad = useCallback(() => {
      setAttachmentState(AttachmentState.ready)
    }, [setAttachmentState])
    const onError = useCallback(() => {
      setAttachmentState(AttachmentState.error)
    }, [setAttachmentState])

    const onPress = useCallback(() => {
      const previewParams = {
        name: getFileName(uri),
        uri,
        mediaType: 'video',
        groupId: CHAT_INPUT_FILE_GROUP_ID,
      }

      if (isImage || isVideo) {
        doPreview({
          ...previewParams,
          id: '',
          previewUri,
          aspectRatio: dimensions
            ? dimensions?.height / dimensions?.width
            : undefined,
          mediaType: isImage ? 'image' : 'video',
        })
      }
    }, [dimensions, isImage, isVideo, previewUri, uri])

    const isMediaDownloading = useMemo(
      () => (isImage || isVideo) && isDownloading,
      [isDownloading, isImage, isVideo],
    )

    const mediaContent = useMemo(() => {
      const isUnknown = isError || !isLoading
      if (isMediaDownloading) {
        return null
      }
      if (isLinkPreview) {
        return (
          <ChatInputLinkPreviewMessage
            title={title}
            description={description}
            icon={icon}
          />
        )
      }
      if (isImage || (isVideo && previewUri)) {
        return (
          <View ref={setRefs} collapsable={false}>
            <Image
              style={styles.image}
              source={{ uri: previewUri || uri }}
              onLoad={onLoad}
              onError={onError}
            />
          </View>
        )
      } else if (isVideo) {
        return (
          <View ref={setRefs} collapsable={false}>
            <KeetVideoThumbnail
              style={styles.image}
              url={uri}
              onLoad={onLoad}
              onError={onError}
            />
          </View>
        )
      } else if (isAudio) {
        return (
          <AudioPlayer
            uri={uri}
            onAudioLoaded={onLoad}
            loading={isLoading}
            fromAttachment
          />
        )
      } else if (isUnknown) {
        return (
          <View style={styles.unknown}>
            <SvgIcon
              name={getFileIcon(uploadType || '')}
              width={UI_SIZE_32}
              height={UI_SIZE_32}
              color={theme.icon.closeColor}
            />
            <Text
              style={styles.unknownName}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {uploadId}
            </Text>
          </View>
        )
      } else {
        return null
      }
    }, [
      description,
      icon,
      isAudio,
      isError,
      isImage,
      isLinkPreview,
      isLoading,
      isMediaDownloading,
      isVideo,
      onError,
      onLoad,
      previewUri,
      setRefs,
      styles.image,
      styles.unknown,
      styles.unknownName,
      theme.icon.closeColor,
      title,
      uploadId,
      uploadType,
      uri,
    ])

    return (
      <Pressable
        style={isLinkPreview ? styles.previewContainer : styles.container}
        onPress={onPress}
      >
        <View style={styles.placeholder}>
          {isAudio && isLoading && <Loading style={styles.loader} />}
        </View>
        {mediaContent}
        <TouchableOpacity
          style={styles.cancel}
          onPress={onRemoveAttachment}
          hitSlop={UI_SIZE_8}
        >
          <SvgIcon
            name="close"
            color={theme.icon.closeColor}
            width={UI_SIZE_16}
            height={UI_SIZE_16}
          />
        </TouchableOpacity>
        {isVideo && (
          <View style={styles.unknownTypeIconContainer}>
            <SvgIcon name="play" width={UI_SIZE_12} height={UI_SIZE_12} />
          </View>
        )}
      </Pressable>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const borderWidth = theme.border.width
  const cancelSize = UI_SIZE_16 + borderWidth * 2
  const paddingTop = UI_SIZE_8

  const styles = StyleSheet.create({
    cancel: {
      backgroundColor: theme.color.grey_600,
      borderColor: theme.color.grey_600,
      borderRadius: UI_SIZE_8 + borderWidth,
      borderWidth,
      height: cancelSize,
      position: 'absolute',
      right: 0,
      width: cancelSize,
    },
    container: {
      height: CHAT_INPUT_PREVIEW.PREVIEW_HEIGHT + paddingTop,
      minWidth: CHAT_INPUT_PREVIEW.PREVIEW_WIDTH + UI_SIZE_8,
      paddingRight: UI_SIZE_8,
      paddingTop,
    },
    image: {
      borderRadius: UI_SIZE_8,
      height: CHAT_INPUT_PREVIEW.PREVIEW_HEIGHT,
      width: CHAT_INPUT_PREVIEW.PREVIEW_WIDTH,
    },
    loader: {
      alignSelf: 'center',
      height: CHAT_INPUT_PREVIEW.LOADER_SIZE,
      width: CHAT_INPUT_PREVIEW.LOADER_SIZE,
    },
    placeholder: {
      borderColor: theme.border.color,
      borderRadius: UI_SIZE_8,
      borderWidth,
      bottom: 0,
      left: 0,
      maxHeight: CHAT_INPUT_PREVIEW.PREVIEW_HEIGHT,
      position: 'absolute',
      right: UI_SIZE_8,
      top: paddingTop,
    },
    previewContainer: {
      maxHeight: CHAT_INPUT_PREVIEW.LINK_PREVIEW_HEIGHT + paddingTop,
      paddingTop,
      width: CHAT_INPUT_PREVIEW.LINK_PREVIEW_WIDTH + UI_SIZE_8,
    },
    unknown: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: UI_SIZE_8,
      width: CHAT_INPUT_PREVIEW.UNKNOWN_WIDTH,
    },
    unknownName: {
      color: colors.white_snow,
      fontSize: 8,
      ...theme.text.tag,
      flex: 1,
      paddingLeft: UI_SIZE_8,
      paddingRight: UI_SIZE_16,
    },
    unknownTypeIconContainer: {
      alignItems: 'center',
      backgroundColor: hexToRgbOpacity(theme.color.grey_600, 0.8),
      borderRadius: UI_SIZE_8,
      bottom: UI_SIZE_2,
      justifyContent: 'center',
      left: UI_SIZE_2,
      paddingHorizontal: UI_SIZE_4,
      paddingVertical: UI_SIZE_4,
      position: 'absolute',
    },
  })
  return styles
})
