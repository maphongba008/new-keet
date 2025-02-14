import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { getEmojiData } from '@holepunchto/emojis'

import { ButtonBase } from 'component/Button'
import { EmojiCustomPng } from 'component/EmojiRive'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_32 } from 'lib/commonStyles'
import useStateDeepEqual from 'lib/hooks/useStateDeepEqual'
import {
  getStorageEmojiRecent,
  getStorageEmojiSkinColor,
  setStorageEmojiRecent,
} from 'lib/localStorage'

import { EmojiData, EmojiDataSuperset } from './EmojiSheet'

type EmojiProps = {
  onPickEmoji: (e: EmojiData) => void
  onPressMoreEmoji: () => void
  isLast: boolean
}

const EmojiButton = memo(
  ({
    emoji,
    onPress,
  }: {
    emoji: EmojiData
    onPress: (emoji: EmojiData) => void
  }) => {
    const styles = getStyles()
    const onPressBtn = useCallback(() => {
      onPress(emoji)
    }, [emoji, onPress])
    return (
      <ButtonBase style={styles.buttonBase} onPress={onPressBtn}>
        {emoji.urlRiv ? (
          <EmojiCustomPng
            shortCode={emoji.shortCodes[0]}
            style={styles.customEmojiPng}
          />
        ) : (
          <Text style={styles.emoji}>{emoji.emoji}</Text>
        )}
      </ButtonBase>
    )
  },
)

export const EmojiBar = ({
  onPickEmoji,
  onPressMoreEmoji,
  isLast,
}: EmojiProps) => {
  const styles = getStyles()
  const defaultEmoji = useDefaultEmoji()

  const [recentEmojis, setRecentEmojis] = useStateDeepEqual<EmojiData[]>([])
  const displayEmoji = useMemo(
    () =>
      recentEmojis
        .concat(defaultEmoji)
        // remove duplicate
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.emoji === value.emoji),
        )
        .slice(0, 4),
    [defaultEmoji, recentEmojis],
  )

  useEffect(() => {
    const _recentEmojis = getStorageEmojiRecent()
    setRecentEmojis(_recentEmojis)
  }, [setRecentEmojis])

  const onPress = useCallback(
    (emoji: EmojiData) => {
      // Add recent emoji to the front, then remove duplicate
      let tempRecentEmojis = [...recentEmojis]
      tempRecentEmojis.unshift(emoji)
      tempRecentEmojis = tempRecentEmojis.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.emoji === value.emoji),
      )
      setRecentEmojis(tempRecentEmojis)
      setStorageEmojiRecent(tempRecentEmojis)
      onPickEmoji(emoji)
    },
    [onPickEmoji, recentEmojis, setRecentEmojis],
  )

  return (
    <View style={[styles.emojiContainer, isLast && styles.noBorderBottom]}>
      {displayEmoji.map((emoji) => {
        return <EmojiButton emoji={emoji} key={emoji.emoji} onPress={onPress} />
      })}
      <ButtonBase style={styles.buttonBase} onPress={onPressMoreEmoji}>
        <SvgIcon
          name="addCircle"
          color={colors.white_snow}
          width={UI_SIZE_32}
          height={UI_SIZE_32}
        />
      </ButtonBase>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonBase: {
      ...s.container,
      ...s.fullHeight,
      ...s.centeredLayout,
    },
    customEmojiPng: { height: 25, width: 25 },
    emoji: {
      fontSize: 28,
    },
    emojiContainer: {
      ...s.centerAlignedRow,
      ...s.flexSpaceAround,
      backgroundColor: theme.background.bg_2,
      borderBottomColor: theme.color.grey_600,
      borderBottomWidth: theme.border.width,
      height: theme.button.height,
    },
    noBorderBottom: {
      borderBottomWidth: 0,
    },
  })
  return styles
})

const useDefaultEmoji = () => {
  const [defaultEmoji, setDefaultEmoji] = useState<EmojiDataSuperset[]>([
    getEmojiData('👍️'),
    getEmojiData('❤️'),
    getEmojiData('🔥'),
    getEmojiData('🍐'),
  ])

  useEffect(() => {
    const skin = getStorageEmojiSkinColor()
    if (skin > 0) {
      setDefaultEmoji((prevEmojis) =>
        prevEmojis.map((obj) => {
          if (obj.skins && obj.skins.length >= skin) {
            return obj.skins[skin - 1]
          }
          return obj
        }),
      )
    }
  }, [])

  return defaultEmoji
}
