import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'

import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { jsonParse, jsonStringify, parseNumber } from './storageUtils'

/**
 * Retrieves the emoji skin color preference from storage.
 * @returns The emoji skin color preference.
 */
export const getStorageEmojiSkinColor = (): number => {
  return parseNumber(localStorage.getItem(Keys.EMOJI_SKIN_COLOR))
}

/**
 * Sets the emoji skin color preference in storage.
 * @param skin - The emoji skin color preference to set.
 */
export const setStorageEmojiSkinColor = (skin: number): void => {
  localStorage.setItem(Keys.EMOJI_SKIN_COLOR, `${skin}`)
}

/**
 * Retrieves the recently used emojis from storage.
 * @returns The list of recently used emojis.
 */
export const getStorageEmojiRecent = (): EmojiData[] => {
  return jsonParse<EmojiData[]>(localStorage.getItem(Keys.EMOJI_RECENT)) ?? []
}

/**
 * Sets the recently used emojis in storage.
 * @param emojis - The list of recently used emojis to set.
 */
export const setStorageEmojiRecent = (emojis: EmojiData[]): void => {
  localStorage.setItem(Keys.EMOJI_RECENT, jsonStringify(emojis))
}
