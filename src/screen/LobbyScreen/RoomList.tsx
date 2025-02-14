// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/room/room-list.js
import React, { memo, useCallback, useRef } from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { useFocusEffect, useScrollToTop } from '@react-navigation/native'
import _compact from 'lodash/compact'
import _isNaN from 'lodash/isNaN'
import _size from 'lodash/size'
import _throttle from 'lodash/throttle'

import {
  getRoomListActualIds,
  getRoomListInView,
  getRoomListIsCache,
  getRoomListIsError,
  getRoomListIsLoading,
  getRoomListSearchActive,
  getRoomListSearchIds,
  leaveRoomAsk,
  setItemsInView,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import {
  getIsStoreReady,
  getLobbyUpdating,
  getShareContent,
} from 'reducers/application'

import { showOptionsSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { KeetLoading } from 'component/Loading'
import { NavBar, NavBarLoading } from 'component/NavBar'
import { useTheme } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import { IS_SENTRY_ENABLED } from 'lib/build.constants'
import s from 'lib/commonStyles'
import {
  BACK_DEBOUNCE_DELAY,
  VIEWABLE_ITEM_DEBOUNCE_OPTIONS,
} from 'lib/constants'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { useLobbyResetRoomId, useNavigateToRoom } from 'lib/hooks/useRoom'
import { keyboardBehavior } from 'lib/keyboard'
import { localStorage } from 'lib/localStorage'
import { getState } from 'lib/store'

import { useStrings } from 'i18n/strings'

import RoomActionsBtn from './RoomActionsBtn'
import { RoomListEmpty } from './RoomList.Empty'
import { RoomListHeader } from './RoomList.Header'
import { RoomListItem } from './RoomList.Item'
import { RoomSearch } from './RoomSearch'

const screen = Dimensions.get('screen')
const roomListItemSize = 80
const roomListPageSize = Math.ceil(screen.height / roomListItemSize) - 1
const getItemCount = (data: any[]) => _size(data)
const getItem = (data: any[], index: number) => data[index]
const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 5,
  waitForInteraction: true,
}

export const RoomList = memo(() => {
  const actualRoomIds = useDeepEqualSelector(getRoomListActualIds)
  const isSearchActive = useSelector(getRoomListSearchActive)
  const searchRoomIds = useDeepEqualSelector(getRoomListSearchIds)
  const roomIds = isSearchActive ? searchRoomIds : actualRoomIds
  const shareContent = useDeepEqualSelector(getShareContent)
  const isCache = useSelector(getRoomListIsCache)
  const isStoreReady = useSelector(getIsStoreReady)
  const isLoading = useSelector(getRoomListIsLoading)
  const isError = useSelector(getRoomListIsError)
  const { bottom } = useDeepEqualSelector(getRoomListInView)
  const lobbyUpdating = useSelector(getLobbyUpdating)

  const dispatch = useDispatch()
  const strings = useStrings()
  const theme = useTheme()

  // scroll to the top when home tab-bar presses
  const scrollRef = useRef<VirtualizedList<string>>(null)
  useScrollToTop(scrollRef)
  useLobbyResetRoomId()

  // State will be reset when visit ID screen. It will have room data back, just not know the limits. So init again
  useFocusEffect(
    useCallback(() => {
      if (isLoading || !isStoreReady) return
      if (bottom === 0 || isSearchActive) {
        dispatch(setItemsInView({ top: 0, bottom: roomListPageSize }))
      }
    }, [bottom, dispatch, isLoading, isSearchActive, isStoreReady]),
  )

  const initiateRoomNavigation = useNavigateToRoom()
  const onPress = useCallback(
    (roomId: string) => {
      dispatch(switchRoomSubmit({ roomId }))
      initiateRoomNavigation(roomId)
    },
    [dispatch, initiateRoomNavigation],
  )

  const onLongPress = useCallback(
    (roomId: string, canLeaveRoom: boolean) => {
      const options = _compact([
        canLeaveRoom && {
          onPress: () => {
            dispatch(leaveRoomAsk(roomId))
          },
          title: strings.room.leave,
          icon: 'arrowRightFromBracket',
          iconColor: theme.color.danger,
          disabled: false,
          testID: APPIUM_IDs.lobby_bottomsheet_btn_leave,
        },
        IS_SENTRY_ENABLED && {
          onPress: () => {
            localStorage.setItem(`chat/last-seen-seq_${roomId}`, '0')
          },
          title: 'Reset unread message count',
          icon: 'trash',
          iconColor: theme.color.danger,
          disabled: false,
        },
      ])
      if (options.length) {
        showOptionsSheet({
          options,
        })
      }
    },
    [dispatch, strings.room.leave, theme.color.danger],
  )

  const renderRoomItem = useCallback(
    ({ item: roomId }: { item: string }) => {
      return (
        <RoomListItem
          roomId={roomId}
          onLongPress={onLongPress}
          onPress={onPress}
        />
      )
    },
    [onLongPress, onPress],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleViewableItemsChanged = useCallback(
    _throttle(
      ({ viewableItems }: any) => {
        const { top, bottom: _bottom } = getRoomListInView(getState())
        const viewableTop = viewableItems[0]?.index
        const viewableBottom = viewableItems[_size(viewableItems) - 1]?.index
        if (
          _isNaN(viewableTop) ||
          _isNaN(viewableBottom) ||
          (viewableTop === top && viewableBottom === _bottom)
        )
          return
        dispatch(setItemsInView({ top: viewableTop, bottom: viewableBottom }))
      },
      BACK_DEBOUNCE_DELAY,
      VIEWABLE_ITEM_DEBOUNCE_OPTIONS,
    ),
    [dispatch],
  )

  const RoomListError = useCallback(() => {
    return (
      <View style={[s.container, s.centeredLayout]}>
        <Text style={theme.text.placeholder}>
          {strings.lobby.errorLoadingRooms} 😕
        </Text>
      </View>
    )
  }, [strings.lobby.errorLoadingRooms, theme.text.placeholder])

  const keyExtractor = useCallback((roomId: string) => roomId, [])

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={0}
    >
      <NavBar
        showOfflineBar
        showTapToCallButton
        title=""
        left={null}
        middle={lobbyUpdating ? <NavBarLoading /> : <RoomSearch />}
        right={<RoomActionsBtn />}
        topTitle={shareContent.length > 0 ? strings.common.sendTo : null}
      />
      <View style={s.container}>
        {isLoading && !isCache ? (
          <View style={[s.container, s.centeredLayout]}>
            <KeetLoading />
          </View>
        ) : isError ? (
          <RoomListError />
        ) : (
          <>
            <VirtualizedList
              ref={scrollRef}
              initialNumToRender={roomListPageSize}
              decelerationRate={0.85}
              showsVerticalScrollIndicator={false}
              keyExtractor={keyExtractor}
              data={roomIds}
              ListHeaderComponent={RoomListHeader}
              renderItem={renderRoomItem}
              getItemCount={getItemCount}
              contentContainerStyle={styles.scrollViewContent}
              ListEmptyComponent={RoomListEmpty}
              getItem={getItem}
              windowSize={7}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              keyboardDismissMode="on-drag"
              removeClippedSubviews={false}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}, isEqual)

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
})
