import React, { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { CHAT_MESSAGE_TYPE } from '@holepunchto/keet-store/store/chat'

import { AVATAR_SIZE } from 'component/Avatar'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { useConfig } from 'lib/hooks/useRoom'

import ChatEventAvatar from './ChatEventAvatar'
import { ChatEventBlocked } from './ChatEventBlocked'
import { InappropriateMessageNotice } from './ChatEventInappropriateMessage'
import { ChatEventMessage, ChatEventMessageWithFile } from './ChatEventMessage'
import { ChatEventSystem } from './ChatEventSystem'
import { ChatEventTimeMessage } from './ChatEventTimeMessage'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEvent } from './hooks/useChatEvent'
import { useChatEventHandler } from './hooks/useChatEventHandler'
import useGetChatReactionsById from './hooks/useGetChatReactionsById'

const SYSTEM_EVENTS: number[] = [
  CHAT_MESSAGE_TYPE.JOINED,
  CHAT_MESSAGE_TYPE.LEFT,
  CHAT_MESSAGE_TYPE.ROOM_AVATAR_CHANGED,
  CHAT_MESSAGE_TYPE.ROOM_TITLE_CHANGED,
  CHAT_MESSAGE_TYPE.CALL_STARTED,
  CHAT_MESSAGE_TYPE.MEMBER_REMOVED,
]

const ChatEvent = memo(() => {
  const { messageId } = useChatEventContext()
  const roomId = useSelector(getAppCurrentRoomId) || ''
  const { roomType } = useConfig(roomId)
  const styles = getStyles()

  const event = useChatEvent(messageId)
  const {
    blocked,
    datetime,
    deleted,
    file,
    id,
    isHead,
    local,
    memberId,
    parentId,
    event: eventData,
  } = event

  const reactions = useGetChatReactionsById(id)
  const eventType = eventData?.type

  const { onPressAvatar, onLongPress } = useChatEventHandler({
    messageId,
    roomId,
    memberId,
    roomType,
    reactions,
  })

  const isJoined = eventType === CHAT_MESSAGE_TYPE.JOINED
  const isSystemEvent = !!eventType && SYSTEM_EVENTS.includes(eventType)
  const showHead = isHead || blocked
  const isHeaderVisible = !local && !(blocked && !!parentId) && !isSystemEvent
  const isReversedRow = local && !isJoined

  const renderContent = useCallback(() => {
    // Prioritize displaying "Blocked" over "Deleted"
    // If a message is both blocked and deleted, show blocked
    if (blocked) return <ChatEventBlocked />
    if (deleted) {
      return (
        <ChatEventMessage
          reactions={reactions}
          onLongPress={onLongPress}
          local={local}
        />
      )
    }

    if (isSystemEvent) {
      return (
        <ChatEventSystem
          eventType={eventType}
          isJoined={isJoined}
          reactions={reactions}
          onLongPress={onLongPress}
          onPressAvatar={onPressAvatar}
          parentId={parentId}
        />
      )
    }

    if (file) {
      return (
        <ChatEventMessageWithFile
          reactions={reactions}
          onLongPress={onLongPress}
          local={local}
        />
      )
    }

    return (
      <ChatEventMessage
        reactions={reactions}
        onLongPress={onLongPress}
        local={local}
      />
    )
  }, [
    blocked,
    deleted,
    eventType,
    file,
    reactions,
    onLongPress,
    local,
    parentId,
    isJoined,
    onPressAvatar,
    isSystemEvent,
  ])

  const content = renderContent()
  if (!content) return null

  return (
    <>
      {datetime && <ChatEventTimeMessage time={datetime} />}

      <View style={[styles.eventRow, isReversedRow && s.rowReverse]}>
        {isHeaderVisible && (
          <>
            <View
              style={[styles.avatarContainer, isReversedRow && s.justifyEnd]}
            >
              {showHead && <ChatEventAvatar onPressAvatar={onPressAvatar} />}
            </View>
            <View style={styles.separatorHorizontal} />
          </>
        )}

        <View
          style={[
            s.container,
            s.row,
            isReversedRow && s.rowReverse,
            isSystemEvent && styles.collapse,
          ]}
        >
          {content}
          {reactions?.inappropriateMessage && <InappropriateMessageNotice />}
        </View>

        {!isJoined && <View style={styles.separatorHorizontal} />}
        {isHeaderVisible && <View style={styles.avatarContainer} />}
      </View>
    </>
  )
})

const getStyles = createThemedStylesheet(() =>
  StyleSheet.create({
    avatarContainer: {
      paddingTop: 4,
      width: AVATAR_SIZE,
    },
    collapse: {
      paddingVertical: UI_SIZE_2,
      ...s.justifyCenter,
    },
    eventRow: {
      ...s.row,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_4,
    },
    separatorHorizontal: {
      width: UI_SIZE_8,
    },
  }),
)

export default ChatEvent
