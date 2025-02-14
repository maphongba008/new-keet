import React, { useCallback, useReducer } from 'react'
import { StyleSheet, View } from 'react-native'
import _isEmpty from 'lodash/isEmpty'

import { createThemedStylesheet } from 'component/theme'

import { EmojiBar } from './components/EmojiBar'
import EmojiSheet, { EmojiData } from './components/EmojiSheet'
import { closeBottomSheet } from '../../AppBottomSheet.Store'
import { OptionsButtonList } from '../components/OptionsButtonList'
import { OptionSheetProps } from '../OptionsSheet'

export interface ChatEventOptionsSheetProp extends OptionSheetProps {
  onSelectEmoji: (e: EmojiData) => void
  isSkipToEmojiSheet: boolean
}
const ChatEventOptionsSheet = (props: ChatEventOptionsSheetProp) => {
  const { options = [], onSelectEmoji, isSkipToEmojiSheet } = props
  const styles = getStyles()
  const [isSelectingMoreEmoji, toggleSelectingMoreEmoji] = useReducer(
    (value) => !value,
    isSkipToEmojiSheet,
  )

  const onPickEmoji = useCallback(
    (e: EmojiData) => {
      closeBottomSheet()
      onSelectEmoji(e)
    },
    [onSelectEmoji],
  )

  return (
    <View style={styles.buttonContainer}>
      {isSelectingMoreEmoji ? (
        <EmojiSheet
          onBack={toggleSelectingMoreEmoji}
          onSelectEmoji={onPickEmoji}
          isSkipToEmojiSheet={isSkipToEmojiSheet}
        />
      ) : (
        <>
          <EmojiBar
            {...{ onPickEmoji, onPressMoreEmoji: toggleSelectingMoreEmoji }}
            isLast={_isEmpty(options)}
          />
          <OptionsButtonList options={options} />
        </>
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      backgroundColor: theme.background.bg_2,
    },
  })
  return styles
})

export default ChatEventOptionsSheet
