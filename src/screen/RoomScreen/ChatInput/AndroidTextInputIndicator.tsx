import React, { useState } from 'react'
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  TextInputScrollEventData,
  View,
} from 'react-native'

import { colors } from 'component/theme'
import { useTimeout } from 'lib/hooks'
import { isIOS } from 'lib/platform'

const INDICATOR_HEIGHT = 20
const INDICATOR_WIDTH = 2

export const useAndroidTextInputIndicator = () => {
  const [contentSizeHeight, setContentSizeHeight] = useState(0)
  const [inputHeight, setInputHeight] = useState(0)
  const onLayout: TextInputProps['onLayout'] = (e) => {
    setInputHeight(e.nativeEvent.layout.height)
  }

  const setContentSizeHeightWithDelay = useTimeout<number>((height) => {
    setContentSizeHeight(height)
  }, 10)

  const onContentSizeChange: TextInputProps['onContentSizeChange'] =
    React.useCallback(
      (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
        const height = e.nativeEvent.contentSize.height
        // onContentSizeChange runs before onLayout so we need to wait a bit
        setContentSizeHeightWithDelay(height)
      },
      [setContentSizeHeightWithDelay],
    )

  const [scrollPercentage, setScrollPercentage] = useState(0)

  const onScroll: TextInputProps['onScroll'] = React.useCallback(
    (e: NativeSyntheticEvent<TextInputScrollEventData>) => {
      const { contentOffset } = e.nativeEvent
      const screenHeight = inputHeight
      const totalHeight = contentSizeHeight

      const percentage = (contentOffset.y / (totalHeight - screenHeight)) * 100
      setScrollPercentage(Math.max(Math.min(percentage, 84), 4)) // add a small padding to the top and bottom
    },
    [contentSizeHeight, inputHeight],
  )

  const ScrollIndicator = (
    <View style={[styles.scrollIndicator, { top: `${scrollPercentage}%` }]} />
  )

  if (isIOS) {
    // ios has its own scroll indicator
    return {
      inputProps: {},
      ScrollIndicator: null,
    }
  }

  return {
    inputProps: {
      onLayout,
      onContentSizeChange,
      onScroll,
    },
    ScrollIndicator:
      contentSizeHeight > inputHeight + 20 ? ScrollIndicator : null,
  }
}

const styles = StyleSheet.create({
  scrollIndicator: {
    backgroundColor: colors.keet_grey_300,
    borderRadius: INDICATOR_WIDTH / 2,
    height: INDICATOR_HEIGHT,
    position: 'absolute',
    right: 0,
    top: 0,
    width: INDICATOR_WIDTH,
  },
})
