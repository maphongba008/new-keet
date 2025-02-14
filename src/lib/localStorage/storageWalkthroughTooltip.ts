import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Checks if the walkthrough tooltip should be shown.
 * @returns True if the tooltip should be shown, otherwise false.
 */
export const getStorageShowWalkthroughTooltip = (): boolean => {
  return localStorage.getBooleanItem(Keys.SHOW_WALKTHROUGH_TOOLTIP) ?? false
}

/**
 * Marks the walkthrough tooltip as shown.
 */
export const setStorageWalkthroughTooltipShownDone = (): void => {
  localStorage.setBooleanItem(Keys.SHOW_WALKTHROUGH_TOOLTIP, false)
}

/**
 * Sets the walkthrough tooltip to be shown.
 */
export const setStorageShowWalkthroughTooltip = (): void => {
  localStorage.setBooleanItem(Keys.SHOW_WALKTHROUGH_TOOLTIP, true)
}
