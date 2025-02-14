import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Checks if the developer console is enabled.
 * @returns True if the developer console is enabled, otherwise false.
 */
export const getStorageDevConsoleEnabled = (): boolean => {
  return localStorage.getBooleanItem(Keys.DEV_CONSOLE) === true
}

/**
 * Sets the developer console enabled state.
 * @param enabled - True to enable, false to disable.
 */
export const setStorageDevConsoleEnabled = (enabled: boolean): void => {
  localStorage.setBooleanItem(Keys.DEV_CONSOLE, enabled)
}
