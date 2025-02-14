import React, { memo, useCallback } from 'react'
import { FlatListProps, ListRenderItem, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { FlatList as BidirectionalFlatList } from 'react-native-bidirectional-infinite-scroll'
import { ScrollView } from 'react-native-gesture-handler'

import { getChatMessageIds } from '@holepunchto/keet-store/store/chat'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_4 } from 'lib/commonStyles'
import { interactiveKeyboardDismissMode } from 'lib/platform'

import { useRoomScreenRefContext } from '../ContextProvider/RoomScreenRefProvider'
import { ESTIMATED_ITEM_TO_RENDER } from '../hooks/useScrollToLatestMsg'

const VIEWABILITY_CONFIG = {
  waitForInteraction: false,
  itemVisiblePercentThreshold: 4,
  minimumViewTime: 0,
}

interface ChatEventsList extends Partial<FlatListProps<string>> {
  renderEvent: ListRenderItem<string>
  isBroadCastRoom?: boolean
}
const getItemId = (item: string, index: number) => (item ? item : `${index}`)

// Keep it pure, avoid adding any state here.
const ChatEventsList = memo(
  ({
    renderEvent,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onViewableItemsChanged,
    isBroadCastRoom,
  }: ChatEventsList) => {
    const { flatListRef } = useRoomScreenRefContext()
    const messages = useSelector(getChatMessageIds)
    const styles = getStyles()
    const renderScrollComponent = useCallback(
      // @ts-ignore Need ScrollView from gesture-handler because RoomScreen.tsx is wrapped in GestureContainer
      (props: ScrollViewProps) => <ScrollView {...props} />,
      [],
    )

    return (
      <BidirectionalFlatList
        data={messages}
        inverted
        renderItem={renderEvent}
        // @ts-ignore revisit to get type of bidirectional flatlist
        ref={flatListRef}
        keyboardDismissMode={interactiveKeyboardDismissMode}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        decelerationRate={0.85}
        scrollEventThrottle={16}
        keyExtractor={getItemId}
        key="posts"
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        renderScrollComponent={renderScrollComponent}
        initialNumToRender={isBroadCastRoom ? 30 : ESTIMATED_ITEM_TO_RENDER}
        showDefaultLoadingIndicators={false}
        removeClippedSubviews={false}
        contentContainerStyle={styles.contentContainerStyle}
      />
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    contentContainerStyle: { top: UI_SIZE_4 },
  })
  return styles
})

export default ChatEventsList
