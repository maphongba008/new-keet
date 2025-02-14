import { call, delay, put, select, take, takeLatest } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'

import {
  getAppCurrentCallRoomId,
  isOngoingCallByRoomId,
} from '@holepunchto/keet-store/store/app'
import {
  callLeave,
  callVideoDeviceUpdate,
  callVideoQualityUpdate,
  callVideoStreamToggle,
  decreaseCallPeersCount,
  getCallPeerVideoCount,
  getCallSettingsState,
  increaseCallPeersCount,
} from '@holepunchto/keet-store/store/call'
import {
  Device,
  getVideoDevice,
  getVideoDevices,
} from '@holepunchto/keet-store/store/media'
import { getPreferencesRoomNotifications } from '@holepunchto/keet-store/store/preferences'
import { getRoomItemById } from '@holepunchto/keet-store/store/room'
import { setInCall, setKeepScreenOn } from '@holepunchto/webrtc'

import { CALL_ONGOING_DISMISS } from 'reducers/call'

import {
  closeBottomSheet,
  showBottomSheet,
  useAppBottomSheetStore,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import {
  BOTTOM_SHEET_ANIMATION_DURATION,
  MOBILE_CALL_VIDEO_LIMIT_MEMBERS,
} from 'lib/constants'
import { consoleError } from 'lib/errors'
import type { ConfigType } from 'lib/hooks/useRoom'
import { getLobbyCallOnGoing, removeLobbyCallData } from 'lib/localStorage'
import { ensureExpoCameraPermissions } from 'lib/media'
import { back, getCurrentRoute } from 'lib/navigation'
import { isIOS } from 'lib/platform'

export function canModerate(capabilities: any) {
  // eslint-disable-next-line no-bitwise
  return (capabilities & 0b100) !== 0
}

export function* handleCallOnGoing({
  payload,
}: {
  payload: { roomId: string }
}) {
  const roomId = payload?.roomId
  const callOngoingRoomId: string = yield select(getAppCurrentCallRoomId)
  const { title, canCall, myCapabilites }: ConfigType = yield select(
    getRoomItemById(roomId),
  ) || {}
  const canModerateRoom = canModerate(myCapabilites)
  if (!canCall && !canModerateRoom) {
    return
  }

  const { showBottomSheet: bottomSheetVisible } =
    useAppBottomSheetStore.getState()

  if (bottomSheetVisible) {
    yield take(CALL_ONGOING_DISMISS)
    yield delay(BOTTOM_SHEET_ANIMATION_DURATION)
  }

  const { dismissed, joined } = (yield call(getLobbyCallOnGoing, roomId)) || {}
  const notificationsOn: boolean = yield select(
    getPreferencesRoomNotifications,
    roomId,
  )
  const route = getCurrentRoute()

  if (
    dismissed ||
    joined ||
    !notificationsOn ||
    route !== 'home' ||
    roomId === callOngoingRoomId
  )
    return

  showBottomSheet({
    bottomSheetType: BottomSheetEnum.CallStarted,
    roomId,
    title,
    bottomSheetBackdropPressBehaviour: 'none',
    bottomSheetEnablePanDownToClose: false,
  })
}

export function* handleCallEnded({ payload }: { payload: { roomId: string } }) {
  yield delay(200)
  const roomId = payload?.roomId
  const isCallOngoing: Boolean = yield select(isOngoingCallByRoomId, roomId)
  if (isCallOngoing) return
  const { sheetType, showBottomSheet: _showBottomSheet } =
    useAppBottomSheetStore.getState()
  if (_showBottomSheet && sheetType === BottomSheetEnum.CallStarted)
    closeBottomSheet()
  yield call(removeLobbyCallData, roomId)
}

export const FACE_CAM_DEVICE_STATIC_ID = isIOS
  ? 'Front Camera|videoinput|1'
  : '1|videoinput|1'
export function* videoToggleSaga() {
  try {
    const { isVideoMuted } = yield select(getCallSettingsState)
    if (!isVideoMuted) {
      yield put(callVideoStreamToggle())
    } else {
      const callPeerVideoCount: number = yield select(getCallPeerVideoCount)

      if (callPeerVideoCount < MOBILE_CALL_VIDEO_LIMIT_MEMBERS) {
        const videoDevices: Device[] = yield select(getVideoDevices)
        const frontCamera = videoDevices.find(
          (device) => device.deviceStaticId === FACE_CAM_DEVICE_STATIC_ID,
        )

        yield call(ensureExpoCameraPermissions, {
          isOverrideDefaultPermission: false,
        })
        // check for denied scenario
        if (frontCamera) {
          yield put(callVideoDeviceUpdate(FACE_CAM_DEVICE_STATIC_ID))
        }
        yield put(callVideoQualityUpdate(isIOS ? 2 : 1)) // 1 - Standard quality, 2 - High quality
        yield put(callVideoStreamToggle())
      }
    }
  } catch (err) {
    consoleError('Error in videoToggleSaga', err)
  }
}

export function* onVideoCameraToggleSaga() {
  try {
    const videoDevices: Device[] = yield select(getVideoDevices)
    const videoDevice: Device = yield select(getVideoDevice)
    const otherCamera = videoDevices.find(
      (device) => device.deviceStaticId !== videoDevice.deviceStaticId,
    )

    if (otherCamera) {
      yield put(callVideoDeviceUpdate(otherCamera.deviceStaticId))
    }
  } catch {}
}

function* callLeaveSaga() {
  try {
    const route = getCurrentRoute()
    if (route === 'call') {
      back()
    }
    setInCall({ enabled: false })
    setKeepScreenOn(false)
  } catch {}
}

export const toggleVideoCallAction = createAction('call/toggle-video')
export const videoCameraToggleAction = createAction('call/toggle-video-camera')

export function* callSaga() {
  yield takeLatest(increaseCallPeersCount, handleCallOnGoing)
  yield takeLatest(decreaseCallPeersCount, handleCallEnded)
  yield takeLatest(toggleVideoCallAction, videoToggleSaga)
  yield takeLatest(videoCameraToggleAction, onVideoCameraToggleSaga)
  yield takeLatest(callLeave, callLeaveSaga)
}
