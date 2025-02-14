import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Retrieves the chat draft for a specific room from storage.
 * @param roomKey - The key of the room.
 * @returns The chat draft, or an empty string if not found.
 */
export const getStorageChatDraft = (roomKey: string): string => {
  return localStorage.getItem(`${Keys.CHAT_DRAFT_KEY}${roomKey}`) ?? ''
}

/**
 * Sets the chat draft for a specific room in storage.
 * @param roomKey - The key of the room.
 * @param text - The chat draft text to set.
 */
export const setStorageChatDraft = (roomKey: string, text: string): void => {
  localStorage.setItem(`${Keys.CHAT_DRAFT_KEY}${roomKey}`, text)
}
