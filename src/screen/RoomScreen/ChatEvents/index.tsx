// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/chat-events.js
import React, { memo, useCallback } from 'react'
import {
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { getChatMessageInitialLoading } from '@holepunchto/keet-store/store/chat'
import { getNetworkOnline } from '@holepunchto/keet-store/store/network'

import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_32, UI_SIZE_64 } from 'lib/commonStyles'
import { getRoomTypeFlags, useConfig } from 'lib/hooks/useRoom'
import { IndexContext } from 'lib/IndexContext'

import { useStrings } from 'i18n/strings'

import { ChatEventsAnchor } from './ChatEventsAnchor'
import ChatEventsList from './ChatEventsList'
import useAutoScrollIfLowUnreadOnInit from './hooks/useAutoScrollIfLowUnreadOnInit'
import useIsUserViewingLatestMsg from './hooks/useIsUserViewingLatestMsg'
import useLastSeenBanner from './hooks/useLastSeenBanner'
import useOnViewableItemsChanged from './hooks/useOnViewableItemsChanged'
import ChatEventParent from '../ChatEvent/ChatEventParent'
import useAutoScrollOnNewMessage from '../ChatEvent/hooks/useAutoScrollOnNewMessage'

const ChatEvents = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const roomId = useSelector(getAppCurrentRoomId)
  const { roomType } = useConfig(roomId)
  const isNetworkOnline = useSelector(getNetworkOnline)
  const onViewableItemsChanged = useOnViewableItemsChanged()

  useAutoScrollIfLowUnreadOnInit()
  useAutoScrollOnNewMessage()
  useLastSeenBanner()

  const {
    onScrollBeginDrag,
    onScrollEndDrag,
    onScroll: onScrollIfViewingLatest,
  } = useIsUserViewingLatestMsg()

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollIfViewingLatest(e)
    },
    [onScrollIfViewingLatest],
  )
  const renderEvent = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => {
      return (
        <IndexContext.Provider value={index}>
          <ChatEventParent messageId={item} index={index} />
        </IndexContext.Provider>
      )
    },
    [],
  )

  const initialLoading = useSelector(getChatMessageInitialLoading)
  if (initialLoading) {
    if (!isNetworkOnline) {
      return (
        <View style={[s.container, s.centeredLayout, s.flexGrow]}>
          <SvgIcon name="keetFilled" width={UI_SIZE_64} height={UI_SIZE_64} />
          <Text style={styles.offlineText}>
            {strings.networkStatus.offlineText}
          </Text>
        </View>
      )
    }
    return (
      <View style={[s.container, s.centeredLayout, s.flexGrow]}>
        <Loading style={styles.loading} />
      </View>
    )
  }
  const { isChannel } = getRoomTypeFlags(roomType)

  return (
    <>
      <ChatEventsList
        renderEvent={renderEvent}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onViewableItemsChanged={onViewableItemsChanged}
        isBroadCastRoom={isChannel}
      />
      <ChatEventsAnchor />
    </>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    loading: {
      height: UI_SIZE_32,
      width: UI_SIZE_32,
    },
    offlineText: {
      ...theme.text.body,
      marginVertical: theme.spacing.standard / 2,
    },
  })
  return styles
})

export default ChatEvents
