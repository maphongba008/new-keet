import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'
import { interpolate } from 'react-native-reanimated'

import { UI_SIZE_4 } from 'lib/commonStyles'
import {
  WAVEFORM_HEIGHT,
  WAVEFORM_MIN_HEIGHT,
  WAVEFORM_SPACE,
} from 'lib/constants'

import { useTheme } from './theme'

interface WaveformProps {
  waveform: Array<number>
  width: number
  durationMillis: number
  positionMillis: number
}

const WaveformVisual = ({
  waveform,
  width = 0,
  durationMillis,
  positionMillis,
}: WaveformProps) => {
  const theme = useTheme()

  const waveformItemWidth = useMemo(
    () => width / waveform.length - WAVEFORM_SPACE * 2,
    [waveform.length, width],
  )

  const maxAmplitude = useMemo(() => Math.max(...waveform), [waveform])

  const scaleFactor = useMemo(
    () => (maxAmplitude === 0 ? 0 : WAVEFORM_HEIGHT / maxAmplitude),
    [maxAmplitude],
  )

  const renderWaveform = useCallback(
    (value: number, index: number) => {
      const waveformItemHeight = value * scaleFactor
      const interpolatedWidth = interpolate(
        positionMillis,
        [0, durationMillis],
        [0, width],
      )
      const fillColor =
        positionMillis &&
        positionMillis !== 0 &&
        index * (WAVEFORM_SPACE * 2 + waveformItemWidth) <= interpolatedWidth
          ? theme.color.blue_400
          : theme.color.grey_300

      return (
        <View
          key={index}
          style={[
            styles.waveformItem,
            {
              width: waveformItemWidth,
              height: Math.max(waveformItemHeight || 0, WAVEFORM_MIN_HEIGHT),
              backgroundColor: fillColor,
            },
          ]}
        />
      )
    },
    [
      durationMillis,
      positionMillis,
      scaleFactor,
      width,
      waveformItemWidth,
      theme.color.grey_300,
      theme.color.blue_400,
    ],
  )

  return <View style={styles.container}>{waveform.map(renderWaveform)}</View>
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  waveformItem: {
    borderRadius: UI_SIZE_4,
    marginHorizontal: WAVEFORM_SPACE,
  },
})

export default memo(WaveformVisual, isEqual)
