// @ts-ignore
import hypercoreID from 'hypercore-id-encoding'
import { call, put, select, take } from 'redux-saga/effects'
import { createAction, PayloadAction } from '@reduxjs/toolkit'
import _includes from 'lodash/includes'

import { getCoreBackend } from '@holepunchto/keet-store/backend'
import {
  APP_STATUS,
  getAppCurrentCallRoomId,
  getAppCurrentRoomId,
  getAppStatus,
  setAppStatus,
} from '@holepunchto/keet-store/store/app'
import { setSyncDeviceErrorMsg } from '@holepunchto/keet-store/store/identity'
import { apiTakeMatch } from '@holepunchto/keet-store/store/lib/external-src'
import {
  joinRoomSubmit,
  parseInvitation,
  setRoomPairError,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import {
  KEET_URL_PREFIX,
  PEAR_PROTOCOL,
  ROOM_PUSH_URL_PREFIX,
  ROOM_URL_PREFIX,
} from 'lib/constants'
import { getErrorMessage } from 'lib/hooks/useErrorMessage'
import { showErrorNotifier } from 'lib/hud'
import { isRoomUrl } from 'lib/linking'
import { navigate, SCREEN_ROOM, SCREEN_ROOM_CALL } from 'lib/navigation'

import { getStrings } from 'i18n/strings'

import { waitForAuthenticated } from './helper.saga'

/**
 * pear://push/{roomKey}/com.apple.UNNotificationDefaultActionIdentifier
 * push://push/{roomKey}
 * return - pear://push/{roomkey}
 */
function getRoomFromPushURL(url: string = '') {
  return `${ROOM_PUSH_URL_PREFIX}${
    url.replace(ROOM_PUSH_URL_PREFIX, '').split('/')[0]
  }`
}

export function* checkIfRoomSupported(roomId: string) {
  try {
    const coreApi = getCoreBackend()
    const appVersion: { version: number } = yield call([
      coreApi,
      coreApi.getVersion,
    ])
    const roomVersion: { version: number } = yield apiTakeMatch(
      () => coreApi.subscribeRoomVersion(roomId),
      {
        matchFn: (data: any) => typeof data.version === 'number',
        onError: () => ({ version: 0, experimental: false }),
      },
    )
    return appVersion?.version >= roomVersion?.version
  } catch (err) {
    console.warn('Error while check if room version supported', err)
  }
}

export function* handlePushUrl(url: string) {
  try {
    const roomId = hypercoreID.normalize(
      parseInvitation(getRoomFromPushURL(url), PEAR_PROTOCOL),
    )

    const isRoomVersionSupported: boolean = yield call(
      checkIfRoomSupported,
      roomId,
    )
    if (!isRoomVersionSupported) {
      return
    }

    const currentRoomId: string = yield select(getAppCurrentRoomId)
    if (roomId === currentRoomId) {
      return
    }

    yield put(switchRoomSubmit({ roomId }))

    if (!currentRoomId) {
      navigate(SCREEN_ROOM)
    }
  } catch (err) {
    console.warn('Error while switch to room from push URL', err)
  }
}

export function* handleKeetUrl(url: string) {
  try {
    const parsedUrl = url.replace(KEET_URL_PREFIX, '').split('/')
    const isScreen = parsedUrl[0] === 'screen'
    if (!isScreen) return
    switch (parsedUrl[1]) {
      case SCREEN_ROOM_CALL:
        {
          const currentCallRoomId: string = yield select(
            getAppCurrentCallRoomId,
          )
          yield put(switchRoomSubmit({ roomId: currentCallRoomId }))
          navigate(SCREEN_ROOM_CALL, { roomId: currentCallRoomId })
        }
        break
      default:
        break
    }
  } catch (err) {
    console.warn('Error while handle keet URL', err)
  }
}

export function* waitForAppRunning() {
  const appStatus: string = yield select(getAppStatus)
  if (appStatus !== APP_STATUS.RUNNING) {
    yield take(setAppStatus)
  }
}

export function* handleDeeplinkSaga({ payload: url }: PayloadAction<string>) {
  try {
    yield waitForAppRunning()

    if (!url) {
      return
    }

    const isKeetUrl = _includes(url, KEET_URL_PREFIX)
    const isPearUrl = _includes(url, ROOM_URL_PREFIX)
    const isPushUrl = _includes(url, ROOM_PUSH_URL_PREFIX)
    const isRoomInvitation = isRoomUrl(url)

    if (isKeetUrl) {
      yield call(handleKeetUrl, url)
      return
    }

    if (isPushUrl) {
      yield call(handlePushUrl, url)
      return
    }

    if (isRoomInvitation) {
      yield put(joinRoomSubmit({ link: url }))

      const pairingError: { payload: string } = yield take(setRoomPairError)
      if (pairingError) {
        const errorMessage = getErrorMessage(pairingError.payload)
        if (errorMessage) {
          yield waitForAuthenticated()
          yield call(showErrorNotifier, errorMessage, false)
          yield put(setRoomPairError(''))
        }
      }
      const identityError: { payload: string } = yield take(
        setSyncDeviceErrorMsg,
      )
      if (identityError) {
        const errorMessage = getErrorMessage(identityError.payload)
        if (errorMessage) {
          yield waitForAuthenticated()
          yield call(showErrorNotifier, errorMessage, false)
          yield put(setSyncDeviceErrorMsg(''))
        }
      }
      return
    }

    if (isPearUrl && !isKeetUrl) {
      const {
        common: { deeplinkNotSupported },
      } = getStrings()
      yield call(showErrorNotifier, deeplinkNotSupported, false)
      return
    }

    const {
      common: { deeplinkError },
    } = getStrings()
    yield call(showErrorNotifier, deeplinkError, false)
  } catch (e: any) {
    yield call(showErrorNotifier, e.message)
  }
}

export const handleDeeplink = createAction<string>('app/handle-deeplink')
