import { getState } from 'lib/store'

import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { jsonParse, jsonStringify } from './storageUtils'

export interface Room {
  title: string
  key: string
  time: number
  unread: boolean
}

/**
 * Sets the room history data in storage.
 * @param rooms - The room history data to set.
 */
export const setStorageRoomHistoryData = (rooms: Room[]): void => {
  localStorage.setItem(Keys.ROOM_HISTORY_DATA_KEY, jsonStringify(rooms))
}

/**
 * Retrieves the room history data from storage.
 * @returns The room history data, or undefined if not found.
 */
export const getStorageRoomHistory = (): Room[] | undefined => {
  return jsonParse<Room[]>(localStorage.getItem(Keys.ROOM_HISTORY_DATA_KEY))
}

export const storeLastRoomProps = () => {
  const roomId = getState().chat.currentRoomId
  const inView = getState().room.list.inView
  localStorage.setItem(Keys.LAST_ROOM_ID, JSON.stringify({ roomId, inView }))
}

export const getAndResetLastRoomProps = () => {
  const props = localStorage.getItem(Keys.LAST_ROOM_ID)
  localStorage.removeItem(Keys.LAST_ROOM_ID)
  return jsonParse<{ roomId: string; inView: { top: number; bottom: number } }>(
    props,
  )
}
