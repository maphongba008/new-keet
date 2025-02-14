import React, { memo, useCallback, useMemo } from 'react'
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
import { useChatEvent } from './hooks/useChatEvent'
import ReactionsBar from './ReactionsBar'
import { onLongPressType } from '../ChatEvents/hooks/useOnLongPressMessage'

interface EventTitleChanged {
  reactions: ReactionsType
  onLongPress: (event: ChatEventType, opts: onLongPressType) => void
  onPressAvatar: () => void
}

export const ChatEventTitleChanged = memo(
  ({ reactions, onLongPress, onPressAvatar }: EventTitleChanged) => {
    const { messageId } = useChatEventContext()
    const roomId = useSelector(getAppCurrentRoomId)
    const event = useChatEvent(messageId)
    const styles = getStyles()
    const strings = useStrings()
    const { memberId } = event
    const { member } = useMember(roomId, memberId)

    const isAdmin = member?.canModerate && member?.canIndex
    const isModerator = member?.canModerate
    const isMe = member.isLocal

    const { textStyle } = useMemo(() => {
      if (isMe) {
        return { textStyle: styles.textMention }
      }
      if (isAdmin) {
        const adminTextStyle = [styles.textMention, styles.adminLabel]
        return { textStyle: adminTextStyle }
      }
      if (isModerator) {
        const moderatorTextStyle = [styles.textMention, styles.modLabel]
        return { textStyle: moderatorTextStyle }
      }
      return {
        textStyle: styles.textMention,
      }
    }, [styles, isAdmin, isModerator, isMe])

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
    const isReaction = getHasAnyReaction(reactions)

    return (
      <ChatEventContainer centered onLongPress={onLongPressEvent}>
        <View style={[s.rowStartCenter, s.container]}>
          <Pressable
            style={styles.avatarContainerJoined}
            onLongPress={onPressAvatar}
            hitSlop={UI_SIZE_4}
          >
            <MemberAvatar member={member} />
          </Pressable>
          <View style={[s.row, s.alignItemsCenter, styles.joinedTitle]}>
            <Text>
              <Text style={textStyle}>
                {member.isLocal
                  ? strings.chat.you
                  : member.blocked
                    ? strings.chat.blockedUserName
                    : member.displayName}{' '}
              </Text>
              {!member.isLocal && (
                <MemberTag
                  member={member}
                  containerStyleProps={styles.memberTagContainer}
                />
              )}
              <Text style={styles.text}>{strings.chat.roomNameChanged}</Text>
            </Text>
          </View>

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
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    adminLabel: {
      color: theme.memberTypes.admin,
    },
    avatarContainerJoined: {
      paddingRight: UI_SIZE_8,
      width: AVATAR_SIZE + UI_SIZE_8,
    },
    extraMargin: {
      marginRight: UI_SIZE_4,
    },
    joinedReactions: {
      paddingLeft: AVATAR_SIZE + UI_SIZE_8,
      paddingTop: UI_SIZE_4 + UI_SIZE_2,
    },
    joinedTitle: {
      maxWidth: CHAT_EVENT_COLUMN_WIDTH,
    },
    memberTagContainer: {
      marginRight: UI_SIZE_4,
    },
    modLabel: {
      color: theme.memberTypes.mod,
    },
    text: {
      ...theme.text.body,
      fontSize: 15,
      letterSpacing: -0.3,
      lineHeight: 20,
      textAlignVertical: 'center',
      writingDirection: DIRECTION_CODE,
    },
    textMention: {
      ...theme.text.bodyBold,
      fontSize: 15,
      lineHeight: 20,
      textAlignVertical: 'center',
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
