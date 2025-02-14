// https://github.com/holepunchto/keet-desktop/blob/main/src/hooks/use-stream.js
// @ts-nocheck
import { createContext, useContext } from 'react'
import { useSelector } from 'react-redux'
import _size from 'lodash/size'

import {
  getCallId,
  getCallSettingsState,
  getCallState,
  getCallUnknownPresenceIds,
  getScreenStreams,
} from '@holepunchto/keet-store/store/call'

import { useDeepEqualSelector } from './useDeepEqualSelector'

export const StreamContext = createContext({
  getRemoteSrcObject: () => {},
  getLocalSrcObj: () => {},
})

export type Stream = {
  id?: string
  getVideoTracks: () => Array<{ id: string }> | Array<string>
} | null

export const useCallMediaStreamById = (streamId): Stream => {
  const callId = useSelector(getCallId)
  const { getRemoteSrcObject, getLocalSrcObj } = useContext(StreamContext)
  if (!(callId && streamId)) {
    return null
  }
  const localStream = getLocalSrcObj(streamId)
  if (localStream) {
    return localStream
  }
  const stream = getRemoteSrcObject(callId, streamId)
  return stream
}

export type CameraStreamType = {
  swarmId: string
  memberId: string
  isSelf?: boolean
  isVideoMuted: boolean
  isAudioMuted: boolean
  stream?: Stream
  isStreamPlayable: boolean
}

export const useCallCameraStreams = (): CameraStreamType[] => {
  const {
    memberId,
    presenceMemberSwarmIds,
    mediaBySwarmId,
    presenceBySwarmId,
  } = useDeepEqualSelector(getCallState)
  const {
    isVideoMuted: isMyVideoMuted,
    isAudioMuted: isMyAudioMuted,
    cameraStreamId: myCameraStreamId,
  } = useDeepEqualSelector(getCallSettingsState)
  const callUnknownPresenceIds = useDeepEqualSelector(getCallUnknownPresenceIds)
  const callId = useDeepEqualSelector(getCallId)

  const { getRemoteSrcObject, getLocalSrcObj } = useContext(StreamContext)

  const myStream = isMyVideoMuted ? undefined : getLocalSrcObj(myCameraStreamId)

  const data: CameraStreamType[] = [
    {
      swarmId: memberId,
      memberId,
      isSelf: true,
      isVideoMuted: isMyVideoMuted,
      isAudioMuted: isMyAudioMuted,
      stream: myStream,
      isStreamPlayable: _size(myStream?.getVideoTracks()) > 0,
    },
    ...[...presenceMemberSwarmIds, ...callUnknownPresenceIds]
      .filter((swarmId) => Boolean(swarmId))
      .map((swarmId) => {
        const streamId = mediaBySwarmId[swarmId]?.streamByName?.camera?.id
        const isVideoMuted = mediaBySwarmId[swarmId]?.isVideoMuted
        const isAudioMuted = mediaBySwarmId[swarmId]?.isAudioMuted
        const stream =
          isVideoMuted || !streamId
            ? undefined
            : getRemoteSrcObject(callId, streamId)

        return {
          swarmId,
          memberId: presenceBySwarmId[swarmId]?.memberId || swarmId,
          isAudioMuted,
          stream,
          isStreamPlayable: _size(stream?.getVideoTracks()) > 0,
        }
      }),
  ]

  if (data.length <= 2) {
    return data
  }

  return data.sort(
    (a, b) => Number(b.isStreamPlayable) - Number(a.isStreamPlayable),
  )
}

export const useCallSharedScreenStream = ():
  | { trackId: string; memberId: string }
  | undefined => {
  const screenStreams = useSelector(getScreenStreams)
  const callId = useDeepEqualSelector(getCallId)

  const streamId = screenStreams?.[0]?.streamId

  const { getRemoteSrcObject } = useContext(StreamContext)

  if (!streamId) {
    return
  }

  const sharedScreenStream = getRemoteSrcObject(callId, streamId)
  const trackId = sharedScreenStream?.getVideoTracks?.()?.[0]

  if (!trackId) {
    return
  }

  return {
    trackId: String(trackId),
    memberId: screenStreams?.[0]?.memberId,
  }
}
