import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import { makeGetPinnedChatMessageById } from '@holepunchto/keet-store/store/chat'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
} from 'lib/commonStyles'
import { timestampToOutOfOrderTimestamp, timestampToTimeString } from 'lib/date'
import { isDisplayFormat } from 'lib/messages'
import { ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import TextMessageDisplay from './TextMessageDisplay'
import TextMessageMarkdown, {
  CHAT_EVENT_COLUMN_WIDTH,
} from './TextMessageMarkdown'
import {
  ChatEventMessageHeaderI,
  MessageContentI,
  MessageMetadataI,
} from './types'
import { ChatEventFile } from '../ChatEventFile'
import ChatEventHeader from '../ChatEventHeader'
import {
  InappropriateMessageBlur,
  InappropriateReportedMessage,
} from '../ChatEventInappropriateMessage'
import ChatEventTime from '../ChatEventTime'

export const ChatEventPinned = memo(({ messageId }: { messageId: string }) => {
  const styles = getStyles()
  const getIsPinned = useMemo(
    () => makeGetPinnedChatMessageById(messageId),
    [messageId],
  )
  const isPinned = useSelector(getIsPinned)

  if (!isPinned) {
    return null
  }

  return (
    <SvgIcon
      name="pushPinFilled"
      width={UI_SIZE_12}
      height={UI_SIZE_12}
      color={colors.keet_grey_200}
      style={styles.pin}
    />
  )
}, isEqual)

export const ChatEventMessageHeader = memo(
  ({ id, memberId, roomId, edited, event }: ChatEventMessageHeaderI) => {
    const styles = getStyles()
    const { timestamp, isOutOfOrder } = event

    return (
      <View style={styles.wrapHeaderStyle} renderToHardwareTextureAndroid>
        <ChatEventHeader memberId={memberId} roomId={roomId} />
        <View style={s.centerAlignedRow}>
          <ChatEventPinned messageId={id} />
          <ChatEventTime
            timestamp={timestamp}
            isOutOfOrder={isOutOfOrder}
            isEdited={edited}
            withPadding
          />
        </View>
      </View>
    )
  },
  isEqual,
)

export const MessageContent = memo(
  ({
    roomId,
    isFile,
    isMe,
    messageId,
    isShortText,
    event,
    reported,
    reportedByMe,
    showOriginMessage,
    onPressMessage,
    onLongPressHandler,
    includeExtraSpacing,
  }: MessageContentI) => {
    const styles = getStyles()
    const strings = useStrings()
    const { deleted, memberId } = event
    const { text, format, styledFragments, display } = event.chat || {}

    const isDisplay = isDisplayFormat(format)
    const isText =
      (!!text || (isDisplay && (display?.length ?? 0) > 0)) && showOriginMessage

    if (deleted) {
      return (
        <View style={[s.rowStartCenter, s.flexSpaceBetween]}>
          <Text style={styles.removeMessageText}>
            {strings.chat.messageDeleted}
          </Text>
        </View>
      )
    }

    if (!!reportedByMe && !reported) {
      return <InappropriateReportedMessage />
    }

    if (reported) {
      return <InappropriateMessageBlur />
    }

    return (
      <>
        {isFile && (
          <View style={styles.msgFile}>
            <View style={isMe && s.alignItemsEnd}>
              <ChatEventFile onLongPress={onLongPressHandler} />
            </View>
          </View>
        )}
        {isText && (
          <View
            style={isShortText && !isDisplay ? styles.shortText : undefined}
          >
            {isDisplay ? (
              <Text>
                <TextMessageDisplay
                  roomId={roomId}
                  memberId={memberId}
                  messageId={messageId}
                  text={text}
                  styledFragments={styledFragments}
                  onPress={onPressMessage}
                  onLongPress={onLongPressHandler}
                />
                {includeExtraSpacing && (
                  <MessageMetadataSpacing event={event} />
                )}
              </Text>
            ) : (
              <TextMessageMarkdown
                text={text}
                roomId={roomId}
                memberId={memberId}
                onPress={onPressMessage}
                onLongPress={onLongPressHandler}
              />
            )}
          </View>
        )}
      </>
    )
  },
  isEqual,
)

export const MessageMetadata = memo(
  ({ id, edited, event, wrapperStyle, inline }: MessageMetadataI) => {
    const styles = getStyles()
    const { timestamp, isOutOfOrder } = event
    return (
      <View style={[wrapperStyle, inline && styles.abosolute]}>
        <View style={s.centerAlignedRow}>
          <ChatEventPinned messageId={id} />
          <ChatEventTime
            timestamp={timestamp}
            isOutOfOrder={isOutOfOrder}
            isEdited={edited}
            withPadding
          />
        </View>
      </View>
    )
  },
  isEqual,
)

export const MessageMetadataSpacing = memo(
  ({ event }: { event: ChatEventType }) => {
    const styles = getStyles()
    const strings = useStrings()
    const { timestamp, isOutOfOrder } = event
    const { edited } = event.chat!
    const getIsPinned = useMemo(
      () => makeGetPinnedChatMessageById(event.id),
      [event.id],
    )
    const isPinned = useSelector(getIsPinned)
    const metadata = useMemo(() => {
      let string = isOutOfOrder
        ? timestampToOutOfOrderTimestamp(timestamp)
        : timestampToTimeString(timestamp)
      /** m as a wide char represents paddings and non-text elements in text */
      if (edited) string += `mm${strings.chat.edited}`
      if (isPinned) string += `mmmm`
      return string
    }, [edited, isOutOfOrder, isPinned, strings, timestamp])

    return <Text style={styles.spacer}>{metadata}</Text>
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const padding = theme.spacing.standard

  const styles = StyleSheet.create({
    abosolute: {
      bottom: 0,
      position: 'absolute',
      right: UI_SIZE_4,
    },
    msgFile: {
      backgroundColor: undefined,
      marginTop: 0,
      paddingHorizontal: 0,
    },
    pin: {
      marginStart: theme.spacing.standard,
    },
    pinnedScreen: {
      padding: 0,
      paddingVertical: UI_SIZE_4,
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
    spacer: {
      color: colors.transparent,
      fontSize: 20,
      lineHeight: 1,
    },
    wrapHeaderStyle: {
      ...s.row,
      ...s.flexSpaceBetween,
      paddingBottom: padding / 2,
    },
  })
  return styles
})
