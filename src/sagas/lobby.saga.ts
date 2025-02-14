import { Task } from 'redux-saga'
import {
  cancel,
  delay,
  fork,
  put,
  select,
  take,
  takeEvery,
} from 'redux-saga/effects'

import {
  getRoomListSearchText,
  roomListInViewIdsChangeEvt,
  setAllRooms,
  setRoomConfig,
} from '@holepunchto/keet-store/store/room'

import { getLobbyUpdating, setLobbyUpdating } from 'reducers/application'

import { consoleError } from 'lib/errors'

// Here we are checking the if first set of rooms is loaded, Once loaded fully cancel updating
// For some rooms the loading will be longer, Updating will not wait for it and will be cancelled by timeout
function* lobbyLoading(roomIdsFromPayload: Array<string>) {
  let roomIds = roomIdsFromPayload

  yield takeEvery(setRoomConfig, function* ({ payload }) {
    const roomId = payload?.roomId
    if (!roomId) return
    roomIds = roomIds.filter((_roomId: string) => roomId !== _roomId)
    if (roomIds.length === 0) {
      yield put(setLobbyUpdating(false))
    }
  })
}

// Cancel updating when past timeout of 7sec
function* timedOutUpdating() {
  yield delay(7000)
  const isUpdating: Boolean = yield select(getLobbyUpdating)
  if (!isUpdating) return
  yield put(setLobbyUpdating(false))
}

function* lobbySaga(): Generator<any> {
  try {
    const rooms = yield take(setAllRooms)
    const searchText = yield select(getRoomListSearchText)
    if (rooms?.payload?.length === 0 || !!searchText) {
      yield put(setLobbyUpdating(false))
      return
    }
    const { payload: roomIdsFromPayload } = yield take(
      roomListInViewIdsChangeEvt,
    )
    const lobbyTask: Task<any> = yield fork(lobbyLoading, roomIdsFromPayload)
    const timeoutTask: Task<any> = yield fork(timedOutUpdating)
    yield take(setLobbyUpdating)
    yield cancel([timeoutTask, lobbyTask])
  } catch (error) {
    consoleError('Lobby saga error', error)
  }
}

export default lobbySaga
