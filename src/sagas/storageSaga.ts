import { call, fork, put, select, takeLatest } from 'redux-saga/effects'

import {
  getUserProfile,
  setUserProfile,
} from '@holepunchto/keet-store/store/userProfile'

import {
  getStorageMyProfile,
  Profile,
  setStorageMyProfile,
} from 'lib/localStorage'
import { removeUnusedCache } from 'lib/localStorage/fileStorage'

export function* saveProfileStorage({
  payload,
}: {
  payload: Partial<Profile>
}) {
  try {
    const prevProfile: Profile = yield select(getUserProfile)
    const name = payload?.name ?? prevProfile.name
    let needsName = payload.needsName ?? prevProfile.needsName
    if (typeof needsName !== 'boolean') {
      const storedProfile: Profile = yield call(getStorageMyProfile)
      needsName = storedProfile?.needsName ?? name.length === 0
    }

    const newStorageProfile: Profile = {
      name,
      avatar: (payload?.avatarUrl ?? prevProfile.avatarUrl) || null,
      needsName,
    }

    yield call(setStorageMyProfile, newStorageProfile)
  } catch {}
}

function* profileSaga() {
  try {
    const storedProfile: Profile = yield call(getStorageMyProfile)
    if (storedProfile)
      yield put(
        setUserProfile({
          name: storedProfile.name,
          avatarUrl: storedProfile.avatar || undefined,
        }),
      )
    yield takeLatest(setUserProfile, saveProfileStorage)
  } catch {}
}

export function* storageSaga() {
  yield fork(profileSaga)
  yield fork(removeUnusedCache)
}
