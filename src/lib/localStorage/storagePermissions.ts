import { localStorage } from './storage'
import { Keys } from './storageConstants'

export const getStoragePermissionNotifyAsked = (): boolean => {
  return localStorage.getBooleanItem(Keys.PERMISSION_NOTIFY) ?? false
}

export const setStoragePermissionNotifyAsked = (): void => {
  localStorage.setBooleanItem(Keys.PERMISSION_NOTIFY, true)
}
