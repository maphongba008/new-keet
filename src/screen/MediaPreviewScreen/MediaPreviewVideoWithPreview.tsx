import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FlexStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'
import Animated, { AnimatedStyle } from 'react-native-reanimated'

import { getIsAppBackgrounded } from 'reducers/application'

import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, hexToRgbOpacity } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_20, UI_SIZE_24, UI_SIZE_32 } from 'lib/commonStyles'
import { isAndroid, isIOS, platformVersion } from 'lib/platform'

import {
  MediaPreviewVideo,
  MediaPreviewVideoPlayerStatus,
  MediaPreviewVideoProps,
} from './MediaPreviewVideo'
import { MediaPreviewVideoLegacy } from './MediaPreviewVideoLegacy'

interface MediaPreviewVideoWithPreviewProps
  extends Pick<MediaPreviewVideoProps, 'uri' | 'showControls' | 'videoRefs'> {
  autoPlay?: boolean
  previewUri?: string
  animatedStyles?: StyleProp<AnimatedStyle<FlexStyle>>
  onLoadEnd: () => void
}

export const MediaPreviewVideoWithPreview = ({
  uri,
  autoPlay,
  showControls,
  previewUri,
  videoRefs,
  animatedStyles,
  onLoadEnd,
}: MediaPreviewVideoWithPreviewProps) => {
  const styles = getStyles()
  const [videoPlayerStatus, setVideoPlayerStatus] =
    useState<MediaPreviewVideoPlayerStatus>('preview')

  const background = useSelector(getIsAppBackgrounded)
  const previewSource = useMemo(() => ({ uri: previewUri }), [previewUri])

  const showVideo =
    Boolean(uri) &&
    videoPlayerStatus !== 'preview' &&
    videoPlayerStatus !== 'error'

  const showPreview =
    Boolean(previewUri) &&
    ['preview', 'previewLoading', 'error'].includes(videoPlayerStatus)

  const showCustomPlayButton = videoPlayerStatus === 'preview'

  const showNativeControls = showControls && !showPreview

  const autoPlayInitPreview = autoPlay && showControls

  const showLoading =
    videoPlayerStatus === 'loading' || videoPlayerStatus === 'previewLoading'

  useEffect(() => {
    onLoadEnd()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onInitVideo = useCallback(() => {
    setVideoPlayerStatus('previewLoading')
  }, [])
  const VideoComponent = useMemo(() => {
    if (isAndroid && platformVersion && platformVersion <= 30)
      return MediaPreviewVideoLegacy

    return MediaPreviewVideo
  }, [])

  useEffect(() => {
    if (autoPlayInitPreview) {
      onInitVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayInitPreview])

  if (background && isIOS) {
    return null
  }

  return (
    <Animated.View
      style={animatedStyles}
      {...appiumTestProps(APPIUM_IDs.media_preview_video_view)}
    >
      {showVideo && (
        <VideoComponent
          uri={uri}
          videoRefs={videoRefs}
          showControls={showNativeControls}
          videoPlayerStatus={videoPlayerStatus}
          setVideoPlayerStatus={setVideoPlayerStatus}
        />
      )}
      {showPreview && (
        <Animated.Image
          source={previewSource}
          resizeMode="contain"
          resizeMethod="scale"
          style={s.absoluteFill}
          progressiveRenderingEnabled
        />
      )}
      {showCustomPlayButton && (
        <View style={[StyleSheet.absoluteFillObject, s.centeredLayout]}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={onInitVideo}
            {...appiumTestProps(APPIUM_IDs.media_preview_btn_custom_play)}
          >
            <SvgIcon name="play" width={UI_SIZE_32} height={UI_SIZE_32} />
          </TouchableOpacity>
        </View>
      )}
      {showLoading && (
        <View
          style={[StyleSheet.absoluteFillObject, s.centeredLayout]}
          {...appiumTestProps(APPIUM_IDs.media_preview_loading)}
        >
          <Loading style={styles.loader} />
        </View>
      )}
    </Animated.View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    loader: {
      height: UI_SIZE_32,
      width: UI_SIZE_32,
    },
    playBtn: {
      backgroundColor: hexToRgbOpacity(theme.color.grey_600, 0.4),
      borderRadius: UI_SIZE_24 * 2,
      height: UI_SIZE_20 * 3,
      width: UI_SIZE_20 * 3,
      ...s.centeredLayout,
    },
  })
  return styles
})
