import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import _compact from 'lodash/compact'
import _includes from 'lodash/includes'
import _isEqual from 'lodash/isEqual'
import _without from 'lodash/without'

import {
  ROOM_LIST_STATE_KEY,
  ROOM_STATE_KEY,
  ROOM_TYPE_FILTER,
  setRoomTypesFilter,
} from '@holepunchto/keet-store/store/room'

import {
  ModalOptionsTypes,
  RoomFilterOptionTypes,
} from 'screen/LobbyScreen/types'
import { SHOW_BROADCAST_FILTER } from 'lib/build.constants'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { getActiveRoomFilterKey, setRoomFilterOption } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

import useStateDeepEqual from './useStateDeepEqual'

export const useCurrentRoomTypes = (): ROOM_TYPE_FILTER[] => {
  return useDeepEqualSelector(
    (state: any) => state[ROOM_STATE_KEY][ROOM_LIST_STATE_KEY].roomTypesFilter,
  )
}

export const useIsFilterActive = () => {
  const currentRoomTypes = useCurrentRoomTypes()
  return useMemo(
    () =>
      !(
        currentRoomTypes.length === 0 ||
        (currentRoomTypes.length === 1 &&
          currentRoomTypes[0] === ROOM_TYPE_FILTER.ALL)
      ),
    [currentRoomTypes],
  )
}

const useLobbyFilterByRoomType = () => {
  const strings = useStrings()
  const dispatch = useDispatch()

  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [iconPosition, setIconPosition] = useStateDeepEqual({ top: 0 })
  const currentRoomTypes = useCurrentRoomTypes()
  useEffect(() => {
    const updateRoomType = async () => {
      const roomTypes = await getActiveRoomFilterKey()
      if (!roomTypes) return
      if (
        !SHOW_BROADCAST_FILTER &&
        _isEqual(roomTypes, [ROOM_TYPE_FILTER.BROADCAST])
      ) {
        dispatch(setRoomTypesFilter([ROOM_TYPE_FILTER.ALL]))
        return
      }
      if (roomTypes) dispatch(setRoomTypesFilter(roomTypes))
    }
    updateRoomType()
  }, [dispatch])

  const onSelect = useCallback(
    (value: ROOM_TYPE_FILTER[]) => {
      setRoomFilterOption(value)
      dispatch(setRoomTypesFilter(value))
    },
    [dispatch],
  )

  const showFilterModal = useCallback(
    (data: Pick<RoomFilterOptionTypes, 'iconPosition'>) => {
      setIconPosition(data.iconPosition)
      setFilterModalVisible(true)
    },
    [setIconPosition],
  )

  const closeModal = useCallback(() => {
    setFilterModalVisible(false)
  }, [])

  const handleSelect = useCallback(
    (value: ROOM_TYPE_FILTER) => {
      // if select all rooms
      if (!value) {
        return onSelect([ROOM_TYPE_FILTER.ALL])
      }
      // if selected value not included in the filter array, add it
      if (!_includes(currentRoomTypes, value)) {
        return onSelect(
          _without([...currentRoomTypes, value], ROOM_TYPE_FILTER.ALL),
        )
      }
      // otherwise remove it from the array
      // if the array is empty, select the all room option
      const newRoomTypes = currentRoomTypes.filter((c) => c !== value)
      onSelect(newRoomTypes.length ? newRoomTypes : [ROOM_TYPE_FILTER.ALL])
    },
    [currentRoomTypes, onSelect],
  )

  const roomTypeFilterOptions: ModalOptionsTypes[] = useMemo(
    () =>
      _compact([
        {
          key: ROOM_TYPE_FILTER.ALL,
          label: strings.lobby.filterOptions.allRooms,
          description: strings.lobby.filterOptions.allRoomsDesc,
        },
        {
          key: ROOM_TYPE_FILTER.GROUP,
          label: strings.lobby.filterOptions.groupChats,
          description: strings.lobby.filterOptions.groupChatDesc,
        },
        SHOW_BROADCAST_FILTER && {
          key: ROOM_TYPE_FILTER.BROADCAST,
          label: strings.lobby.filterOptions.broadcastFeeds,
          description: strings.lobby.filterOptions.broadcastFeedDesc,
        },
      ]),
    [
      strings.lobby.filterOptions.allRooms,
      strings.lobby.filterOptions.allRoomsDesc,
      strings.lobby.filterOptions.groupChats,
      strings.lobby.filterOptions.groupChatDesc,
      strings.lobby.filterOptions.broadcastFeeds,
      strings.lobby.filterOptions.broadcastFeedDesc,
    ],
  )

  const getTitleByRoomType = useCallback((roomType: ROOM_TYPE_FILTER) => {
    const { label } = (roomTypeFilterOptions.find(
      (opt) => opt.key === roomType,
    ) || {}) as ModalOptionsTypes
    return label
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    currentRoomTypes,
    iconPosition,
    filterModalVisible,
    roomTypeFilterOptions,
    showFilterModal,
    handleSelect,
    closeModal,
    getTitleByRoomType,
  }
}

export default useLobbyFilterByRoomType
