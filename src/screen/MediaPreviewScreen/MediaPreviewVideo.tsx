import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { StatusChangeEventPayload, useVideoPlayer, VideoView } from 'expo-video'

import { isOngoingCallByRoomId } from '@holepunchto/keet-store/store/app'
import { getRoomMainId } from '@holepunchto/keet-store/store/room'

import { getIsAppBackgrounded } from 'reducers/application'

import s from 'lib/commonStyles'
import { showErrorNotifier } from 'lib/hud'
import { parseURLToGetKey } from 'lib/media'
import { isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

export interface MediaPreviewVideoControls {
  play(): void
  pause(): void
  reset(): void
}

export interface MediaPreviewVideoProps {
  uri: string
  videoRefs: MutableRefObject<Record<string, MediaPreviewVideoControls>>
  showControls: boolean
  videoPlayerStatus: MediaPreviewVideoPlayerStatus
  setVideoPlayerStatus: (value: MediaPreviewVideoPlayerStatus) => void
}

export type MediaPreviewVideoPlayerStatus =
  | 'preview'
  | 'previewLoading'
  | 'playing'
  | 'loading'
  | 'error'

export const MediaPreviewVideo = ({
  uri,
  videoRefs,
  showControls,
  videoPlayerStatus,
  setVideoPlayerStatus,
}: MediaPreviewVideoProps) => {
  const strings = useStrings()
  const eventId = parseURLToGetKey(uri)
  const videoViewRef = useRef<VideoView>(null)

  const background = useSelector(getIsAppBackgrounded)
  const roomId = useSelector(getRoomMainId)
  const isCallOnGoing = useSelector((state) =>
    isOngoingCallByRoomId(state, roomId),
  )

  const player = useVideoPlayer(uri, (_player) => {
    _player.loop = false
    _player.muted = isCallOnGoing
    _player.play()
  })

  useEffect(() => {
    player.muted = isCallOnGoing
    const ref = videoRefs.current
    ref[eventId] = {
      play() {
        player.play()
      },
      pause() {
        player.pause()
      },
      async reset() {
        await videoViewRef.current?.exitFullscreen()
        setVideoPlayerStatus('preview')
      },
    }

    return () => {
      delete ref[eventId]
    }
  }, [player, isCallOnGoing, eventId, setVideoPlayerStatus, videoRefs])

  const onVideoPlayerStatusChange = useCallback(
    (status: StatusChangeEventPayload) => {
      const nextVideoPlayerStatus = status.status
      if (
        nextVideoPlayerStatus === 'loading' &&
        videoPlayerStatus === 'previewLoading'
      ) {
        return
      }
      if (
        nextVideoPlayerStatus === 'readyToPlay' ||
        nextVideoPlayerStatus === 'idle'
      ) {
        return setVideoPlayerStatus('playing')
      }

      if (nextVideoPlayerStatus === 'error') {
        showErrorNotifier(strings.common.videoError, false)
      }
      setVideoPlayerStatus(nextVideoPlayerStatus)
    },
    [setVideoPlayerStatus, strings.common.videoError, videoPlayerStatus],
  )

  const onVideoEnd = useCallback(() => {
    videoRefs.current[eventId].reset()
  }, [eventId, videoRefs])

  useEffect(() => {
    const subscriptionVideoStatus = player.addListener(
      'statusChange',
      onVideoPlayerStatusChange,
    )
    const subscriptionVideoPlayToEnd = player.addListener(
      'playToEnd',
      onVideoEnd,
    )

    return () => {
      subscriptionVideoStatus.remove()
      subscriptionVideoPlayToEnd.remove()
    }
  }, [onVideoEnd, onVideoPlayerStatusChange, player])

  if (background && isIOS) {
    return null
  }

  return (
    <VideoView
      ref={videoViewRef}
      style={s.container}
      player={player}
      allowsFullscreen
      nativeControls={showControls}
    />
  )
}
