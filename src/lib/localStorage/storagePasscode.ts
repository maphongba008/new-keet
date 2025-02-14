import { AutoLockTime } from 'screen/Passcode/usePasscodeStore'

import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Sets the passcode in storage.
 * @param passcode - The passcode to set.
 */
export const setStoragePasscode = (passcode: string): void => {
  localStorage.setItem(Keys.PASSCODE, passcode)
}

/**
 * Retrieves the passcode from storage.
 * @returns The passcode, or undefined if not found.
 */
export const getStoragePasscode = (): string | undefined => {
  return localStorage.getItem(Keys.PASSCODE)
}

/**
 * Removes the passcode from storage.
 */
export const removeStoragePasscode = (): void => {
  localStorage.removeItem(Keys.PASSCODE)
}

/**
 * Sets the app auto-lock time in storage.
 * @param time - The auto-lock time to set.
 */
export const setAppAutoLockTime = (time: AutoLockTime): void => {
  localStorage.setItem(Keys.APP_AUTO_LOCK, time)
}

/**
 * Retrieves the app auto-lock time from storage.
 * @returns The app auto-lock time.
 */
export const getAppAutoLockTime = (): AutoLockTime => {
  return (
    (localStorage.getItem(Keys.APP_AUTO_LOCK) as AutoLockTime) ??
    AutoLockTime.Never
  )
}
