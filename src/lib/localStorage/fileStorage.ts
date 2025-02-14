import { MMKV } from 'react-native-mmkv'

import { Keys } from './storageConstants'

const storage = new MMKV({
  id: 'cache',
})

export const persistStorage = {
  getItem: (key: string) => {
    const value = storage.getString(key)
    return Promise.resolve(value ? JSON.parse(value) : undefined)
  },
  setItem: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value))
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    storage.delete(key)
    return Promise.resolve()
  },
  clearAll: () => {
    storage.clearAll()
  },
}

// Delete all keys that are no longer used but are still in the user's cache
export const removeUnusedCache = () => {
  const keys = [
    'persist:chat',
    'persist:member',
    'persist:room',
    'chatCache',
    `${Keys.QA_HELPERS}-core-switch`,
    `${Keys.QA_HELPERS}-fast-boot`,
  ]
  for (const key of keys) {
    if (storage.contains(key)) {
      storage.delete(key)
    }
  }
}
