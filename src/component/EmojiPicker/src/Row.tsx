import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import { EmojiCustomPng } from 'component/EmojiRive'
import { colors, createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'

interface CellProps {
  emoji: EmojiData
  colSize: number
  onPress: () => void
}

const Cell = memo(({ emoji, colSize, onPress }: CellProps) => {
  const styles = getStyles()
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[
        styles.touchable,
        {
          width: colSize,
          height: colSize,
        },
      ]}
      onPress={onPress}
    >
      {emoji.urlRiv ? (
        <EmojiCustomPng
          shortCode={emoji.shortCodes[0]}
          style={styles.customEmojiPng}
        />
      ) : (
        <Text style={{ color: colors.white_snow, fontSize: colSize - 15 }}>
          {emoji.emoji}
        </Text>
      )}
    </TouchableOpacity>
  )
}, isEqual)

const RowItem = memo(
  ({
    emoji,
    selectEmoji,
    colSize,
  }: {
    emoji: EmojiData
    selectEmoji: (emoji: EmojiData) => void
    colSize: number
  }) => {
    const onPress = useCallback(
      () => [selectEmoji(emoji)],
      [emoji, selectEmoji],
    )
    return (
      <Cell
        key={emoji.shortCodes[0]}
        emoji={emoji}
        onPress={onPress}
        colSize={colSize}
      />
    )
  },
  isEqual,
)

interface RowProps {
  rowItems: EmojiData[]
  colSize: number
  selectEmoji: (emoji: EmojiData) => void
}
const Row = memo(({ rowItems, colSize, selectEmoji }: RowProps) => {
  return (
    <View style={s.row}>
      {rowItems.map((emoji) => (
        <RowItem
          key={emoji.shortCodes[0]}
          emoji={emoji}
          selectEmoji={selectEmoji}
          colSize={colSize}
        />
      ))}
    </View>
  )
}, isEqual)

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    customEmojiPng: { height: 35, width: 35 },
    touchable: {
      ...s.centeredLayout,
    },
  })
  return styles
})

export default Row
