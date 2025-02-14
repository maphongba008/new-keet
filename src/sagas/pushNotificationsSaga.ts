import b4a from 'b4a'
// @ts-ignore
import hypercoreID from 'hypercore-id-encoding'
import {
  all,
  call,
  delay,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects'
import { createAction, PayloadAction } from '@reduxjs/toolkit'
import _filter from 'lodash/filter'

import { getCoreBackend } from '@holepunchto/keet-store/backend'
import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  getChatLastMessage,
  updateChatLastMessage,
} from '@holepunchto/keet-store/store/chat'
import {
  getPreferencesRoomNotifications,
  preferencesDataEvt,
} from '@holepunchto/keet-store/store/preferences'
import {
  getRoomListAllIds,
  leaveRoomSuccessEvent,
  roomNewActivity,
  setAllRooms,
  toggleRoomNotifications,
} from '@holepunchto/keet-store/store/room'
import {
  getAvatarBase64,
  getUserProfile,
} from '@holepunchto/keet-store/store/userProfile'

import {
  isSubscribedToRoomNotifications,
  setSubscribedToRoomNotifications,
} from 'lib/localStorage'
import { isIOS } from 'lib/platform'
import {
  clearRoomNotifications,
  setBadgeCount,
  subscribeToRoomNotifications,
  unsubscribeRoomNotifications,
} from 'lib/push'

const ERRORS = {
  subscriptionFailure: 'Error while subscribing Push Notification',
  unsubscribeFailure: 'Error while unsubscribe Push Notification',
}

function* updateRoomMemberProfile(roomId: string, pushNotifications: boolean) {
  try {
    const coreApi = getCoreBackend()
    const { name, avatarUrl } = yield select(getUserProfile)
    yield call(
      [coreApi, coreApi.updateMember],
      roomId,
      name,
      getAvatarBase64(avatarUrl),
      {
        pushNotifications,
      },
    )
  } catch (err) {
    console.warn('updateRoomMemberProfile failed with-', err)
  }
}

/**
 * Logic is dependent on two different subscription:
 * subscribeUnreadActivity - inform new unread activity
 * subscribeChatMessages - updates unread selector by call updateChatLastMessage
 * waitFor updateChatLastMessage to update unread count when new unread activity
 * add delay to avoid case when subscribeChatMessages is called before new unread activity
 */
function* onRoomNewActivitySaga({ payload: roomId }: PayloadAction<string>) {
  yield race([
    take(
      ({ type, payload: lastMessage }: any) =>
        type === updateChatLastMessage.type && lastMessage.roomId === roomId,
    ),
    delay(5000),
  ])
  yield put(updatePushNotificationBadgeAction())
}

function* updatePushNotificationBadgeSaga() {
  try {
    // android badge count support is not yet available in native code
    if (isIOS) {
      const currentRoom: string = yield select(getAppCurrentRoomId)
      const allRooms: Array<string> = yield select(getRoomListAllIds)

      const roomsUnreadMap: Array<{ unread: number }> = yield all(
        allRooms.map((roomId) => select(getChatLastMessage, roomId)),
      )

      const unreadRooms = _filter(
        allRooms,
        (room, index) =>
          roomsUnreadMap[index].unread > 0 && room !== currentRoom,
      )

      const notificationPreferenceMap: Array<boolean> = yield all(
        unreadRooms.map((roomId) =>
          select(getPreferencesRoomNotifications, roomId),
        ),
      )

      const badgeCount =
        _filter(unreadRooms, (_, index) => notificationPreferenceMap[index])
          ?.length || 0

      setBadgeCount(badgeCount)
    }
  } catch (err) {
    console.warn('updatePushNotificationBadgeSaga failed with-', err)
  }
}

function* clearRoomPushNotificationSaga({
  payload: roomId,
}: PayloadAction<string>) {
  try {
    if (roomId) {
      const pushKey = b4a.toString(hypercoreID.decode(roomId), 'hex')
      yield all([
        call(clearRoomNotifications, pushKey),
        put(updatePushNotificationBadgeAction()),
      ])
    }
  } catch (err) {
    console.warn('clearRoomPushNotificationSaga failed with-', err)
  }
}

function* toggleRoomPushNotificationSaga({
  payload: roomId,
}: PayloadAction<string>) {
  try {
    if (roomId) {
      const coreApi = getCoreBackend()
      const pushKey = b4a.toString(hypercoreID.decode(roomId), 'hex')
      const pref: boolean = yield select(
        getPreferencesRoomNotifications,
        roomId,
      )
      const { discoveryKey } = yield call(
        [coreApi, coreApi.getRoomKeys],
        roomId,
      )

      if (pref) {
        const request: boolean = yield call(
          unsubscribeRoomNotifications,
          discoveryKey,
        )
        if (request === false) {
          throw new Error(ERRORS.unsubscribeFailure)
        }
      } else {
        const token: string | null = yield call(
          subscribeToRoomNotifications,
          discoveryKey,
        )
        if (!token) {
          throw new Error(ERRORS.subscriptionFailure)
        }
      }

      yield all([
        call(setSubscribedToRoomNotifications, pushKey, !pref),
        call(updateRoomMemberProfile, roomId, !pref),
        put(toggleRoomNotifications({ roomId })),
      ])

      yield take(preferencesDataEvt)

      if (pref) {
        yield put(clearRoomPushNotificationAction(roomId))
      } else {
        yield put(updatePushNotificationBadgeAction())
      }
    }
  } catch (err) {
    console.warn('toggleRoomPushNotificationSaga failed with-', err)
  }
}

function* subscribeToRoomPushNotificationSaga({
  payload: roomId,
}: PayloadAction<string>) {
  try {
    if (roomId) {
      const pushKey = b4a.toString(hypercoreID.decode(roomId), 'hex')
      const pref: boolean = yield select(
        getPreferencesRoomNotifications,
        roomId,
      )

      if (pref && !isSubscribedToRoomNotifications(pushKey)) {
        const coreApi = getCoreBackend()
        const { discoveryKey } = yield call(
          [coreApi, coreApi.getRoomKeys],
          roomId,
        )
        const token: string | null = yield call(
          subscribeToRoomNotifications,
          discoveryKey,
        )
        if (!token) {
          throw new Error(ERRORS.subscriptionFailure)
        }
        yield call(setSubscribedToRoomNotifications, pushKey, true)
      }
    }
  } catch (err) {
    console.warn('subscribeToRoomPushNotificationSaga failed with-', err)
  }
}

function* unsubscribeToRoomPushNotificationSaga({
  payload: roomId,
}: PayloadAction<string>) {
  try {
    if (roomId) {
      const pref: boolean = yield select(
        getPreferencesRoomNotifications,
        roomId,
      )
      if (pref) {
        const coreApi = getCoreBackend()
        const pushKey = b4a.toString(hypercoreID.decode(roomId), 'hex')
        const { discoveryKey } = yield call(
          [coreApi, coreApi.getRoomKeys],
          roomId,
        )
        yield all([
          call(unsubscribeRoomNotifications, discoveryKey),
          call(updateRoomMemberProfile, roomId, false),
          call(setSubscribedToRoomNotifications, pushKey, false),
          put(clearRoomPushNotificationAction(roomId)),
        ])
      }
    }
  } catch (err) {
    console.warn('unsubscribeToRoomPushNotificationSaga failed with-', err)
  }
}

function* batchSubscribePushNotificationSaga({ payload: rooms = [] }) {
  try {
    yield delay(500)
    yield all(
      rooms.map(({ roomId }: { roomId: string }) =>
        put(subscribeToRoomPushNotificationAction(roomId)),
      ),
    )
  } catch (err) {
    console.warn('roomsSubscribeSaga failed with-', err)
  }
}

const updatePushNotificationBadgeAction = createAction('push/update-push-badge')
export const clearRoomPushNotificationAction = createAction<string>(
  'push/clear-room-push',
)
export const toggleRoomPushNotificationAction = createAction<string>(
  'push/toggle-room-push',
)
const subscribeToRoomPushNotificationAction = createAction<string>(
  'push/subscribe-to-room-push',
)
const unsubscribeToRoomPushNotificationAction = createAction<string>(
  'push/unsubscribe-to-room-push',
)

export function* pushNotificationSaga() {
  yield takeEvery(
    updatePushNotificationBadgeAction,
    updatePushNotificationBadgeSaga,
  )
  yield takeEvery(roomNewActivity, onRoomNewActivitySaga)
  yield takeLatest(
    clearRoomPushNotificationAction,
    clearRoomPushNotificationSaga,
  )
  yield takeLatest(
    toggleRoomPushNotificationAction,
    toggleRoomPushNotificationSaga,
  )

  // handle subscribe
  yield takeEvery(
    subscribeToRoomPushNotificationAction,
    subscribeToRoomPushNotificationSaga,
  )
  yield takeLatest(setAllRooms, batchSubscribePushNotificationSaga)

  // handle unsubscribe
  yield takeEvery(
    unsubscribeToRoomPushNotificationAction,
    unsubscribeToRoomPushNotificationSaga,
  )
  yield takeEvery(leaveRoomSuccessEvent, unsubscribeToRoomPushNotificationSaga)
}
