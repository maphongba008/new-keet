import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

import {
  getRoomListActualIds,
  getRoomListSearchActive,
  getRoomListSearchIds,
  ROOM_TYPE_FILTER,
} from '@holepunchto/keet-store/store/room'

import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import useLobbyFilterByRoomType from 'lib/hooks/useLobbyFilter'
import { useRoomSearchCount } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

import RoomListFilterModal from './RoomList.FilterOptions'
import { RoomListSection } from './RoomList.Section'

export const RoomListFilter = () => {
  const isSearchActive = useSelector(getRoomListSearchActive)
  const actualRoomIds = useDeepEqualSelector(getRoomListActualIds)
  const searchRoomIds = useDeepEqualSelector(getRoomListSearchIds)
  const roomIds = isSearchActive ? searchRoomIds : actualRoomIds
  const { hasSearchEmpty } = useRoomSearchCount(roomIds.length)

  const strings = useStrings()

  const {
    currentRoomTypes,
    filterModalVisible,
    iconPosition,
    roomTypeFilterOptions,
    handleSelect,
    closeModal,
    showFilterModal,
    getTitleByRoomType,
  } = useLobbyFilterByRoomType()

  const isFilterActive = useMemo(
    () =>
      !(
        currentRoomTypes.length === 1 &&
        currentRoomTypes[0] === ROOM_TYPE_FILTER.ALL
      ),
    [currentRoomTypes],
  )

  const title = useMemo(() => {
    if (isSearchActive) {
      return strings.lobby.filterOptions.allRooms
    }
    const sortedRoomType = currentRoomTypes.slice().sort((a, b) => a - b)
    if (sortedRoomType.length === 1) {
      return getTitleByRoomType(sortedRoomType[0])
    }
    if (sortedRoomType.length === 2) {
      return sortedRoomType.map((item) => getTitleByRoomType(item)).join(' & ')
    }
    return strings.lobby.filterOptions.allRooms
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoomTypes, isSearchActive])

  const isShowSection =
    (!hasSearchEmpty || !isFilterActive) && roomIds.length > 0

  return (
    <>
      {isShowSection && (
        <RoomListSection
          title={title}
          showModal={filterModalVisible}
          roomTypes={currentRoomTypes}
          showFilterModal={showFilterModal}
        />
      )}
      <RoomListFilterModal
        filterModalVisible={filterModalVisible}
        iconPosition={iconPosition}
        selectedFilter={currentRoomTypes}
        roomTypeFilterOptions={roomTypeFilterOptions}
        closeFilterModal={closeModal}
        handleSelect={handleSelect}
      />
    </>
  )
}
