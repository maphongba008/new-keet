import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av'

import { isOngoingCallByRoomId } from '@holepunchto/keet-store/store/app'
import { getRoomMainId } from '@holepunchto/keet-store/store/room'

import { getIsAppBackgrounded } from 'reducers/application'

import s from 'lib/commonStyles'
import { showErrorNotifier } from 'lib/hud'
import { parseURLToGetKey } from 'lib/media'
import { useScreenOrientation } from 'lib/screenOrientation'

import { useStrings } from 'i18n/strings'

import { MediaPreviewVideoProps } from './MediaPreviewVideo'

export const MediaPreviewVideoLegacy = ({
  uri,
  videoRefs,
  showControls,
  setVideoPlayerStatus,
}: MediaPreviewVideoProps) => {
  const strings = useStrings()
  const videoSource = useMemo(() => ({ uri }), [uri])
  const currentVideoRef = useRef<Video>(null)
  const { isLandscapeOrientation } = useScreenOrientation()
  const eventId = useMemo(() => parseURLToGetKey(uri), [uri])

  const background = useSelector(getIsAppBackgrounded)
  const roomId = useSelector(getRoomMainId)
  const isCallOnGoing = useSelector((state) =>
    isOngoingCallByRoomId(state, roomId),
  )
  const onError = useCallback(() => {
    showErrorNotifier(strings.common.videoError, false)
    setVideoPlayerStatus('error')
  }, [setVideoPlayerStatus, strings.common.videoError])

  const canShowControl = useMemo(
    () => (isLandscapeOrientation ? undefined : true),
    [isLandscapeOrientation],
  )

  const onUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return
      }
      if (status.didJustFinish) {
        videoRefs.current[eventId].reset()
      }
    },
    [eventId, videoRefs],
  )

  useEffect(() => {
    videoRefs.current[eventId] = {
      play() {
        currentVideoRef.current?.playAsync()
      },
      pause() {
        currentVideoRef.current?.pauseAsync()
      },
      reset() {
        setVideoPlayerStatus('preview')
      },
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      delete videoRefs.current[eventId]
    }
  }, [isCallOnGoing, videoRefs, eventId, setVideoPlayerStatus])

  const onLoad = useCallback(() => {
    setVideoPlayerStatus('playing')
  }, [setVideoPlayerStatus])

  if (background) {
    return null
  }

  return (
    <Video
      style={s.container}
      source={videoSource}
      isMuted={isCallOnGoing}
      isLooping={false}
      useNativeControls={showControls && canShowControl}
      onError={onError}
      onPlaybackStatusUpdate={onUpdate}
      ref={currentVideoRef}
      resizeMode={ResizeMode.CONTAIN}
      onLoad={onLoad}
      shouldPlay
    />
  )
}
