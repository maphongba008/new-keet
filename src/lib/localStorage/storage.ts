import {
  safeClear,
  safeGetAllKeys,
  safeGetBooleanItem,
  safeGetItem,
  safeRemoveItem,
  safeSetBooleanItem,
  safeSetItem,
} from './storageUtils'

/**
 * Local storage interface with methods for interacting with MMKV storage.
 */
export const localStorage = {
  getItem: safeGetItem,
  getAllKeys: safeGetAllKeys,
  setItem: safeSetItem,
  removeItem: safeRemoveItem,
  clear: safeClear,
  setBooleanItem: safeSetBooleanItem,
  getBooleanItem: safeGetBooleanItem,
}
