// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/chat-input.js
import React, { FC, memo, useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet } from 'react-native'
import isEqual from 'react-fast-compare'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_8 } from 'lib/commonStyles'
import { UploadFile, useRoomUploadsAndPending } from 'lib/uploads'

import { ChatInputAttachment } from './ChatInputAttachment'
import { ChatInputAttachmentPending } from './ChatInputAttachmentPending'

interface ChatInputAttachmentPreviewProps {
  roomId: string
}

const keyExtractor = (item: UploadFile | null, index: number) =>
  item ? item.id : `pending-${index}`

export const ChatInputAttachmentsPreview: FC<ChatInputAttachmentPreviewProps> =
  memo(({ roomId }) => {
    const styles = getStyles()

    const uploads = useRoomUploadsAndPending(roomId)

    const renderItem: ListRenderItem<UploadFile | null> = useCallback(
      ({ item, index }) => {
        if (!item || item.isDownloading)
          return (
            <ChatInputAttachmentPending isLinkPreview={item?.isLinkPreview} />
          )
        return <ChatInputAttachment {...item} index={index} />
      },

      [],
    )

    if (uploads.length === 0) {
      return null
    }

    return (
      <FlatList
        horizontal
        style={styles.list}
        data={uploads}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    )
  }, isEqual)

export default ChatInputAttachmentsPreview

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    list: {
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})
