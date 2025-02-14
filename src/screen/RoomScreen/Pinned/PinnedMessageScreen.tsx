import React, { useCallback, useMemo } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import _noop from 'lodash/noop'

import roomsApi from '@holepunchto/keet-store/api/rooms'
import {
  getPinnedChatMessages,
  getPinnedChatMessagesCount,
  setPinnedTabIsOpen,
  toggleMessagePinnedStatusCmd,
} from '@holepunchto/keet-store/store/chat'
import {
  filterReportedFromReactions,
  getReportedFromReactions,
} from '@holepunchto/keet-store/store/chat/chat-reaction.model'
import { canModerate, getMyMember } from '@holepunchto/keet-store/store/member'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { OptionSheetOption } from 'component/AppBottomSheet/SheetComponents/components/OptionsButtonList'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'
import { useConfig } from 'lib/hooks/useRoom'
import { ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import ChatEventAvatar from '../ChatEvent/ChatEventAvatar'
import { ChatEventMessage } from '../ChatEvent/ChatEventMessage'
import { ChatEventContext } from '../ChatEvent/context/ChatEventContext'

// @ts-ignore
const { useSubscribeReactionsQuery } = roomsApi

const PinnedMessageItem: React.FC<{
  roomId: string
  event: ChatEventType
}> = ({ roomId, event }) => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()
  const { id, coreId } = event
  const { roomType } = useConfig(roomId)
  const myMember: { capabilities: number } = useSelector(getMyMember(roomId))

  const { currentData } = useSubscribeReactionsQuery({
    roomId,
    messageId: coreId,
  })

  const reactions = useMemo(() => {
    const mine = currentData?.mine || []
    const messageReactions = currentData?.digest.reactions || []
    const { reactions: filteredReactions } = filterReportedFromReactions({
      reactions: messageReactions,
      mine,
    })
    const { reported, reportedByMe } =
      getReportedFromReactions(messageReactions, mine) || {}
    return {
      reactions: filteredReactions,
      mine,
      mineInappropriateReported: reportedByMe,
      inappropriateMessage: reported,
    }
  }, [currentData])

  const onLongPress = useCallback(() => {
    const options: OptionSheetOption[] = [
      {
        title: strings.chat.unpin,
        icon: 'pushPinFilled',
        onPress: () =>
          dispatch(toggleMessagePinnedStatusCmd({ messageId: id })),
      },
    ]

    if (canModerate(myMember?.capabilities)) {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.OptionsSheet,
        options,
      })
    }
  }, [dispatch, id, myMember?.capabilities, strings.chat.unpin])

  const context = useMemo(
    () => ({
      roomId,
      roomType,
      messageId: id,
      replyToId: '',
    }),
    [roomId, roomType, id],
  )

  return (
    <ChatEventContext.Provider value={context}>
      <View style={styles.eventRow}>
        <View style={styles.avatarContainer}>
          <ChatEventAvatar messageEvent={event} onPressAvatar={_noop} />
        </View>
        <View style={styles.separator} />
        <View style={[s.container, s.row]}>
          <Pressable style={styles.messageContainer} onLongPress={onLongPress}>
            <ChatEventMessage
              reactions={reactions}
              local={false}
              messageEvent={event}
              onLongPress={onLongPress}
              fromPinnedScreen
            />
          </Pressable>
        </View>
      </View>
    </ChatEventContext.Provider>
  )
}

const PinnedMessageScreen = WithRoomIdRendered(
  ({ roomId }: { roomId: string }) => {
    const dispatch = useDispatch()
    const strings = useStrings()
    const count = useSelector(getPinnedChatMessagesCount)
    const title = `${count} ${
      count === 1 ? strings.chat.pinnedChat : strings.chat.pinnedChats
    }`
    const messages: ChatEventType[] = useSelector(getPinnedChatMessages)
    const { bottom: marginBottom } = useSafeAreaInsets()

    const setIsPinnedTabOpen = useCallback(
      (isOpen: boolean) => dispatch(setPinnedTabIsOpen(isOpen)),
      [dispatch],
    )

    useFocusEffect(
      useCallback(() => {
        setIsPinnedTabOpen(true)

        return () => {
          setIsPinnedTabOpen(false)
        }
      }, [setIsPinnedTabOpen]),
    )

    const renderEvent = useCallback(
      ({ item }: { item: ChatEventType }) => {
        return <PinnedMessageItem event={item} roomId={roomId} />
      },
      [roomId],
    )

    return (
      <View style={[s.container, { marginBottom }]}>
        <NavBar title={title} centerTitle />
        <FlatList data={messages} renderItem={renderEvent} />
      </View>
    )
  },
)

export default PinnedMessageScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatarContainer: {
      paddingTop: UI_SIZE_4,
    },
    eventRow: {
      ...s.row,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_4,
    },
    messageContainer: {
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_14,
      borderTopLeftRadius: 0,
      flex: 0.8,
      padding: UI_SIZE_8,
    },
    separator: {
      width: UI_SIZE_8,
    },
  })
  return styles
})
