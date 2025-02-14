import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { getChatMessageIsAnchorId } from '@holepunchto/keet-store/store/chat'
import {
  getFileEntryById,
  getFileId,
} from '@holepunchto/keet-store/store/media/file'

import { createThemedStylesheet } from 'component/theme'
import { useFileId } from 'screen/RoomScreen/hooks/useFileId'
import s, { UI_SIZE_4, UI_SIZE_6, UI_SIZE_8 } from 'lib/commonStyles'
import { getIsVoiceNote, getMediaType } from 'lib/fs'
import { getIsFileOutOfProportion } from 'lib/media/getIsFileOutOfProportion'
import { isDisplayFormat, processEmoji } from 'lib/messages'
import { getState } from 'lib/store'

import { ChatEventLinkPreviewMessage } from './ChatEventLinkPreviewMessage'
import {
  getLinkPreviews,
  getTimeStampPosition,
  hasLinkPreviews,
} from './ChatEventMessage.helpers'
import {
  ChatEventMessageHeader,
  MessageContent,
  MessageMetadata,
} from './ChatEventMessageContent'
import {
  ChatEventMessageProps,
  ChatEventMessageReplyI,
  EVENT_MESSAGE_TIMESTAMP_POSITION,
  OnLongPressParams,
} from './types'
import { ChatEventContainer } from '../ChatEventContainer'
import { ChatEventReplyMessageComponent } from '../ChatEventReply'
import { useChatEventContext } from '../context/ChatEventContext'
import {
  ChatEventFileContext,
  ChatEventFileContextValue,
  useChatEventFileContext,
} from '../context/ChatEventFileContext'
import { getHasAnyReaction } from '../helpers/getHasAnyReaction'
import { useChatEvent } from '../hooks/useChatEvent'
import usePressMessageHandler from '../hooks/usePressMessageHandler'
import ReactionsBar from '../ReactionsBar'

const ChatEventMessageReply = memo(({ replyToId }: ChatEventMessageReplyI) => {
  if (!replyToId) {
    return null
  }
  return <ChatEventReplyMessageComponent replyToId={replyToId} />
}, isEqual)

export const ChatEventMessage = memo((props: ChatEventMessageProps) => {
  const { messageId } = useChatEventContext()
  const roomId = useSelector(getAppCurrentRoomId)
  const replyToId = useChatEvent(messageId).replyTo
  const {
    reactions,
    onLongPress,
    local,
    messageEvent,
    fromPinnedScreen,
    maxLinkPreviews = 5,
  } = props
  const styles = getStyles()
  const eventFromHook = useChatEvent(messageId)

  const event = messageEvent || eventFromHook
  const file = useChatEventFileContext()
  const isMe = local

  const { deleted, id, isHead, memberId } = event
  const { text, edited, format } = event.chat || {}
  const isDisplay = isDisplayFormat(format)
  const isFromPinnedScreen = fromPinnedScreen!
  const onPressMessage = usePressMessageHandler(local)

  const isAnchor: boolean = useSelector(getChatMessageIsAnchorId(id))
  const hasReaction = getHasAnyReaction(reactions)

  const {
    inappropriateMessage: reported,
    mineInappropriateReported: reportedByMe,
  } = reactions

  const showOriginMessage = !reportedByMe && !reported
  const isFile = Boolean(file.key) && showOriginMessage
  const fileId = useMemo(
    () =>
      file
        ? getFileId({
            driveId: file.key,
            version: file.version,
            path: file.path,
          })
        : null,
    [file],
  )

  const { isImage, isVideo } = useMemo(
    () => getMediaType(file?.path, file?.type),
    [file?.path, file?.type],
  )

  const isMedia =
    (isImage && !getIsFileOutOfProportion(file.dimensions)) || isVideo

  const onLongPressHandler = useCallback(
    (opts?: OnLongPressParams) => {
      const params: OnLongPressParams = {
        isSkipToEmojiSheet: opts?.isSkipToEmojiSheet,
      }

      const fileEntry = fileId ? getFileEntryById(getState(), fileId) : null

      if (fileEntry) {
        params.src = fileEntry.httpLink
        params.cleared = fileEntry.cleared
        params.byteLength = fileEntry.byteLength
      }

      onLongPress(event, {
        ...params,
      })
    },
    [fileId, onLongPress, event],
  )

  // Swapping Emoji's from :keet_music: to 'e', calculate the string length to position the time component
  let emojis = processEmoji(text || '')
  emojis = emojis.replaceAll(/\[\]\(:\S+:\)/g, 'e')

  const { httpLinks, pearLinks } = getLinkPreviews(event)
  const hasLinks = hasLinkPreviews(event)
  const isVoiceNote = getIsVoiceNote(file?.type, file.path)

  const isShortText = useMemo(() => {
    return (
      !!emojis && emojis.length <= 20 && !emojis.includes('\n') && !hasLinks
    )
  }, [hasLinks, emojis])

  const timeStampPosition = getTimeStampPosition({
    isMe: local,
    event,
    isVoiceNote,
    reported,
    isShortText,
    isFromPinnedScreen,
  })

  const isTimeStampBottom =
    timeStampPosition === EVENT_MESSAGE_TIMESTAMP_POSITION.BOTTOM
  const isTimeStampNextToTextMiddle =
    timeStampPosition ===
      EVENT_MESSAGE_TIMESTAMP_POSITION.NEXT_TO_TEXT_MIDDLE && !fromPinnedScreen
  const isMessageHeader = (!isMe && isHead) || isFromPinnedScreen
  const isTimeStampInline =
    isTimeStampBottom &&
    !isFile &&
    isDisplay &&
    !httpLinks?.length &&
    !pearLinks?.length

  const renderLinkPreview = useCallback(
    ({ preview }: any, index: number) => {
      // Limit the amount of link preview to show to maxLinkPreviews(5 as default)
      if (index > maxLinkPreviews) {
        return null
      }
      return (
        <ChatEventLinkPreviewMessage
          event={preview}
          key={index}
          fromLocal={local}
        />
      )
    },
    [maxLinkPreviews, local],
  )

  return (
    <ChatEventContainer
      fromLocal={local}
      style={isFromPinnedScreen ? styles.pinnedScreen : {}}
      onLongPress={onLongPressHandler}
      shouldHighlight={isAnchor}
    >
      {isMessageHeader && (
        <ChatEventMessageHeader
          id={id}
          roomId={roomId}
          edited={edited!}
          memberId={memberId}
          event={event}
        />
      )}
      <ChatEventMessageReply replyToId={replyToId} />
      <View>
        <View
          style={[
            s.row,
            s.centerAlignedRow,
            s.flexSpaceBetween,
            isMedia && s.alignSelfCenter,
          ]}
        >
          <MessageContent
            roomId={roomId}
            isMe={!!local}
            event={event}
            messageId={messageId}
            showOriginMessage={showOriginMessage}
            isShortText={isShortText}
            isFile={isFile}
            reported={reported}
            reportedByMe={reportedByMe}
            onPressMessage={onPressMessage}
            onLongPressHandler={onLongPressHandler}
            includeExtraSpacing={isTimeStampInline}
          />
          {isTimeStampNextToTextMiddle && (
            <MessageMetadata id={id} event={event} edited={edited!} />
          )}
        </View>
        {isTimeStampInline && (
          <MessageMetadata
            id={id}
            event={event}
            edited={edited!}
            wrapperStyle={[
              s.alignItemsEnd,
              hasReaction || !hasLinks ? styles.extraMargin : {},
            ]}
            inline
          />
        )}
      </View>

      {!fromPinnedScreen && httpLinks?.map(renderLinkPreview)}
      {!fromPinnedScreen && pearLinks?.map(renderLinkPreview)}

      {hasReaction && !hasLinks && !deleted && (
        <View style={styles.separatorVertical} />
      )}
      {!deleted && !reported && !reportedByMe && (
        <ReactionsBar
          reactions={reactions}
          messageId={id}
          onLongPress={onLongPressHandler}
          isMineEvent={local}
          canAdd={!isFromPinnedScreen}
        />
      )}
      {isTimeStampBottom && !isTimeStampInline && (
        <MessageMetadata
          id={id}
          event={event}
          edited={edited!}
          wrapperStyle={[
            s.alignItemsEnd,
            hasReaction || !hasLinks ? styles.extraMargin : {},
          ]}
        />
      )}
    </ChatEventContainer>
  )
}, isEqual)

function withFileHOC(
  WrappedComponent: React.ComponentType<ChatEventMessageProps>,
) {
  return memo((props: ChatEventMessageProps) => {
    const { messageId } = useChatEventContext()
    const event = useChatEvent(messageId)

    const fileProp = event.file!
    const fileId = useFileId({
      driveId: fileProp?.key || '',
      path: fileProp?.path || '',
      version: fileProp?.version || 0,
    })

    const fileDetails = useMemo((): ChatEventFileContextValue => {
      return { ...fileProp, id: fileId }
    }, [fileId, fileProp])

    return (
      <ChatEventFileContext.Provider value={fileDetails}>
        <WrappedComponent {...props} />
      </ChatEventFileContext.Provider>
    )
  })
}

export const ChatEventMessageWithFile = withFileHOC(ChatEventMessage)

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    extraMargin: { marginTop: UI_SIZE_6 },
    pinnedScreen: {
      padding: 0,
      paddingVertical: UI_SIZE_4,
    },
    separatorVertical: {
      height: UI_SIZE_8,
    },
  })
  return styles
})
