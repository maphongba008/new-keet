import React, { memo } from 'react'
import { GestureResponderEvent, Pressable } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { MemberAvatar } from 'component/Avatar'
import { RoomAvatarImage } from 'component/RoomAvatarImage'
import { APPIUM_IDs } from 'lib/appium'
import { UI_SIZE_4 } from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { getRoomTypeFlags, useConfig } from 'lib/hooks/useRoom'
import { ChatEventType, MemberType } from 'lib/types'

import { ChatEventBlockedAvatar } from './ChatEventBlockedAvatar'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEvent } from './hooks/useChatEvent'

interface AvatarContentProps {
  isChannel: boolean
  member?: MemberType
  blocked: boolean | undefined
  roomId: string
}

const AvatarContent = memo(
  ({ isChannel, member, blocked, roomId }: AvatarContentProps) => {
    const isChannelModerator = isChannel && member?.canModerate

    if (isChannelModerator) {
      return (
        <RoomAvatarImage
          roomId={roomId}
          testID={APPIUM_IDs.room_profile_avatar}
        />
      )
    }

    if (blocked) {
      return <ChatEventBlockedAvatar />
    }

    return <MemberAvatar member={member || {}} />
  },
  isEqual,
)

interface ChatEventAvatarProps {
  onPressAvatar: (event: GestureResponderEvent) => void
  messageEvent?: ChatEventType
}

const ChatEventAvatar = memo(
  ({ onPressAvatar, messageEvent }: ChatEventAvatarProps) => {
    const { messageId } = useChatEventContext()
    const roomId = useSelector(getAppCurrentRoomId)
    const { roomType } = useConfig(roomId)
    const eventFromHook = useChatEvent(messageId)
    const event = messageEvent || eventFromHook
    const { memberId, blocked } = event

    const { member } = useMember(roomId, memberId)
    const { isChannel } = getRoomTypeFlags(roomType)

    return (
      <Pressable onPress={onPressAvatar} hitSlop={UI_SIZE_4}>
        <AvatarContent
          isChannel={isChannel}
          member={member}
          blocked={blocked}
          roomId={roomId}
        />
      </Pressable>
    )
  },
  isEqual,
)

export default ChatEventAvatar
