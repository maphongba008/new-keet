import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

/**
 * Logs errors to the console.
 * @param error - The error to log.
 */
export const logError = (error: any) => {
  console.error('LocalStorage Error:', error)
}

/**
 * Safely retrieves an item from storage.
 * @param key - The key of the item to retrieve.
 * @returns The retrieved item, or undefined if an error occurs.
 */
export const safeGetItem = (key: string): string | undefined => {
  try {
    return storage.getString(key)
  } catch (error) {
    logError(error)
  }
}

/**
 * Safely retrieves all keys from storage.
 * @returns {string[]} All available keys or empty array.
 */
export const safeGetAllKeys = (): string[] => {
  try {
    return storage.getAllKeys() || []
  } catch (error) {
    logError(error)
  }
  return []
}

/**
 * Safely sets an item in storage.
 * @param key - The key of the item to set.
 * @param value - The value to set.
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    storage.set(key, value?.toString())
  } catch (error) {
    logError(error)
  }
}

/**
 * Safely removes an item from storage.
 * @param key - The key of the item to remove.
 */
export const safeRemoveItem = (key: string): void => {
  try {
    storage.delete(key)
  } catch (error) {
    logError(error)
  }
}

/**
 * Safely clears all items from storage.
 */
export const safeClear = (): void => {
  try {
    storage.clearAll()
  } catch (error) {
    logError(error)
  }
}

/**
 * Safely sets a boolean item in storage.
 * @param key - The key of the item to set.
 * @param value - The boolean value to set.
 */
export const safeSetBooleanItem = (key: string, value: boolean): void => {
  try {
    storage.set(key, value ? 'true' : 'false')
  } catch (error) {
    logError(error)
  }
}

/**
 * Safely retrieves a boolean item from storage.
 * @param key - The key of the item to retrieve.
 * @returns The retrieved boolean item, or undefined if an error occurs.
 */
export const safeGetBooleanItem = (key: string): boolean | undefined => {
  try {
    const value = storage.getString(key)
    return value ? value === 'true' : undefined
  } catch (error) {
    logError(error)
  }
}

/**
 * Converts a value to a JSON string.
 * @param data - The data to stringify.
 * @returns The JSON string.
 */
export const jsonStringify = (data: any): string => JSON.stringify(data)

/**
 * Parses a JSON string to an object.
 * @param data - The JSON string to parse.
 * @returns The parsed object, or undefined if the input is undefined.
 */
export const jsonParse = <T>(data: string | undefined): T | undefined =>
  data ? JSON.parse(data) : undefined

/**
 * Parses a string to a number.
 * @param value - The string to parse.
 * @param defaultValue - The default value to return if parsing fails.
 * @returns The parsed number.
 */
export const parseNumber = (
  value: string | undefined,
  defaultValue: number = 0,
): number => (value ? parseInt(value, 10) : defaultValue)

/**
 * Parses a string to a boolean.
 * @param value - The string to parse.
 * @param defaultValue - The default value to return if parsing fails.
 * @returns The parsed boolean.
 */
export const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean = false,
): boolean => (value ? JSON.parse(value) : defaultValue)
