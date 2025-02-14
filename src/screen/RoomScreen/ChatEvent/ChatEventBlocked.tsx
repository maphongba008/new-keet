import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_12, UI_SIZE_14 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { ChatEventContainer } from './ChatEventContainer'
import ChatEventTime from './ChatEventTime'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEvent } from './hooks/useChatEvent'

export const ChatEventBlocked = memo(() => {
  const { messageId } = useChatEventContext()
  const event = useChatEvent(messageId)
  const isMine = event.local
  const styles = getStyles()
  const strings = useStrings()
  const count = event.groupCount || 1
  const message =
    count === 1 ? strings.chat.messageBlocked : strings.chat.messagesBlocked

  if (event.parentId) {
    return null
  }

  return (
    <ChatEventContainer fromLocal={isMine}>
      <Text style={styles.name}>{strings.chat.blockedUserName}</Text>
      <View style={s.centerAlignedRow}>
        <Text style={styles.removeMessageText}>
          {message.replace('($0)', String(count))}
        </Text>
        <ChatEventTime timestamp={event.timestamp} withPadding />
      </View>
    </ChatEventContainer>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    name: {
      ...theme.text.bodySemiBold,
      fontSize: UI_SIZE_12,
      writingDirection: DIRECTION_CODE,
    },
    removeMessageText: {
      color: theme.color.grey_200,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
