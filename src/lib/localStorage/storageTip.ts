import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { parseNumber } from './storageUtils'

/**
 * Checks if a specific tip should be shown to the user.
 * @param tip - The tip identifier.
 * @returns True if the tip should be shown, otherwise false.
 */
export const getStorageShowsTip = (tip: string): boolean => {
  const key = `${Keys.TIP_KEY_PREFIX}${tip}`
  const value = localStorage.getItem(key)
  return value ? parseNumber(value) !== 1 : true
}

/**
 * Marks a specific tip as seen.
 * @param tip - The tip identifier.
 */
export const setStorageShowsTipSeen = (tip: string): void => {
  const key = `${Keys.TIP_KEY_PREFIX}${tip}`
  localStorage.setItem(key, '1')
}
