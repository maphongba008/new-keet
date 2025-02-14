import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'
import Reanimated, { FadeInDown } from 'react-native-reanimated'

import {
  getVMAudioSamples,
  getVMDuration,
  getVMShowAudioPlayer,
  getVMUri,
} from 'reducers/application'

import AudioPlayer from 'component/AudioPlayer'
import AudioWaveformRecording from 'component/AudioWaveformRecording'
import { createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { WAVEFORM_HEIGHT } from 'lib/constants'

const AudioPlayerWaveform = () => {
  const styles = getStyles()
  const uri = useSelector(getVMUri)
  const audioSamples = useSelector(getVMAudioSamples)
  const showAudioPlayer = useSelector(getVMShowAudioPlayer)
  const duration = useSelector(getVMDuration)

  return (
    <Reanimated.View style={styles.waveformContainer} entering={FadeInDown}>
      {showAudioPlayer && uri ? (
        <AudioPlayer uri={uri} samples={audioSamples} />
      ) : (
        <>
          <Text style={styles.duration}>{duration}</Text>
          <AudioWaveformRecording samples={audioSamples} />
        </>
      )}
    </Reanimated.View>
  )
}

export default memo(AudioPlayerWaveform)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    duration: {
      color: theme.color.grey_200,
      marginLeft: 5,
      width: 35,
    },
    waveformContainer: {
      ...s.row,
      ...s.centeredLayout,
      height: WAVEFORM_HEIGHT + 10,
      marginBottom: 5,
    },
  })

  return styles
})
