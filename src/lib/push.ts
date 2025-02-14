import { requireNativeModule } from 'expo-modules-core'

import { isIOS } from 'lib/platform'

const module = requireNativeModule('KeetPushModule')

export const setDefaultNotificationsStrings = (strings: Object) => {
  module.setDefaultStrings(strings)
}

export const clearRoomNotifications = (roomKey: string) => {
  module.clearRoomNotifications(roomKey)
}

export const setBadgeCount = (badgeCount: number) => {
  if (!isIOS) {
    return
  }
  module.setBadgeCount(badgeCount)
}

export const getLaunchUrl = (): string | null | undefined => {
  return module.getLaunchUrl()
}

export const getToken = (): Promise<string | null | undefined> => {
  return module.getToken()
}

export const subscribeToRoomNotifications = (
  topic: string,
): Promise<string | null | undefined> => {
  return module.subscribeToRoomNotifications(topic)
}

export const unsubscribeRoomNotifications = (
  topic: string,
): Promise<boolean> => {
  return module.unsubscribeRoomNotifications(topic)
}
