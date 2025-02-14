import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Reanimated, { ZoomIn } from 'react-native-reanimated'
import _isEmpty from 'lodash/isEmpty'

import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_4, UI_SIZE_40 } from 'lib/commonStyles'
import {
  WAVEFORM_HEIGHT,
  WAVEFORM_MIN_HEIGHT,
  WAVEFORM_SPACE,
} from 'lib/constants'
import { getMessageCellAvailableWidth } from 'lib/size'

const RECORDING_WAVEFORM_WIDTH = 2

type AudioWaveformRecordingProps = {
  samples: Array<number> | undefined
}

const AudioWaveformRecording = ({
  samples = [],
}: AudioWaveformRecordingProps) => {
  const styles = getStyles()
  const scrollRef = useRef<ScrollView>(null)

  const maxSampleCount = useMemo(() => {
    const availableWidth = getMessageCellAvailableWidth() - UI_SIZE_40
    return availableWidth / (RECORDING_WAVEFORM_WIDTH + WAVEFORM_SPACE * 2)
  }, [])

  useEffect(() => {
    if (samples.length % 2 !== 0 || samples.length < maxSampleCount) return

    scrollRef?.current?.scrollToEnd({ animated: true })
  }, [maxSampleCount, samples.length])

  const renderWaveform = useCallback(
    (sample: number, key: number) => (
      <Reanimated.View
        key={key}
        entering={ZoomIn}
        style={[
          styles.waveformItem,
          {
            height: Math.min(
              Math.max(sample / 10, WAVEFORM_MIN_HEIGHT),
              WAVEFORM_HEIGHT,
            ),
          },
        ]}
      />
    ),
    [styles.waveformItem],
  )

  if (_isEmpty(samples)) {
    return (
      <View style={[s.container, s.centeredLayout]}>
        <View style={styles.hLine} />
      </View>
    )
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.waveformSamplesContainer}
      contentContainerStyle={s.alignItemsCenter}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      horizontal
    >
      <View style={[s.row, s.alignItemsCenter]}>
        {samples.map(renderWaveform)}
      </View>
    </ScrollView>
  )
}

export default memo(AudioWaveformRecording)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    hLine: {
      backgroundColor: theme.background.bg_2,
      height: 1,
      position: 'absolute',
      width: '100%',
      zIndex: 0,
    },
    waveformItem: {
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_4,
      marginHorizontal: WAVEFORM_SPACE,
      width: RECORDING_WAVEFORM_WIDTH,
    },
    waveformSamplesContainer: {
      marginRight: UI_SIZE_4,
    },
  })
  return styles
})
