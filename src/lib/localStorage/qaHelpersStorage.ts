import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'

import { localStorage } from './storage'
import { Keys } from './storageConstants'

// storage keys
const QA_HELPERS_KEY_CHAT_ROOM_STAT = `${Keys.QA_HELPERS}-CHAT_ROOM_STAT`

interface RoomStatState {
  isShowRoomStat: boolean
  setIsShowRoomStat: (bool: boolean) => void
}
export const useToggleRoomStatStore = create<RoomStatState>()(
  persist(
    (set) => ({
      isShowRoomStat: false,
      setIsShowRoomStat: (bool: boolean) => set({ isShowRoomStat: bool }),
    }),
    {
      name: QA_HELPERS_KEY_CHAT_ROOM_STAT,
      storage: createJSONStorage(() => localStorage as StateStorage),
    },
  ),
)
