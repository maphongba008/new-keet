import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, ICON_SIZE_16, UI_SIZE_8 } from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'

import { useStrings } from 'i18n/strings'

import { ChatEventContainer } from './ChatEventContainer'
import ChatEventTime from './ChatEventTime'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEvent } from './hooks/useChatEvent'

export const ChatEventCallStarted = memo(() => {
  const { messageId } = useChatEventContext()
  const roomId = useSelector(getAppCurrentRoomId)
  const { memberId, timestamp } = useChatEvent(messageId)
  const strings = useStrings()
  const styles = getStyles()
  const { member } = useMember(roomId, memberId)

  return (
    <ChatEventContainer centered>
      <View style={styles.container}>
        <SvgIcon
          color={colors.white_snow}
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
          name="phone"
        />
        <Text style={styles.textMention}>
          {member?.isLocal
            ? strings.chat.you
            : member?.blocked
              ? strings.chat.blockedUserName
              : (member?.displayName ?? '')}
          <Text style={styles.text}>
            {' '}
            {member?.isLocal
              ? strings.chat.haveStartedACall
              : strings.chat.callStarted}{' '}
          </Text>
        </Text>

        <ChatEventTime timestamp={timestamp} />
      </View>
    </ChatEventContainer>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: { ...s.centerAlignedRow, paddingHorizontal: 8 },
    text: {
      ...theme.text.body,
      fontSize: 15,
      letterSpacing: -0.3,
      lineHeight: 21,
      writingDirection: DIRECTION_CODE,
    },
    textMention: {
      ...theme.text.bodyBold,
      fontSize: 15,
      lineHeight: 21,
      maxWidth: '90%',
      paddingHorizontal: UI_SIZE_8,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
