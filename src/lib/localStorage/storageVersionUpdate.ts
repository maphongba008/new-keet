import { SHOW_FULLSCREEN_AD } from 'lib/build.constants'

import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Checks if a version update should be shown.
 * @returns True if a version update should be shown, otherwise false.
 */
export const getNeedShowVersionUpdate = (): boolean => {
  return (
    SHOW_FULLSCREEN_AD &&
    localStorage.getBooleanItem(Keys.NEED_SHOWS_VERSION_UPDATE) !== false
  )
}

/**
 * Marks the version update as done.
 */
export const setShowVersionUpdateDone = (): void => {
  localStorage.setBooleanItem(Keys.NEED_SHOWS_VERSION_UPDATE, false)
}
