import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, TextStyle } from 'react-native'
import isEqual from 'react-fast-compare'

import { CHAT_MESSAGE_TYPE } from '@holepunchto/keet-store/store/chat'

import { InappropriateMessageBlur } from 'screen/RoomScreen/ChatEvent/ChatEventInappropriateMessage'
import TextMessageDisplay from 'screen/RoomScreen/ChatEvent/ChatEventMessage/TextMessageDisplay'
import { DIRECTION_CODE, UI_SIZE_24 } from 'lib/commonStyles'
import { escapeNameMd } from 'lib/md'
import { getTruncatedName, isDisplayFormat, processEmoji } from 'lib/messages'
import { ChatLastMessageType, MemberType } from 'lib/types'

import { Strings, useStrings } from 'i18n/strings'

import { MarkdownPreview } from './MarkdownPreview'
import { colors, createThemedStylesheet, useTheme } from './theme'

interface GetPreviewTextParams {
  message: ChatLastMessageType['message']
  strings: Strings
  member?: MemberType
}

const getPreviewText = ({ message, strings, member }: GetPreviewTextParams) => {
  if (!message) return ''

  const senderName = member?.isLocal
    ? strings.chat.you
    : getTruncatedName(member?.displayName || '')

  if (message.deleted) return strings.chat.messageDeleted
  if (message.blocked) return strings.chat.messageFromBlockedUser
  if (message.reportedByMe) return strings.chat.inappropriateReported

  if (message.chat?.text) {
    let text = message.chat.text

    if (member?.displayName && !member?.isLocal) {
      text = formatReceivedMessage(text)
    }

    if (member?.isLocal) {
      text = formatSentMessage(text)
    }

    return processEmoji(text)
  }

  if (message.event) {
    return getEventMessage(message.event, senderName, strings)
  }

  if (message.file) {
    return strings.chat.sentAttachment
  }
}

const formatReceivedMessage = (text: string) => {
  return text
    .replace(/(\w+:)(\s*\*)/g, '$1\n$2') // Newline after sender's name
    .replace(/^(\*\s+)/, '● ') // Replace first `*` with bullet
}

const formatSentMessage = (text: string) => {
  return text
    .replace(/^(-\s+)/, '● ') // Replace first `-` with bullet
    .replace(/(\n-)/g, '\n●') // Replace subsequent `-` with bullets
}

const getEventMessage = (event: any, senderName: string, strings: Strings) => {
  switch (event.type) {
    case CHAT_MESSAGE_TYPE.JOINED:
      return `${senderName} ${strings.chat.messageJoined}`
    case CHAT_MESSAGE_TYPE.LEFT:
      return `${senderName} ${strings.chat.messageLeft}`
    case CHAT_MESSAGE_TYPE.ROOM_AVATAR_CHANGED:
      return `${senderName} ${strings.chat.roomAvatarChanged}`
    case CHAT_MESSAGE_TYPE.ROOM_TITLE_CHANGED:
      return `${senderName} ${strings.chat.roomNameChanged}`
    case CHAT_MESSAGE_TYPE.CALL_STARTED:
      return senderName === strings.chat.you
        ? `${senderName} ${strings.chat.haveStartedACall}`
        : `${senderName} ${strings.chat.callStarted}`
    case CHAT_MESSAGE_TYPE.MEMBER_REMOVED:
      const memberCount = event.groupCount ?? 1
      const isSingle = memberCount === 1
      return isSingle
        ? strings.room.memberRemoved
        : strings.room.membersRemoved.replace('$1', `${memberCount}`)
    default:
      return ''
  }
}

export interface MessagePreviewProps {
  message?: ChatLastMessageType['message']
  member?: MemberType
  isChannel?: boolean
  isDm?: boolean
  unread?: boolean
  isFocused?: boolean
  roomId?: string
}

const MessagePreview = memo(
  ({
    message,
    member,
    isChannel = false,
    isDm = false,
    unread = false,
    isFocused,
    roomId,
  }: MessagePreviewProps) => {
    const strings = useStrings()
    const theme = useTheme()
    const styles = getStyles()

    const previewStyle = useMemo(
      () => [
        styles.messagePreview,
        { color: unread ? colors.white_snow : theme.color.grey_200 },
      ],
      [styles.messagePreview, theme.color.grey_200, unread],
    ) as TextStyle[]

    if (!message) return null

    const sender = member?.isLocal ? strings.chat.you : member?.displayName
    const preview = getPreviewText({ message, strings, member }) || ''
    const { event, id, chat } = message || {}
    const format = chat?.format || ''
    const isDisplay = isDisplayFormat(chat?.format)
    const shouldShowSender =
      !isChannel && !isDm && !event && sender && !member?.blocked
    const displaySender = shouldShowSender ? sender : ''
    const isText = !event && (chat?.text || (isDisplay && format?.length > 0))
    const displayWithoutFormatting =
      message?.blocked || message?.deleted || message?.reportedByMe
    const text = shouldShowSender
      ? `${escapeNameMd(sender)}: ` + preview
      : `${preview}`

    if (message?.reported) return <InappropriateMessageBlur />

    return (
      <>
        {isText ? (
          isDisplay ? (
            <TextMessageDisplay
              roomId={roomId}
              messageId={id}
              text={preview}
              styledFragments={chat?.styledFragments}
              sender={displaySender}
              textStyle={previewStyle}
              displayWithoutFormatting={displayWithoutFormatting}
              forPreview
            />
          ) : (
            <MarkdownPreview
              text={text}
              style={previewStyle}
              ellipsizeMode="tail"
              numberOfLines={2}
              isFocused={isFocused}
              roomId={roomId}
            />
          )
        ) : (
          <Text
            style={[styles.messagePreview, theme.text.body, previewStyle]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {text}
          </Text>
        )}
      </>
    )
  },
  isEqual,
)

export default MessagePreview

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    messagePreview: {
      fontSize: MESSAGE_FONT_SIZE,
      lineHeight: ITEM_LINE_HEIGHT, // some icons is larger than the text
      marginRight: UI_SIZE_24,
      textAlign: 'left',
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

const MESSAGE_FONT_SIZE = 13
const ITEM_LINE_HEIGHT = 19
