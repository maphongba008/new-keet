import { useCallback, useMemo } from 'react'
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { getFileId } from '@holepunchto/keet-store/store/media/file'
import {
  getRoomInfoFiles,
  getRoomInfoFilesInViewRange,
  getRoomInfoFilesTab,
  reloadRoomFiles,
  ROOM_INFO_FILES_PER_ROW,
  ROOM_INFO_FILES_TAB,
  RoomFileRaw,
  setRoomInfoFilesInViewRange,
} from '@holepunchto/keet-store/store/room'

import GestureContainer from 'component/GestureContainer'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, {
  height,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { useDidMount } from 'lib/hooks'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { isIOS } from 'lib/platform'

import { ROOM_FILE_ROW_SIZE, RoomFileRow } from './RoomFileRow'
import { RoomFilesTabBar } from './RoomFilesTabBar'
import { ROOM_FILE_TILE_SIZE, RoomFileTile } from './RoomFileTile'

const DEFAILT_ROOM_INFO_FILES_PER_ROW = 1

export const RoomFilesScreen = () => {
  const activeTab = useDeepEqualSelector(getRoomInfoFilesTab)
  const files = useDeepEqualSelector((state) =>
    getRoomInfoFiles(state).filter(({ cleared }) => !cleared),
  )
  const dispatch = useDispatch()
  const filesInViewRange = useDeepEqualSelector(getRoomInfoFilesInViewRange)
  const nFilesRow = useMemo(() => {
    if (activeTab === ROOM_INFO_FILES_TAB.MEDIA) {
      return ROOM_INFO_FILES_PER_ROW.MEDIA
    }
    return DEFAILT_ROOM_INFO_FILES_PER_ROW
  }, [activeTab])
  const insets = useSafeAreaInsets()
  const roomFileHeight =
    activeTab === ROOM_INFO_FILES_TAB.MEDIA
      ? ROOM_FILE_TILE_SIZE
      : ROOM_FILE_ROW_SIZE
  const nFilesScreen = useMemo(
    () => nFilesRow * Math.floor((height - insets.top - 44) / roomFileHeight),
    [insets.top, nFilesRow, roomFileHeight],
  )
  useDidMount(() => dispatch(reloadRoomFiles()))

  const onViewChange = useCallback(
    (top: number, bottom: number) => {
      dispatch(
        setRoomInfoFilesInViewRange({
          top: top,
          bottom: Math.max(bottom, nFilesScreen),
        }),
      )
    },
    [dispatch, nFilesScreen],
  )

  const styles = getStyles()

  const getItemLayout = useCallback(
    (_: unknown, index: number) => {
      const rowSize =
        styles.contentContainer.gap +
        (activeTab === ROOM_INFO_FILES_TAB.MEDIA
          ? ROOM_FILE_TILE_SIZE
          : ROOM_FILE_ROW_SIZE)

      return {
        length: rowSize,
        offset: styles.contentContainer.paddingTop + rowSize * index,
        index,
      }
    },
    [
      activeTab,
      styles.contentContainer.gap,
      styles.contentContainer.paddingTop,
    ],
  )

  const renderFile: ListRenderItem<RoomFileRaw> = useCallback(
    ({ item: file, index }) => {
      if (file.cleared) return null
      const notInView =
        index < filesInViewRange.top || index > filesInViewRange.bottom
      const nFilesVisible = Math.abs(
        filesInViewRange.bottom - filesInViewRange.top,
      )

      if (notInView || nFilesVisible === 0) {
        return (
          <View
            style={
              activeTab === ROOM_INFO_FILES_TAB.MEDIA
                ? styles.mediaPlaceholder
                : styles.otherPlaceholder
            }
          />
        )
      }
      if (activeTab === ROOM_INFO_FILES_TAB.MEDIA) {
        return <RoomFileTile {...file} index={index} />
      }

      return <RoomFileRow {...file} />
    },
    [
      activeTab,
      filesInViewRange.bottom,
      filesInViewRange.top,
      styles.mediaPlaceholder,
      styles.otherPlaceholder,
    ],
  )
  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<RoomFileRaw>[]
      changed: ViewToken<RoomFileRaw>[]
    }) => {
      const indexes = viewableItems.reduce((acc, { index }) => {
        if (typeof index === 'number') acc.push(index)

        return acc
      }, [] as number[])

      onViewChange(Math.min(...indexes), Math.max(...indexes))
    },
    [onViewChange],
  )
  const tabs = useMemo(
    () => [
      ROOM_INFO_FILES_TAB.MEDIA,
      ROOM_INFO_FILES_TAB.AUDIO,
      ROOM_INFO_FILES_TAB.DOCS,
    ],
    [],
  )

  return (
    <GestureContainer>
      <NavBar
        title={null}
        middle={<RoomFilesTabBar tabs={tabs} />}
        right={null}
        showTapToCallButton
      />
      <View style={styles.container}>
        <FlatList<RoomFileRaw>
          key={activeTab}
          data={files}
          renderItem={renderFile}
          keyExtractor={getFileId}
          getItemLayout={getItemLayout}
          decelerationRate={isIOS ? 0.95 : 0.92} // Avoid seeing blank areas by limiting scroll
          scrollEventThrottle={16}
          contentContainerStyle={styles.contentContainer}
          numColumns={nFilesRow}
          initialNumToRender={nFilesRow}
          maxToRenderPerBatch={nFilesRow}
          onViewableItemsChanged={onViewableItemsChanged}
          columnWrapperStyle={
            activeTab === ROOM_INFO_FILES_TAB.MEDIA
              ? styles.columnContainer
              : undefined
          }
        />
      </View>
    </GestureContainer>
  )
}

export default RoomFilesScreen

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    columnContainer: {
      gap: UI_SIZE_4,
      width: ROOM_FILE_TILE_SIZE * 4 + UI_SIZE_4 * 3,
    },
    container: {
      ...s.container,
      paddingTop: UI_SIZE_8,
    },
    contentContainer: {
      gap: UI_SIZE_8,
      paddingBottom: UI_SIZE_12,
      paddingHorizontal: UI_SIZE_16,
      paddingTop: UI_SIZE_12,
    },
    mediaPlaceholder: {
      height: ROOM_FILE_TILE_SIZE,
      width: ROOM_FILE_TILE_SIZE,
    },
    otherPlaceholder: {
      flex: 1,
      height: ROOM_FILE_ROW_SIZE,
    },
  })
  return styles
})
