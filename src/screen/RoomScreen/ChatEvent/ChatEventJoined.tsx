import React, { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import _uniq from 'lodash/uniq'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { AVATAR_SIZE } from 'component/Avatar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_2, UI_SIZE_4, UI_SIZE_8 } from 'lib/commonStyles'
import { ReactionsType, type ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { ChatEventContainer } from './ChatEventContainer'
import ChatEventTime from './ChatEventTime'
import { useChatEventContext } from './context/ChatEventContext'
import { EventMembers } from './EventMembers'
import { getHasAnyReaction } from './helpers/getHasAnyReaction'
import { useChatEvent } from './hooks/useChatEvent'
import ReactionsBar from './ReactionsBar'
import { onLongPressType } from '../ChatEvents/hooks/useOnLongPressMessage'

interface EventJoinedType {
  reactions: ReactionsType
  onLongPress: (event: ChatEventType, opts: onLongPressType) => void
  isJoined: boolean
}

export const ChatEventJoinedLeft = memo(
  ({ reactions, onLongPress, isJoined }: EventJoinedType) => {
    const { messageId } = useChatEventContext()
    const roomId = useSelector(getAppCurrentRoomId)
    const event = useChatEvent(messageId)
    const styles = getStyles()
    const strings = useStrings()

    const isReaction = getHasAnyReaction(reactions)

    const memberIds = event.groupMemberIds
      ? _uniq(event.groupMemberIds)
      : [event.memberId]

    const onLongPressEvent = useCallback(
      (opts?: any) => {
        onLongPress(event, {
          src: opts?.src,
          cleared: opts?.cleared,
          isSkipToEmojiSheet: opts?.isSkipToEmojiSheet,
        })
      },
      [event, onLongPress],
    )

    if (event?.hidden) {
      return null
    }

    return (
      <ChatEventContainer centered onLongPress={onLongPressEvent}>
        <View style={s.centerAlignedRow}>
          <EventMembers
            memberIds={memberIds}
            roomId={roomId}
            text={
              isJoined ? strings.chat.messageJoined : strings.chat.messageLeft
            }
            isMe={event.local}
          />
          <ChatEventTime timestamp={event.timestamp} withPadding />
        </View>
        <View style={isReaction && styles.joinedReactions}>
          <ReactionsBar
            reactions={reactions}
            messageId={event.id}
            onLongPress={onLongPressEvent}
          />
        </View>
      </ChatEventContainer>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    joinedReactions: {
      paddingLeft: AVATAR_SIZE + UI_SIZE_8,
      paddingTop: UI_SIZE_4 + UI_SIZE_2,
    },
  })
  return styles
})
