import { Keyboard } from 'react-native'
import {
  CommonActions,
  createNavigationContainerRef,
  PartialRoute,
  Route,
  StackActions,
} from '@react-navigation/native'

export const APP_ROOT = 'nav/app-root'
export const SCREEN_HOME = 'home'
export const SCREEN_SYNC_DEVICE = 'sync-device'
export const SCREEN_PROFILE = 'profile'
export const SCREEN_WALLET = 'wallet'
// Room
export const SCREEN_ROOM = 'room'
export const SCREEN_ROOM_INVITE = 'room-invite'
export const SCREEN_ROOM_CALL = 'call'
export const SCREEN_ROOM_OPTIONS = 'room-options'
export const SCREEN_ROOM_FILES = 'room-files'
export const SCREEN_ROOM_MEMBERS = 'room-members'
export const SCREEN_EDIT_ROOM_DETAILS = 'room-edit-details'
export const SCREEN_MEDIA_PREVIEW = 'media-preview'
export const SCREEN_LONG_TEXT_PREVIEW = 'text-preview'
export const SCREEN_PINNED_MESSAGES = 'pinned-messages'
export const SCREEN_ADMINS_AND_MODS = 'admins-and-mods'
export const SCREEN_MANAGE_MEMBER = 'manage-member'
export const SCREEN_MEMBER_ROLE = 'member-role'
// Profile
export const SCREEN_META = 'meta'
export const SCREEN_INVITE_SOMEONE = 'inviteSomeone'
export const SCREEN_LANGUAGE = 'language'
export const SCREEN_MODAL = 'modal'
export const SCREEN_IDENTITY_SYNC = 'identity-sync'
export const SCREEN_IDENTITY_BACKUP_AGREEMENT = 'identity-backup-agreement'
export const SCREEN_IDENTITY_BACKUP_SETUP = 'identity-backup-setup'
export const SCREEN_IDENTITY_BACKUP_DEVICE = 'identity-backup-device'
export const SCREEN_IDENTITY_BACKUP_DISPLAY = 'identity-backup-display'
export const SCREEN_IDENTITY_BACKUP_VERIFICATION =
  'identity-backup-verification'
export const SCREEN_IDENTITY_BACKUP_QUICK_SETUP = 'identity-backup-quick-setup'
export const SCREEN_IDENTITY_BACKUP_COMPLETE = 'identity-backup-complete'
export const SCREEN_MY_DEVICES = 'my-devices'
export const SCREEN_IDENTITY_DEVICE_ADD = 'device-add'
export const SCREEN_RECOVER_ACCOUNT = 'recover-account'
export const SCREEN_RECOVER_ACCOUNT_AGREEMENT = 'recover-account-agreement'
export const SCREEN_DEBUGGING = 'debugging'
export const SCREEN_NOTIFICATION_SETTINGS = 'notification-settings'
export const SCREEN_CREATE_CHANNEL = 'create-channel'
export const SCREEN_CREATE_CHANNEL_DISCLAIMER = 'create-channel-disclaimer'
export const SCREEN_PASSCODE_SETUP = 'passcode-setup'
export const SCREEN_PASSCODE_CHANGE = 'passcode-change'
export const SCREEN_PASSCODE_CHANGE_SET_NEW = 'passcode-change-set-new'
export const SCREEN_PASSCODE_CHECK = 'passcode-check'
export const SCREEN_PASSCODE_CHANGE_CONFIRM_NEW = 'passcode-change-confirm-new'
export const SCREEN_PASSCODE_CONFIRMATION = 'passcode-confirmation'
export const SCREEN_SECURITY = 'security'
export const SCREEN_RECOVERY_PHRASE_SETTINGS = 'recovery-phrase-settings'
export const SCREEN_VIEW_RECOVERY_PHRASE = 'view-recovery-phrase'
export const SCREEN_SUCCESSFULLY_CLEANED_DEVICE = 'successfully-cleaned-device'
export const SCREEN_NOTIFICATION_SOUND = 'notification-sound'
export const SCREEN_SETTINGS = 'settings'
export const SCREEN_PAIRING_ROOMS = 'pairing-rooms'
export const SCREEN_DM_REQUESTS = 'dm-requests'
export const SCREEN_APP_AUTO_LOCK = 'app-auto-lock'
export const DISCOVER_COMMUNITY = 'discover-community'
export const SCREEN_USER_PROFILE = 'user-profile'
export const SCREEN_ERROR_LOG = 'error-log'
export const SCREEN_ERROR_LOG_DETAILS = 'error-log-details'
export const SCREEN_ERROR_LOG_REPORT = 'error-log-report'
export const SCREEN_QA_HELPERS = 'qa-helpers'
export const SCREEN_SVG_ICONS = 'svg-icons'
export const SCREEN_WALLET_CREATE = 'wallet/createWallet'
export const SCREEN_WALLET_RECOVERY_PHRASE = 'wallet/recoveryPhrase'
export const SCREEN_WALLET_RECOVERY_PHRASE_VERIFICATION =
  'wallet/recoveryPhraseVerification'
export const SCREEN_WALLET_RECOVERY_COMPLETE = 'wallet/recoveryComplete'
export const SCREEN_WALLET_SETTINGS = 'wallet/walletSettings'
export const SCREEN_WALLET_IMPORT = 'wallet/import'
export const SCREEN_WALLET_IMPORT_COMPLETE = 'wallet/importComplete'
export const SCREEN_WALLET_SEND = 'wallet/sendMoney'
export const SCREEN_WALLET_ENTER_AMOUNT = 'wallet/enterAmount'
export const SCREEN_WALLET_SCANNER_VIEW = 'wallet/scannerView'
export const SCREEN_WALLET_RECEIVE = 'wallet/receiveMoney'
export const SCREEN_CUSTOM_SERVER_SETUP = 'wallet/customServer'
export const SCREEN_TOS = 'tos-screen'
export const SCREEN_ACCOUNT_EDIT_DETAILS = 'account/editDetails'
export const SCREEN_SHARE_PROFILE = 'account/shareProfile'

// navigation history
export const roomOptionsStackHistory = [
  { name: APP_ROOT },
  { name: SCREEN_ROOM },
  { name: SCREEN_ROOM_OPTIONS },
]

// react-navigation
export const navigationRef = createNavigationContainerRef()

export const hasNavigator = () => {
  return navigationRef.isReady()
}

export const navigate = (name: string, params?: any) => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant set navigate of ', name)
    return
  }
  try {
    navigationRef?.current?.dispatch(
      CommonActions.navigate({
        name,
        params,
      }),
    )
  } catch (e: any) {
    console.error('[Navigator] cant set navigate of ', {
      name,
      message: e.message,
    })
  }
}

export const back = () => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant goBack')
    return
  }
  try {
    navigationRef?.current?.dispatch(CommonActions.goBack())
    Keyboard.dismiss()
  } catch (e: any) {
    console.error('[Navigator] cant goBack ', e.message)
  }
}

export const pop = (params: any) => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant pop')
    return
  }
  try {
    navigationRef?.current?.dispatch(StackActions.pop(params))
  } catch (e: any) {
    console.error('[Navigator] cant pop ', e.message)
  }
}

export const navReplace = (name: string, params?: any) => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant set navigate of ', name)
    return
  }
  try {
    navigationRef?.current?.dispatch(StackActions.replace(name, params))
  } catch (e: any) {
    console.error('[Navigator] cant set navigate of ', {
      name,
      message: e.message,
    })
  }
}

export const reset = (name: string, params?: any) => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant set navigate of ', name)
    return
  }

  try {
    navigationRef?.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name,
            params,
          },
        ],
      }),
    )
  } catch (e: any) {
    console.error('[Navigator] cant set navigate of ', e.message)
  }
}

// reset nav to specific screen and define stack history
export const resetStackWithHistory = (
  routes: PartialRoute<Route<any>>[] = [],
) => {
  navigationRef?.current?.dispatch(
    CommonActions.reset({
      index: routes?.length - 1,
      routes,
    }),
  )
}

export const getCurrentRoute = () => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant getCurrentPage')
    return
  }
  return navigationRef?.current?.getCurrentRoute()?.name
}

export const popToTop = () => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant getCurrentPage')
    return
  }
  return navigationRef?.current?.dispatch(StackActions.popToTop())
}

export const setCurrentNavParams = (params: object) => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant setParams')
    return
  }
  return navigationRef?.current?.dispatch(CommonActions.setParams(params))
}

export const popToPage = (pageName: string) => {
  if (!hasNavigator()) {
    console.error('[Navigator] cant getCurrentPage')
    return
  }

  const routes = navigationRef?.current?.getState()?.routes

  if (!routes?.length) {
    return
  }

  const targetPageIndex = routes.findIndex((item) => item.name === pageName)

  pop(routes.length - targetPageIndex - 1)
}
