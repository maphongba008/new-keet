import React, { useEffect } from 'react'
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { Image, ImageErrorEventData } from 'expo-image'
import { useVideoPlayer, VideoView } from 'expo-video'

import { isAndroid } from './platform'

export type Props = {
  url: string
  onPress?: () => void
  onLoad?: () => void
  onError?: (error: ImageErrorEventData) => void
  onDurationRetrieved?: (videoDuration: number) => void
  style?: StyleProp<ViewStyle>
}

export function KeetVideoThumbnailPlaceholder({ onError }: Props) {
  React.useEffect(() => {
    onError?.({ error: 'No preview image' })
  }, [onError])

  return null
}

export function KeetVideoThumbnail({
  url,
  onError,
  onLoad,
  onPress,
  onDurationRetrieved,
  style,
}: Props) {
  const player = useVideoPlayer(url, (_player) => {
    _player.loop = false
    _player.muted = true
  })

  useEffect(() => {
    const subscriptionVideoStatus = player.addListener(
      'statusChange',
      ({ status, error }) => {
        const duration = player.duration

        if (!isNaN(duration)) {
          onDurationRetrieved?.(player.duration)
        }

        if (status === 'readyToPlay') {
          return onLoad?.()
        }
        if (status === 'error' && error) {
          return onError?.({ error: error.message })
        }
      },
    )

    return () => {
      subscriptionVideoStatus.remove()
    }
  }, [onDurationRetrieved, onError, onLoad, player, url])

  const videoView = (
    <VideoView style={style} player={player} nativeControls={false} />
  )

  if (isAndroid) {
    return (
      <>
        {videoView}
        <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
      </>
    )
  }
  return videoView
}

export const getThumbnailCacheKey = (
  fileNameOrPath: string,
  byteLength: number,
) => encodeURI(`${byteLength}-${fileNameOrPath.split('/').reverse()[0]}`)

const _androidImageCache = new Set()

export const getIsClearedImage = (cacheKey: string) =>
  _androidImageCache.has(cacheKey)

export const clearImage = async (cacheKey: string): Promise<boolean> => {
  _androidImageCache.add(cacheKey)
  return Image.clearImageCache(cacheKey)
}
