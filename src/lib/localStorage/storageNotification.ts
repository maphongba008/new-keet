import { localStorage } from './storage'
import { Keys } from './storageConstants'

/**
 * Checks if notifications for a specific room are subscribed.
 * @param topic - The room topic.
 * @returns True if subscribed, otherwise false.
 */
export const isSubscribedToRoomNotifications = (topic: string): boolean => {
  return (
    localStorage.getBooleanItem(`${Keys.PUSH_TOPIC_PREFIX}${topic}`) === true
  )
}

/**
 * Checks if notifications for a specific room are muted.
 * @param topic - The room topic.
 * @returns True if muted, otherwise false.
 */
export const isRoomNotificationsMuted = (topic: string): boolean => {
  return (
    localStorage.getBooleanItem(`${Keys.PUSH_TOPIC_PREFIX}${topic}`) === false
  )
}

/**
 * Sets the subscription state for room notifications.
 * @param topic - The room topic.
 * @param value - True to subscribe, false to unsubscribe.
 */
export const setSubscribedToRoomNotifications = (
  topic: string,
  value: boolean,
): void => {
  localStorage.setBooleanItem(`${Keys.PUSH_TOPIC_PREFIX}${topic}`, value)
}
