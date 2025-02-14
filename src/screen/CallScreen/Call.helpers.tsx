// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid } from 'react-native'
import { createSelector } from '@reduxjs/toolkit'
import _debounce from 'lodash/debounce'

import {
  callAudioStreamToggle,
  getCallPeerVideoCount,
  getCallSettingsState,
  getCallState,
  getCallUnknownPresenceIds,
} from '@holepunchto/keet-store/store/call'
import { setCurrentCallMuted, setSpeakerOn } from '@holepunchto/webrtc'

import {
  getIsSpeakerOn,
  setSpeakerOn as setSpeakerOnReducer,
} from 'reducers/application'
import { toggleVideoCallAction } from 'sagas/callSaga'

import { dismissCall } from 'lib/call'
import {
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
  REMOTE_SYNC_DELAY,
} from 'lib/constants'
import { consoleError } from 'lib/errors'
import { doVibrateSuccess } from 'lib/haptics'
import { isAndroid } from 'lib/platform'
import { getState, getStore, store } from 'lib/store'

export const getCallMembersData = createSelector(
  [
    getCallState,
    getCallUnknownPresenceIds,
    getCallPeerVideoCount,
    getCallSettingsState,
  ],
  (callState, unknownPresenceIds, callPeerVideoCount, callSettingState) => {
    const { memberId, presenceMemberSwarmIds } = callState
    const { isVideoMuted } = callSettingState
    const ids = [
      memberId,
      ...presenceMemberSwarmIds,
      ...unknownPresenceIds,
    ].filter((id) => Boolean(id))

    return {
      ids,
      count: ids.length,
      memberId,
      unknownPresenceIds: unknownPresenceIds.filter((id) => Boolean(id)),
      callVideoCount: callPeerVideoCount + (isVideoMuted ? 0 : 1),
    }
  },
)

export const isBluetoothPermissionGranted = async () => {
  try {
    if (!isAndroid) return false
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    )
  } catch (err) {
    consoleError('Error checking bluetooth permission')
  }
}

export const handleSpeaker = (value?: boolean) => {
  const _store = getStore()

  if (value !== undefined) {
    _store.dispatch(setSpeakerOnReducer(value))
    setSpeakerOn(value)
    return
  }

  const state = getState()
  const speakerOn = !getIsSpeakerOn(state)
  _store.dispatch(setSpeakerOnReducer(speakerOn))
  setSpeakerOn(speakerOn)
}

export const onToggleMicrophone = _debounce(
  () => {
    try {
      const state = getState()
      doVibrateSuccess()
      store.dispatch(callAudioStreamToggle())
      const { isAudioMuted } = getCallSettingsState(state)
      setCurrentCallMuted(!isAudioMuted)
    } catch (err) {
      console.log(err)
    }
  },
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
)

export const onToggleVideo = _debounce(
  async () => {
    const state = getState()
    const { isAudioMuted, isVideoMuted } = getCallSettingsState(state)
    const speakerOn = getIsSpeakerOn(state)
    store.dispatch(toggleVideoCallAction())
    doVibrateSuccess()

    if (!isVideoMuted) return
    if (isAudioMuted) onToggleMicrophone()
    if (!speakerOn) handleSpeaker(true)
  },
  REMOTE_SYNC_DELAY,
  BACK_DEBOUNCE_OPTIONS,
)

export const disconnectCall = _debounce(
  () => {
    dismissCall()
  },
  REMOTE_SYNC_DELAY,
  BACK_DEBOUNCE_OPTIONS,
)

export const handleEndCall = () => {
  doVibrateSuccess()
  disconnectCall()
  // toggle off the speaker
  handleSpeaker(false)
}

export const handleNativeCallMute = ({ muted }: { muted: boolean }) => {
  const state = store.getState()
  const { isAudioMuted } = getCallSettingsState(state)
  if (muted === isAudioMuted) return
  store.dispatch(callAudioStreamToggle())
}
