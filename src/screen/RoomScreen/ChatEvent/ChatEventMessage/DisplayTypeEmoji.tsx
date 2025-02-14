import React, { memo, useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { getEmojiData } from '@holepunchto/emojis'

import { EmojiCustomPng, EmojiRive } from 'component/EmojiRive'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_6,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_40,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { isAndroid } from 'lib/platform'

import { DisplayTypeContext } from './DisplayTypeContext'

interface DisplayTypeEmojiProps {
  code: string
}

const DisplayTypeEmoji = memo(({ code }: DisplayTypeEmojiProps) => {
  const { textStyle, forPreview, isSingleEmoji } =
    useContext(DisplayTypeContext)
  const styles = getStyles()
  const theme = useTheme()
  const { urlRiv, emoji, shortCodes } = getEmojiData(code) || {}
  const singleEmoji = isSingleEmoji && !forPreview

  if (urlRiv) {
    if (forPreview && isAndroid) {
      return (
        <EmojiCustomPng
          shortCode={shortCodes?.[0]}
          style={styles.previewEmoji}
        />
      )
    }

    return (
      <View
        style={[
          s.row,
          s.centeredLayout,
          !forPreview && styles.emojiContainer,
          singleEmoji && styles.singleEmojiRivContainer,
        ]}
      >
        <EmojiRive
          shortCode={shortCodes?.[0]}
          isDisableTouch
          style={[
            forPreview ? styles.previewEmoji : styles.emoji,
            singleEmoji ? styles.singleEmojiRiv : {},
          ]}
        />
      </View>
    )
  }

  return (
    <Text
      style={[theme.text.body, textStyle, singleEmoji && styles.singleEmoji]}
    >
      {emoji}
    </Text>
  )
})

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    emoji: {
      height: 25,
      marginRight: 3,
      marginTop: UI_SIZE_6,
      width: UI_SIZE_20,
    },
    emojiContainer: {
      maxHeight: UI_SIZE_20,
      maxWidth: 25,
    },
    previewEmoji: {
      height: UI_SIZE_16,
      marginTop: UI_SIZE_6,
      width: UI_SIZE_16,
    },
    singleEmoji: {
      fontSize: 38,
      lineHeight: UI_SIZE_48,
      writingDirection: DIRECTION_CODE,
    },
    singleEmojiRiv: {
      height: UI_SIZE_48,
      width: UI_SIZE_48,
    },
    singleEmojiRivContainer: {
      maxHeight: UI_SIZE_48,
      maxWidth: UI_SIZE_40,
    },
  })
  return styles
})

export default DisplayTypeEmoji
