import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_14 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { ChatEventContainer } from './ChatEventContainer'
import ChatEventTime from './ChatEventTime'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEvent } from './hooks/useChatEvent'

export const ChatEventMemberRemoved = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const { messageId } = useChatEventContext()
  const event = useChatEvent(messageId)
  const memberCount = event.groupCount ?? 1
  const isSingle = memberCount === 1

  return (
    <ChatEventContainer centered>
      <View style={s.centerAlignedRow}>
        <Text style={styles.text}>
          {isSingle
            ? strings.room.memberRemoved
            : strings.room.membersRemoved.replace('$1', `${memberCount}`)}
        </Text>
        <ChatEventTime timestamp={event.timestamp} />
      </View>
    </ChatEventContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    text: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
    },
  })
  return styles
})
