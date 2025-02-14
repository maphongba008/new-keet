import { IS_TIME_STATS_ENABLED } from 'lib/build.constants'

import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { getStorageDevConsoleEnabled } from './storageDevConsole'

/**
 * Retrieves the status of whether statistics are enabled from local storage.
 * @returns {boolean} True if statistics are enabled, otherwise false.
 */
export const getStorageStatsEnabled = (): boolean => {
  return localStorage.getBooleanItem(Keys.STATS) === true
}

/**
 * Sets the status of whether statistics are enabled in local storage.
 * @param enabled - A boolean value indicating whether statistics should be enabled.
 */
export const setStorageStatsEnabled = (enabled: boolean): void => {
  localStorage.setBooleanItem(Keys.STATS, enabled)
}

/**
 * Retrieves the status of whether statistics are collapsed from local storage.
 * @returns {boolean} True if statistics are collapsed, otherwise false.
 */
export const getStorageStatsCollapsed = (): boolean => {
  return localStorage.getBooleanItem(Keys.STATS_COLLAPSED) === true
}

/**
 * Sets the status of whether statistics are collapsed in local storage.
 * @param enabled - A boolean value indicating whether statistics should be collapsed.
 */
export const setStorageStatsCollapsed = (enabled: boolean): void => {
  localStorage.setBooleanItem(Keys.STATS_COLLAPSED, enabled)
}

/**
 * Retrieves the time stats from local storage.
 * @returns {boolean} True if time stats is enabled, otherwise false.
 */
export const getIsTimeStatsEnabled = (): boolean => {
  return (
    IS_TIME_STATS_ENABLED &&
    getStorageStatsEnabled() &&
    getStorageDevConsoleEnabled()
  )
}
