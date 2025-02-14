import { ElementType } from 'react'
import Config from 'react-native-config'
import { Easing, Notifier, NotifierComponents } from 'react-native-notifier'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  // @ts-ignore
  NOTIFICATION_CODE,
  // @ts-ignore
  NOTIFICATION_TYPE,
} from '@holepunchto/keet-store/store/notification'
import { switchRoomSubmit } from '@holepunchto/keet-store/store/room'

import NewMessageNotifier, {
  NewMessageNotifierProps,
} from 'component/NewMessageNotifier'
import { ErrorNotificationComponent } from 'component/NotifierComponent'
import {
  MemberRoleChangeNotifier,
  MemberRoleChangeNotifierProps,
  RoleChangeNotifierProps,
  SelfRoleChangeNotifier,
} from 'component/RoleChangeNotifier'
import { getTheme } from 'component/theme'
import { getDispatch } from 'lib/store'

import { getStrings } from 'i18n/strings'

import { DIRECTION_CODE } from './commonStyles'
import { getRoomTypeFlags } from './hooks/useRoom'
import { navigate, SCREEN_ERROR_LOG, SCREEN_ROOM } from './navigation'
import { isAndroid } from './platform'
import { ChatLastMessageType, MemberType } from './types'

type ToastInput =
  | string
  | {
      message?: string
      title?: string
      text?: string
      type?: string
      stack?: string
    }

const parseToastTitle = (toastInput: ToastInput): string | undefined =>
  typeof toastInput === 'string'
    ? undefined
    : 'title' in toastInput
      ? toastInput.title
      : undefined

const parseToastMessage = (toastInput: ToastInput): string =>
  typeof toastInput === 'string'
    ? toastInput
    : toastInput.message || toastInput.text || toastInput.title || ''

export const showInfoNotifier = (
  toastInput: ToastInput,
  customParams?: {
    duration?: number
    backgroundColor?: string
    Component?: ElementType
    componentProps?: Record<string, any>
    onPress?: () => void
    onHidden?: () => void
  },
) => {
  const message = parseToastMessage(toastInput)
  if (!message) return
  const theme = getTheme()
  Notifier.showNotification({
    title: parseToastTitle(toastInput),
    description: message,
    easing: Easing.ease,
    duration: customParams?.duration ?? 3000,
    animationDuration: theme.animation.ms * 3,
    showEasing: (x) => 1 - Math.pow(1 - x, 5),
    Component: customParams?.Component || NotifierComponents.Notification,
    componentProps: {
      testID: 'info-notification',
      ContainerComponent: isAndroid ? SafeAreaView : undefined,
      containerStyle: {
        backgroundColor: theme.color.bg3,
        borderColor: theme.color.bg2,
        borderWidth: theme.border.width,
        borderRadius: theme.border.radiusNormal,
      },
      titleStyle: { ...theme.text.title, writingDirection: DIRECTION_CODE },
      descriptionStyle: {
        ...theme.text.body,
        writingDirection: DIRECTION_CODE,
      },
      ...customParams?.componentProps,
    },
    onPress: customParams?.onPress || (() => {}),
    onHidden: customParams?.onHidden || (() => {}),
  })
}

export const showErrorNotifier = (
  toastInput: ToastInput,
  showDetails = true,
) => {
  // capture the error stack to DevConsole to easier debug core issues
  const message = parseToastMessage(toastInput)
  if (!message) return
  const theme = getTheme()
  Notifier.showNotification({
    title: parseToastTitle(toastInput),
    description: message,
    easing: Easing.ease,
    duration: 3000,
    animationDuration: theme.animation.ms * 3,
    showEasing: (x) => 1 - Math.pow(1 - x, 5),
    Component: ErrorNotificationComponent,
    componentProps: {
      showDetails,
    },
    onPress: () => showDetails && navigate(SCREEN_ERROR_LOG),
  })
}

export const getToastRenderer = (payload: {
  code: string
  roomId: string
  roomTitle: string
  type: string
  roomMessage?: ChatLastMessageType['message']
  roomType?: string
  member?: MemberType
  memberId?: string
  newRole?: number
}) => {
  const {
    code,
    roomId,
    roomTitle,
    type,
    roomMessage,
    roomType,
    member,
    memberId,
    newRole,
  } = payload
  const strings = getStrings()
  const { isChannel } = getRoomTypeFlags(roomType)
  const isBlockedNotification = member?.blocked
  const dispatch = getDispatch()

  if (type === NOTIFICATION_TYPE.CUSTOM) {
    switch (code) {
      case NOTIFICATION_CODE.IDENTITY_ADD:
        showInfoNotifier({
          title: strings.syncDevice.notification.title,
          message: strings.syncDevice.notification.desc,
        })
        break
      case NOTIFICATION_CODE.NOTIFICATIONS_ON:
        showInfoNotifier(strings.room.notificationsOn)
        break
      case NOTIFICATION_CODE.NOTIFICATIONS_OFF:
        showInfoNotifier(strings.room.notificationsOff)
        break
      case NOTIFICATION_CODE.ROOM_ACTIVITY:
        !isBlockedNotification &&
          showInfoNotifier(roomTitle, {
            Component: NewMessageNotifier,
            componentProps: {
              message: roomMessage,
              member,
              isChannel,
              roomId,
            } as NewMessageNotifierProps,
            onPress: (): void => {
              if (Config?.KEET_VARIANT === 'store') {
                dispatch(switchRoomSubmit({ roomId }))
                navigate(SCREEN_ROOM)
              }
            },
          })
        break
      case NOTIFICATION_CODE.CALL_LIMITS_INFO_LIMITED:
        showInfoNotifier(strings.call.participantsLimitInfoLimited)
        break
      case NOTIFICATION_CODE.CALL_LIMITS_INFO_DISABLED:
        showInfoNotifier(strings.call.participantsLimitInfoDisabled)
        break
      case NOTIFICATION_CODE.ROOM_MEMBER_ROLE_UPDATE:
        showInfoNotifier(roomId, {
          Component: MemberRoleChangeNotifier,
          componentProps: {
            role: newRole,
            roomId,
            memberId,
          } as MemberRoleChangeNotifierProps,
        })
        break
      case NOTIFICATION_CODE.MY_ROLE_UPGRADE:
        showInfoNotifier(roomId, {
          Component: SelfRoleChangeNotifier,
          componentProps: {
            role: newRole,
            roomId,
          } as RoleChangeNotifierProps,
        })
        break
      default:
        showInfoNotifier(code)
        break
    }
    return
  }
  switch (type) {
    case NOTIFICATION_TYPE.ERROR:
      showErrorNotifier(payload)
      break
    default:
      showInfoNotifier(payload)
      break
  }
}
