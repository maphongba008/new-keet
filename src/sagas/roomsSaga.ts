import { all, call, delay, put, race, select, take } from 'redux-saga/effects'
import { createAction, PayloadAction } from '@reduxjs/toolkit'

import { appRoomJoinSaga } from '@holepunchto/keet-store/store/app'
import { taskErrorNotification } from '@holepunchto/keet-store/store/error'
import { setSyncDeviceErrorMsg } from '@holepunchto/keet-store/store/identity'
import {
  getRoomLastPairing,
  setPairingRoom,
  setRoomPairError,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import { getShareContent, setShareContent } from 'reducers/application'

import { getErrorMessage } from 'lib/hooks/useErrorMessage'
import { showErrorNotifier, showInfoNotifier } from 'lib/hud'
import { isRoomUrl } from 'lib/linking'
import {
  APP_ROOT,
  getCurrentRoute,
  navigate,
  popToTop,
  reset,
  SCREEN_HOME,
  SCREEN_ROOM,
} from 'lib/navigation'
import { ShareContent } from 'lib/shareContent'
import { isString } from 'lib/validation'

import { getStrings } from 'i18n/strings'

export function* joinRoomHandler({
  payload: { link: url },
}: PayloadAction<{ link: string }>): Generator<unknown, void, any> {
  if (!isString(url)) return
  if (!isRoomUrl(url)) {
    const strings = getStrings()
    yield put(
      taskErrorNotification(
        strings.room.roomInvitation,
        strings.room.invalidInvitation,
      ),
    )
  }

  const [
    pairingAction,
    switchAction,
    roomListErrorAction,
    identityLinkErrorAction,
  ] = yield race([
    take(setPairingRoom),
    take((action: any) => action.type === switchRoomSubmit.type),
    take(setRoomPairError),
    take(setSyncDeviceErrorMsg),
  ])

  // room with this link is already paired
  if (switchAction) {
    return navigate(SCREEN_ROOM)
  }

  const route = yield call(getCurrentRoute)

  if (roomListErrorAction) {
    const errorMessage = getErrorMessage(roomListErrorAction?.payload)
    if (errorMessage && route === SCREEN_ROOM) {
      showErrorNotifier(errorMessage, false)
      yield put(setRoomPairError(''))
    }
    return
  }

  if (identityLinkErrorAction) {
    const errorMessage = getErrorMessage(identityLinkErrorAction?.payload)
    if (errorMessage && route === SCREEN_ROOM) {
      showErrorNotifier(errorMessage, false)
      yield put(setSyncDeviceErrorMsg(''))
    }
    return
  }

  // room pairing is already processing
  if (!pairingAction && route !== SCREEN_HOME) {
    return reset(APP_ROOT)
  }
}

// When navigate back to Lobby screen from room, share content will be reset by useFocusEffect.
// So need to wait till it's reset (that mean active route is lobby), then set new shareContent from forward message
export function* waitForShareContentNull(): Generator<any, void, any> {
  try {
    const shareContent = yield select(getShareContent)
    if (shareContent.length > 0) {
      yield take(setShareContent)
    }
    while (true) {
      yield take('*')
      const route = yield call(getCurrentRoute)
      if (route === SCREEN_HOME) return
    }
  } catch {}
}

export function* batchJoinRoomHandler({
  payload: allRoomUrls,
}: PayloadAction<string[]>) {
  try {
    if (!Number(allRoomUrls.length)) {
      return
    }
    const allTasks = allRoomUrls.map((url: string) =>
      call(function* () {
        yield call(appRoomJoinSaga, { payload: { link: url } })
      }),
    )
    yield all(allTasks)
    return popToTop()
  } catch {}
}

export function* handleForwardMessageSaga({
  payload,
}: PayloadAction<ShareContent>) {
  try {
    yield waitForShareContentNull()
    yield put(setShareContent([payload]))
  } catch {}
}

export function* roomPairingNotificationSaga(): Generator<any, void, any> {
  try {
    const lastPairingRoomData = yield select(getRoomLastPairing)
    if (!lastPairingRoomData) {
      return
    }
    const strings: any = getStrings()
    const pairingStatus = lastPairingRoomData?.status
    showInfoNotifier(strings.room.pairingNotification[pairingStatus])
    yield delay(500)
  } catch {}
}

export const handleForwardMessage =
  createAction<ShareContent>('app/forwardMessage')
export const handleBatchJoinRoom = createAction<any>('rooms/communityJoinRoom')
