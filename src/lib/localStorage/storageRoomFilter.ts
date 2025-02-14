import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { jsonParse, jsonStringify } from './storageUtils'

/**
 * Sets the room filter options in storage.
 * @param option - The room filter options to set.
 */
export const setRoomFilterOption = (option: number[]): void => {
  localStorage.setItem(Keys.ACTIVE_ROOM_FILTER_OPTION, jsonStringify(option))
}

/**
 * Retrieves the active room filter options from storage.
 * @returns The active room filter options.
 */
export const getActiveRoomFilterKey = (): number[] => {
  const key = localStorage.getItem(Keys.ACTIVE_ROOM_FILTER_OPTION)
  return key ? (jsonParse<number[]>(key) ?? [0]) : [0]
}
