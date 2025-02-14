// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid } from 'react-native'
import { Audio } from 'expo-av'
import { call, put, select } from 'redux-saga/effects'

import { getIsIdentityAnonymous } from '@holepunchto/keet-store/store/identity'

import {
  getScreenAfterOnboarding,
  showAppModal,
  showWalkthroughTooltip,
} from 'reducers/application'

import { ModalTypes } from 'component/AppModal'
import {
  getNeedShowVersionUpdate,
  getStorageMyProfile,
  getStorageNeedsOnBoarding,
  getStoragePermissionNotifyAsked,
  getStorageShowWalkthroughTooltip,
  Profile,
  setStoragePermissionNotifyAsked,
} from 'lib/localStorage'
import { navigate } from 'lib/navigation'
import { isAndroid } from 'lib/platform'

import {
  waitForModalsToClose,
  waitForStoreReady,
  waitForToolTip,
  waitToShowHome,
} from './modalSaga'

type permissionType = {
  granted: boolean
}

function* permissionsSaga() {
  try {
    if (isAndroid) {
      const notifyPermissionAsked: boolean = yield call(
        getStoragePermissionNotifyAsked,
      )
      const isNotificationPermissionGranted: boolean = yield call(
        PermissionsAndroid.check,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
      const isBluetoothPermissionGranted: boolean = yield call(
        PermissionsAndroid.check,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      )
      const isMicrophonePermissionGranted: boolean = yield call(
        PermissionsAndroid.check,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      )

      const requestPermissions = [
        ...(!isNotificationPermissionGranted && !notifyPermissionAsked
          ? [PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS]
          : []),
        ...(!isBluetoothPermissionGranted
          ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
          : []),
        ...(!isMicrophonePermissionGranted
          ? [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]
          : []),
      ]

      if (requestPermissions.length) {
        // @ts-ignore
        const results = yield call(
          PermissionsAndroid.requestMultiple,
          requestPermissions,
        )
        const notificationResult =
          results[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS]
        const bluetoothResult =
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
        const microphoneResult =
          results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]

        if (
          notificationResult &&
          notificationResult !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Notification permission denied')
        }
        if (
          bluetoothResult &&
          bluetoothResult !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Bluetooth permission denied')
        }
        if (
          microphoneResult &&
          microphoneResult !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Microphone permission denied')
        }
      }
    } else {
      const isMicrophonePermissionGranted: permissionType = yield call(
        Audio.getPermissionsAsync,
      )
      if (!isMicrophonePermissionGranted.granted) {
        const askPermission: permissionType = yield call(
          Audio.requestPermissionsAsync,
        )
        if (!askPermission.granted) {
          console.log('Microphone permission denied')
        }
      }
    }
    yield call(setStoragePermissionNotifyAsked)
  } catch (err) {
    console.warn('Error in permissionsSaga: ', err)
  }
}

function* newVersionModalSaga() {
  try {
    const needToShow: boolean = yield call(getNeedShowVersionUpdate)
    if (needToShow) {
      yield put(showAppModal({ modalType: ModalTypes.NEW_VERSION }))
    }
  } catch (err) {
    console.warn('Error in newVersionModalSaga: ', err)
  }
}

function* onBoardingSaga() {
  try {
    const storageNeedsOnBoarding: boolean = yield call(
      getStorageNeedsOnBoarding,
    )
    if (storageNeedsOnBoarding) {
      yield put(
        showAppModal({
          modalType: ModalTypes.ON_BOARDING,
          config: { statusBarTranslucent: false },
        }),
      )
    }
  } catch (err) {
    console.warn('Error in onBoardingSaga: ', err)
  }
}

function* identityIntroSaga() {
  try {
    const isIdentityAnonymous: boolean = yield select(getIsIdentityAnonymous)
    const profile: Profile = yield getStorageMyProfile()
    const isExistingUser = !profile?.needsName && !!profile?.name

    if (isIdentityAnonymous && isExistingUser) {
      yield put(
        showAppModal({
          modalType: ModalTypes.IDENTITY_INTRO,
          config: { statusBarTranslucent: true },
        }),
      )
    }
  } catch (err) {
    console.warn('Error in identityIntroSaga: ', err)
  }
}

function* identitySetupSaga() {
  try {
    const isIdentityAnonymous: boolean = yield select(getIsIdentityAnonymous)

    if (isIdentityAnonymous) {
      yield put(
        showAppModal({
          modalType: ModalTypes.IDENTITY,
          config: { statusBarTranslucent: true },
        }),
      )
    }
  } catch (err) {
    console.warn('Error in identitySetupSaga: ', err)
  }
}

function* setupNameSaga() {
  try {
    const profile: Profile = yield getStorageMyProfile()
    const alreadyHadName = !profile?.needsName && !!profile?.name

    if (!alreadyHadName) {
      yield put(
        showAppModal({
          modalType: ModalTypes.SETUP_NAME,
          config: { statusBarTranslucent: true },
        }),
      )
    }
  } catch (err) {
    console.warn('Error in setupNameSaga: ', err)
  }
}

function* walkthroughSaga() {
  try {
    const shouldShowWalkthrough: boolean = yield call(
      getStorageShowWalkthroughTooltip,
    )
    if (shouldShowWalkthrough) {
      yield waitToShowHome()
      yield put(showWalkthroughTooltip())
      yield waitForToolTip()
    }
  } catch (err) {
    console.warn('Error in walkthroughSaga: ', err)
  }
}

function* postOnboarding() {
  const screenAfterOnboarding: string = yield select(getScreenAfterOnboarding)
  if (!screenAfterOnboarding) return
  navigate(screenAfterOnboarding)
}

const MODAL_PRIORITY_LIST = [
  onBoardingSaga,
  newVersionModalSaga,
  identityIntroSaga,
  identitySetupSaga,
  permissionsSaga,
]

export function* handlePriorityModals() {
  try {
    // splash screen modal was conflicting with other modals, we need to dismiss it first
    yield waitForStoreReady()
    for (let i = 0; i < MODAL_PRIORITY_LIST.length; i += 1) {
      yield call(MODAL_PRIORITY_LIST[i])
    }
    yield waitForModalsToClose()
    yield setupNameSaga()
    yield waitForModalsToClose()
    yield postOnboarding()
    yield walkthroughSaga()
  } catch {}
}
