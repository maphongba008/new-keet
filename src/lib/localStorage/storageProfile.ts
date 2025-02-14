import { localStorage } from './storage'
import { Keys } from './storageConstants'
import { jsonParse, jsonStringify } from './storageUtils'

export interface Profile {
  name: string
  avatar: string | null
  needsName?: boolean
  avatarUrl?: string
}

/**
 * Sets the profile data in storage.
 * @param profile - The profile data to set.
 */
export const setStorageMyProfile = (profile: Profile): void => {
  localStorage.setItem(Keys.MY_PROFILE_KEY, jsonStringify(profile))
}

/**
 * Retrieves the profile data from storage.
 * @returns The profile data, or undefined if not found.
 */
export const getStorageMyProfile = (): Profile | undefined => {
  return jsonParse<Profile>(localStorage.getItem(Keys.MY_PROFILE_KEY))
}
