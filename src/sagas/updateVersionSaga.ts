import { call, delay, put, select } from 'redux-saga/effects'

import {
  APP_UPDATE_REASONS,
  getUpdateReason,
  getUpdateRequired,
} from '@holepunchto/keet-store/store/app'

import { setAppUpdate } from 'reducers/application'

import { checkForVersionUpdate } from 'lib/version'

import { getStrings } from 'i18n/strings'

const POLLING_DELAY = 30 * 60 * 1000 // 30 mins

export function* checkForUpdate() {
  const { version: strings } = getStrings()
  const version: { url: string; needsUpdate: boolean } = yield call(
    checkForVersionUpdate,
  )
  const isUpdate: boolean = yield select(getUpdateRequired)
  const reason: string = yield select(getUpdateReason)
  yield put(
    setAppUpdate({
      isUpdate: version?.needsUpdate || isUpdate,
      reason:
        reason === APP_UPDATE_REASONS.ROOM_UPGRADE
          ? strings.roomUpgradeBanner
          : strings.banner,
      url: version?.url,
    }),
  )
}

export function* updateVersionSaga() {
  while (true) {
    yield call(checkForUpdate)
    yield delay(POLLING_DELAY)
  }
}
