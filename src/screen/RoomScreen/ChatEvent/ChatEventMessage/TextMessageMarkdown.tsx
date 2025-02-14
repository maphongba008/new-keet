import React, { memo, useMemo, useRef } from 'react'
import { Dimensions, StyleSheet, Text } from 'react-native'

import { emojify } from '@holepunchto/emojis'

import { EmojiRive } from 'component/EmojiRive'
import { MarkDown } from 'component/MarkDown'
import ShowAllTextButton from 'component/ShowAllTextButton'
import { createThemedStylesheet } from 'component/theme'
import { useGetProcessedMarkdownText } from 'screen/RoomScreen/hooks/useGetProcessedMarkDownText'
import s, {
  DIRECTION_CODE,
  UI_SIZE_8,
  UI_SIZE_24,
  UI_SIZE_120,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { isSingleEmoji } from 'lib/messages'

export const CHAT_EVENT_COLUMN_WIDTH =
  Dimensions.get('window').width - UI_SIZE_120 - UI_SIZE_24

const MENTION_MEMBER_ID_REGEXP = /(?<=user\/)[a-zA-Z0-9]+/
const PREVIOUS_MENTION_USER_REGEXP = /(?<=\[@)(.*?)(?=\])/

interface TextMessageProps {
  text?: string
  roomId: string
  memberId: string
  onPress: (url: string) => void
  onLongPress: () => void
}

const TextMessageMarkdown = memo(
  ({ text = '', roomId, memberId, onPress, onLongPress }: TextMessageProps) => {
    const styles = getStyles()
    const isSingleEmojiData = isSingleEmoji(text)
    const {
      processedMessage = '',
      truncated,
      textWithLinks = '',
    } = useGetProcessedMarkdownText(text, true)

    // update mention username when changed by user
    const mdProcessedRef = useRef<string>(processedMessage)
    const mentionMemberId =
      mdProcessedRef.current.match(MENTION_MEMBER_ID_REGEXP)?.[0] || ''

    const { member } = useMember(roomId, mentionMemberId)

    mdProcessedRef.current = useMemo(() => {
      if (!processedMessage.includes('mention://')) {
        return processedMessage
      }

      const prevMentionDisplayName = processedMessage.match(
        PREVIOUS_MENTION_USER_REGEXP,
      )?.[0]

      if (prevMentionDisplayName !== member.displayName) {
        return processedMessage.replace(
          PREVIOUS_MENTION_USER_REGEXP,
          `${member.displayName}`,
        )
      }

      return processedMessage
    }, [member, processedMessage])

    if (isSingleEmojiData?.url) {
      return (
        <EmojiRive
          shortCode={isSingleEmojiData.shortCodes[0]}
          isDisableTouch
          style={styles.singleEmojiRive}
        />
      )
    }

    if (isSingleEmojiData) {
      return <Text style={styles.singleEmoji}>{emojify(text)}</Text>
    }

    return (
      <>
        <MarkDown
          md={mdProcessedRef.current}
          roomId={roomId}
          onPress={onPress}
          onLongPress={onLongPress}
        />
        {truncated && (
          <ShowAllTextButton
            roomId={roomId}
            memberId={memberId}
            messageId=""
            text={textWithLinks}
            onPress={onPress}
            asPlainText={true}
          />
        )}
      </>
    )
  },
)
export default TextMessageMarkdown

const getStyles = createThemedStylesheet((theme) => {
  const padding = theme.spacing.standard
  const styles = StyleSheet.create({
    bottomTime: {
      ...s.rowStartCenter,
      marginLeft: UI_SIZE_8,
    },
    msgFile: {
      backgroundColor: undefined,
      marginTop: 0,
      paddingHorizontal: 0,
    },
    removeMessageText: {
      color: theme.color.grey_200,
      fontSize: 14,
      writingDirection: DIRECTION_CODE,
    },
    separatorVertical: {
      height: UI_SIZE_8,
    },
    shortText: {
      maxWidth: CHAT_EVENT_COLUMN_WIDTH,
      overflow: 'hidden',
    },
    showAllContainer: {
      alignItems: 'center',
      borderRadius: UI_SIZE_8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    showAllText: {
      ...theme.text.body,
      color: theme.color.blue_400,
    },
    singleEmoji: {
      ...theme.text.body,
      fontSize: 40,
      letterSpacing: -0.3,
      lineHeight: 46,
      paddingTop: 6,
      writingDirection: DIRECTION_CODE,
    },
    singleEmojiRive: { height: 45, width: 45 },

    wrapHeaderStyle: {
      ...s.row,
      ...s.flexSpaceBetween,
      paddingBottom: padding / 2,
    },
    wrapHeaderTimeOnlyStyle: {
      ...s.row,
      ...s.justifyEnd,
      paddingBottom: padding / 2,
    },
  })
  return styles
})
