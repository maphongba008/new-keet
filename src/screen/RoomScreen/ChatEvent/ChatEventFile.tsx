import React, { memo, useCallback, useContext, useMemo } from 'react'
import { View } from 'react-native'
import { ImageStyle } from 'expo-image'

import {
  MediaFileMimeType,
  useMediaPreviewSource,
} from 'screen/MediaPreviewScreen'
import s from 'lib/commonStyles'
import { getMediaType } from 'lib/fs'
import { useFile } from 'lib/hooks/useFile'
import { IndexContext } from 'lib/IndexContext'

import { ChatEventFileError } from './ChatEventFileError'
import { useChatEventFileContext } from './context/ChatEventFileContext'
import { useChatFileComponent } from './hooks/useChatEventFile'
import { CHAT_EVENT_FILE_GROUP_ID } from '../Chat.hooks'
import { useUpdateClearedFile } from '../hooks/useUpdateClearedFile'

interface ChatFileProps {
  onLongPress?: () => void
  style?: ImageStyle
}

export const ChatEventFile = memo(({ onLongPress, style }: ChatFileProps) => {
  const file = useChatEventFileContext()
  const { path, id: fileId, type, dimensions } = file
  const [fileEntry, { error }] = useFile(fileId)
  const { httpLink: uri = '', cleared, previews } = fileEntry || {}
  const previewUri = previews?.large || undefined
  const updateClearFile = useUpdateClearedFile()

  const toggleCleared = useCallback(() => {
    updateClearFile(fileId, !cleared)
  }, [cleared, fileId, updateClearFile])

  const index = useContext(IndexContext)
  const { isImage, isSVG, isVideo, isAudio, isSupportedFileType } = useMemo(
    () => getMediaType(path, type),
    [path, type],
  )

  const ChatFileComponent = useChatFileComponent({
    isImage,
    isSVG,
    isVideo,
    isAudio,
    isSupportedFileType,
    hasPreview: Boolean(previewUri),
  })

  const setRefs = useMediaPreviewSource(
    {
      uri,
      previewUri,
      groupId: CHAT_EVENT_FILE_GROUP_ID,
      index,
      mediaType: type as MediaFileMimeType,
      aspectRatio: dimensions
        ? dimensions.height / dimensions.width
        : undefined,
      isReversed: true,
      id: fileId,
    },
    isSupportedFileType && (isVideo || isImage),
  )

  if (error) {
    return <ChatEventFileError name={path} />
  }

  return (
    <View ref={setRefs} collapsable={false} style={s.alignItemsStart}>
      <ChatFileComponent
        onToggleClear={toggleCleared}
        onLongPress={onLongPress}
        isSupportedFileType={isSupportedFileType}
        style={style}
      />
    </View>
  )
})
