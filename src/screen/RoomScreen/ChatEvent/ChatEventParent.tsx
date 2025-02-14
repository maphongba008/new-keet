import React, { memo, useCallback, useMemo } from 'react'
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import _isEmpty from 'lodash/isEmpty'

import { getChatMessageSeqLoaded } from '@holepunchto/keet-store/store/chat'

import { getSessionLastSeenSeq } from 'reducers/application'

import { createThemedStylesheet } from 'component/theme'
import { DIRECTION_CODE, UI_SIZE_8 } from 'lib/commonStyles'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import ChatEvent from './ChatEvent'
import ChatEventPlaceholder from './ChatEventPlaceholder'
import {
  ChatEventContext,
  useChatEventContext,
} from './context/ChatEventContext'
import { useChatEvent } from './hooks/useChatEvent'
import { useScrollToLatestOnLatestChatEventHeightChange } from '../Chat.hooks'

// For list its important at least show the item in order to trigger onViewableItemsChanged
const ChatEventTail = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const seqLoaded = useDeepEqualSelector(getChatMessageSeqLoaded)
  const { messageId } = useChatEventContext()
  const event = useChatEvent(messageId)
  const sessionLastSeenSeq = useSelector(getSessionLastSeenSeq)

  const isDisplayUnread = useCallback(() => {
    if (event.seq === sessionLastSeenSeq && !event.groupCount) {
      return <Text style={styles.unreadMsg}>{strings.chat.unreadMessages}</Text>
    }
  }, [
    event.groupCount,
    event.seq,
    sessionLastSeenSeq,
    strings.chat.unreadMessages,
    styles.unreadMsg,
  ])

  const isDisplayMinHeight = useCallback(() => {
    if (event.seq === seqLoaded.bottom || seqLoaded.top)
      return <View style={styles.minimumHeight} />
  }, [event.seq, seqLoaded.bottom, seqLoaded.top, styles.minimumHeight])

  return (
    <>
      {isDisplayUnread()}
      {isDisplayMinHeight()}
    </>
  )
})

const ChatEventParent = memo(
  ({ messageId, index }: { messageId: ChatEventType['id']; index: number }) => {
    const event = useChatEvent(messageId)

    const chatEventContext = useMemo(
      () => ({
        messageId,
      }),
      [messageId],
    )

    const setLatestChatEventHeight =
      useScrollToLatestOnLatestChatEventHeightChange()

    const onChatEventLayout = useCallback(
      (_event: LayoutChangeEvent) => {
        if (index === 0) {
          setLatestChatEventHeight({
            id: messageId,
            height: _event.nativeEvent.layout.height,
          })
        }
      },
      [index, messageId, setLatestChatEventHeight],
    )

    if (_isEmpty(event)) return <ChatEventPlaceholder />

    return (
      <ChatEventContext.Provider value={chatEventContext}>
        <ChatEventTail />
        <View onLayout={onChatEventLayout}>
          <ChatEvent />
        </View>
      </ChatEventContext.Provider>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    minimumHeight: {
      height: 1,
    },
    unreadMsg: {
      ...theme.text.bodyBold,
      backgroundColor: theme.color.almost_black,
      color: theme.color.grey_300,
      flex: 1,
      fontSize: 14,
      marginTop: theme.spacing.standard / 2,
      padding: UI_SIZE_8,
      textAlign: 'center',
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default ChatEventParent
