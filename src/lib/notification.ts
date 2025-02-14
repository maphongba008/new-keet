// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/notifications/notifications.js

import { memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useShallow } from 'zustand/react/shallow'

import {
  getNotifications,
  // @ts-ignore
  NOTIFICATION_CODE,
  // @ts-ignore
  NOTIFICATION_TYPE,
  // @ts-ignore
  removeNotification,
} from '@holepunchto/keet-store/store/notification'
import { getRoomMainId } from '@holepunchto/keet-store/store/room'

import { getUIAppActive } from 'reducers/application'

import { AppStateProps, useAppStore } from './hooks'
import { getToastRenderer } from './hud'
import { SOUND_RECEIVE_NEW_MSG, usePlaySound } from './sound'

type NOTIFICATION_CODE_KEYS = keyof typeof NOTIFICATION_CODE
type NOTIFICATION_TYPE_KEYS = keyof typeof NOTIFICATION_TYPE

export interface NotificationData {
  code: (typeof NOTIFICATION_CODE)[NOTIFICATION_CODE_KEYS]
  count: number
  id: string
  message?: string
  roomId: string
  roomTitle: string
  title?: string
  type: (typeof NOTIFICATION_TYPE)[NOTIFICATION_TYPE_KEYS]
}

export const Notifications = memo(() => {
  const notifications = useSelector(getNotifications)
  const currentRoomId = useSelector(getRoomMainId)
  const appActive = useSelector(getUIAppActive)
  const dispatch = useDispatch()
  const playSound = usePlaySound()

  const isAuthenticated = useAppStore(
    useShallow((state: AppStateProps) => state.isAuthenticated),
  )

  useEffect(() => {
    Object.keys(notifications).map((code) => {
      const notification: NotificationData = notifications[code]
      if (!appActive) {
        dispatch(removeNotification(notification.id))
        return
      }

      if (
        notification.code === NOTIFICATION_CODE.ROOM_ACTIVITY &&
        notification.roomId === currentRoomId
      ) {
        playSound(SOUND_RECEIVE_NEW_MSG)
        return
      }

      if (isAuthenticated) {
        getToastRenderer(notification)
      }

      dispatch(removeNotification(notification.id))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, dispatch])

  return null
})
