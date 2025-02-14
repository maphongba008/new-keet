import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Checks if the call tooltip should be shown.
 * @returns True if the tooltip should be shown, otherwise false.
 */
export const getStorageShowCallTooltip = (): boolean => {
  return localStorage.getBooleanItem(Keys.SHOW_CALL_TOOLTIP) ?? false
}

/**
 * Marks the call tooltip as shown.
 */
export const setStorageCallTooltipShownDone = (): void => {
  localStorage.setBooleanItem(Keys.SHOW_CALL_TOOLTIP, false)
}

/**
 * Sets the call tooltip to be shown.
 */
export const setStorageShowCallTooltip = (): void => {
  localStorage.setBooleanItem(Keys.SHOW_CALL_TOOLTIP, true)
}
