import { ROOM_TYPE_FILTER } from '@holepunchto/keet-store/store/room/room.constants'

export interface RoomListSectionType {
  title: string
  roomTypes: ROOM_TYPE_FILTER[]
  showFilterModal: (
    iconPosition: Pick<RoomFilterOptionTypes, 'iconPosition'>,
  ) => void
  showModal: boolean
  setRoomTypes?: React.Dispatch<React.SetStateAction<ROOM_TYPE_FILTER[]>>
}

export interface ModalOptionsTypes {
  key: ROOM_TYPE_FILTER
  label: string
  description: string
}

export interface RoomFilterOptionTypes {
  selectedFilter: ROOM_TYPE_FILTER[]
  filterModalVisible: boolean
  iconPosition: { top: number }
  roomTypeFilterOptions: ModalOptionsTypes[]
  closeFilterModal: () => void | undefined
  handleSelect: (key: ROOM_TYPE_FILTER) => void
}

export interface RoomItemProps {
  item: string
  extraData: number
  index: number
}

export interface RoomListInView {
  top: number
  bottom: number
}
