import React, { memo, useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { AVATAR_SIZE, MemberAvatar } from 'component/Avatar'
import MemberTag from 'component/MemberTag'
import { createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { ReactionsType, type ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { ChatEventContainer } from './ChatEventContainer'
import { CHAT_EVENT_COLUMN_WIDTH } from './ChatEventMessage/TextMessageMarkdown'
import ChatEventTime from './ChatEventTime'
import { useChatEventContext } from './context/ChatEventContext'
import { getHasAnyReaction } from './helpers/getHasAnyReaction'
import { getMemberTextStyle } from './helpers/getMemberTextStyle'
import { useChatEvent } from './hooks/useChatEvent'
import ReactionsBar from './ReactionsBar'
import { onLongPressType } from '../ChatEvents/hooks/useOnLongPressMessage'

interface EventAvatarChangedProps {
  reactions: ReactionsType
  onLongPress: (event: ChatEventType, opts: onLongPressType) => void
  onPressAvatar: () => void
}

export const ChatEventAvatarChanged = memo(
  ({ reactions, onLongPress, onPressAvatar }: EventAvatarChangedProps) => {
    const { messageId } = useChatEventContext()
    const roomId = useSelector(getAppCurrentRoomId)
    const event = useChatEvent(messageId)
    const styles = getStyles()
    const strings = useStrings()
    const { memberId } = event
    const { member } = useMember(roomId, memberId)

    const textStyle = getMemberTextStyle(member)

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

    const memberName = member.isLocal
      ? strings.chat.you
      : member.blocked
        ? strings.chat.blockedUserName
        : member.displayName

    const isReaction = getHasAnyReaction(reactions)

    return (
      <ChatEventContainer centered onLongPress={onLongPressEvent}>
        <View style={[s.rowStartCenter, s.container]}>
          <Pressable
            style={styles.avatarContainer}
            onLongPress={onPressAvatar}
            hitSlop={UI_SIZE_4}
          >
            <MemberAvatar member={member} />
          </Pressable>
          <View style={[s.row, s.alignItemsCenter, styles.title]}>
            <Text>
              <Text style={textStyle}>{`${memberName} `}</Text>
              {!member.isLocal && (
                <MemberTag
                  member={member}
                  containerStyleProps={styles.memberTagContainer}
                />
              )}
              <Text style={styles.text}>{strings.chat.roomAvatarChanged}</Text>
            </Text>
          </View>

          <ChatEventTime timestamp={event.timestamp} withPadding />
        </View>

        <View style={isReaction && styles.reactions}>
          <ReactionsBar
            reactions={reactions}
            messageId={event.id}
            onLongPress={onLongPressEvent}
          />
        </View>
      </ChatEventContainer>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatarContainer: {
      paddingRight: UI_SIZE_8,
      width: AVATAR_SIZE + UI_SIZE_8,
    },
    memberTagContainer: {
      marginRight: UI_SIZE_4,
    },
    reactions: {
      paddingLeft: AVATAR_SIZE + UI_SIZE_8,
      paddingTop: UI_SIZE_4 + UI_SIZE_2,
    },
    text: {
      ...theme.text.body,
      fontSize: 15,
      letterSpacing: -0.3,
      lineHeight: 20,
      textAlignVertical: 'center',
      writingDirection: DIRECTION_CODE,
    },
    title: {
      maxWidth: CHAT_EVENT_COLUMN_WIDTH,
    },
  })
  return styles
})
