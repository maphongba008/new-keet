import React from 'react'

import { CHAT_MESSAGE_TYPE } from '@holepunchto/keet-store/store/chat'

import { ChatEventType, ReactionsType } from 'lib/types.js'

import { ChatEventAvatarChanged } from './ChatEventAvatarChanged'
import { ChatEventCallStarted } from './ChatEventCallStarted'
import { ChatEventJoinedLeft } from './ChatEventJoined'
import { ChatEventMemberRemoved } from './ChatEventMemberRemoved'
import { ChatEventTitleChanged } from './ChatEventTitleChanged'
import { onLongPressType } from '../ChatEvents/hooks/useOnLongPressMessage.js'

interface Props {
  eventType: number
  isJoined: boolean
  reactions: ReactionsType
  onLongPress: (event: ChatEventType, opts: onLongPressType) => void
  onPressAvatar: () => void
  parentId?: string
}

export const ChatEventSystem = ({
  eventType,
  isJoined,
  reactions,
  onLongPress,
  onPressAvatar,
  parentId,
}: Props) => {
  const commonProps = { reactions, onLongPress }

  switch (eventType) {
    case CHAT_MESSAGE_TYPE.CALL_STARTED:
      return <ChatEventCallStarted />
    // We still show joined/left msg even the user is blocked
    case CHAT_MESSAGE_TYPE.JOINED:
    case CHAT_MESSAGE_TYPE.LEFT:
      if (parentId) return null
      return <ChatEventJoinedLeft isJoined={isJoined} {...commonProps} />
    case CHAT_MESSAGE_TYPE.ROOM_AVATAR_CHANGED:
      return (
        <ChatEventAvatarChanged
          {...commonProps}
          onPressAvatar={onPressAvatar}
        />
      )
    case CHAT_MESSAGE_TYPE.ROOM_TITLE_CHANGED:
      return (
        <ChatEventTitleChanged onPressAvatar={onPressAvatar} {...commonProps} />
      )
    case CHAT_MESSAGE_TYPE.MEMBER_REMOVED:
      if (parentId) return null
      return <ChatEventMemberRemoved />
    default:
      return null
  }
}
