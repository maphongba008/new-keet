import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { jsonParse, jsonStringify } from './storageUtils'

/**
 * Retrieves the lobby call data from storage.
 * @returns The lobby call data.
 */
export const getLobbyCallData = (): Record<string, any> => {
  return (
    jsonParse<Record<string, any>>(
      localStorage.getItem(Keys.LOBBY_CALL_STARTED),
    ) ?? {}
  )
}

/**
 * Retrieves the ongoing call data for a specific room from storage.
 * @param roomId - The room identifier.
 * @returns The ongoing call data for the room.
 */
export const getLobbyCallOnGoing = (roomId: string): any => {
  const callData = getLobbyCallData()
  return callData[roomId] ?? {}
}

/**
 * Adds new lobby call data to the existing data in storage.
 * @param data - The new lobby call data to add.
 */
export const addLobbyCallData = (data: Record<string, any>): void => {
  const prevData = getLobbyCallData()
  const newData = jsonStringify({ ...prevData, ...data })
  localStorage.setItem(Keys.LOBBY_CALL_STARTED, newData)
}

/**
 * Removes the lobby call data for a specific room from storage.
 * @param roomId - The room identifier.
 */
export const removeLobbyCallData = (roomId: string): void => {
  const prevData = getLobbyCallData()
  if (prevData) {
    delete prevData[roomId]
    localStorage.setItem(Keys.LOBBY_CALL_STARTED, jsonStringify(prevData))
  }
}
