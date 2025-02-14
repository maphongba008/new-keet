import React, { useCallback, useMemo } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'

import { getAllEmojisData } from '@holepunchto/emojis'

import s, { UI_SIZE_4, UI_SIZE_8 } from 'lib/commonStyles'

import { EmojiData } from './AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import { EmojiRive } from './EmojiRive'
import { createThemedStylesheet } from './theme'

const EmojiAutocompleteItem: React.FC<{
  item: EmojiData
  complete: (shortcode: string) => void
}> = ({ item, complete }) => {
  const styles = getStyles()
  const onPress = useCallback(
    () => complete(item.shortCodes[0]),
    [item, complete],
  )

  return (
    <Pressable
      pointerEvents="box-only"
      onPress={onPress}
      style={[s.centerAlignedRow, styles.listItem]}
    >
      {item.url ? (
        <View style={styles.riveContainer}>
          <EmojiRive
            shortCode={item.shortCodes[0]}
            isDisableTouch
            style={styles.riveImage}
          />
        </View>
      ) : (
        <Text style={styles.emoji}>{item.emoji}</Text>
      )}
      <Text style={styles.text}>:{item.shortCodes[0]}:</Text>
    </Pressable>
  )
}

export const EmojiAutocomplete: React.FC<{
  prefix: string
  complete: (shortcode: string) => void
  xOffset?: number
  yOffset?: number
}> = ({ prefix, complete, xOffset, yOffset }) => {
  const styles = getStyles()
  const suggestions = useMemo(
    () =>
      getAllEmojisData().filter((data) =>
        data.shortCodes[0].startsWith(prefix),
      ),
    [prefix],
  )

  const renderItem = useCallback(
    ({ item }: { item: EmojiData }) => {
      return (
        <EmojiAutocompleteItem
          key={item.shortCodes[0]}
          item={item}
          complete={complete}
        />
      )
    },
    [complete],
  )

  return (
    <Animated.View style={[styles.container, { top: yOffset, left: xOffset }]}>
      <FlatList
        data={suggestions}
        contentContainerStyle={styles.flatlist}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
      />
    </Animated.View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.color.grey_700,
      borderColor: theme.color.bg4,
      borderRadius: theme.border.radiusNormal * 2,
      borderWidth: 1,
      maxHeight: 200,
      overflow: 'hidden',
      position: 'absolute',
      width: '100%',
    },
    emoji: {
      fontSize: 20,
    },
    flatlist: {
      padding: UI_SIZE_8,
    },
    listItem: {
      marginTop: UI_SIZE_4,
    },
    riveContainer: {
      width: 24,
    },
    riveImage: {
      height: 24,
      width: 24,
    },
    text: {
      ...theme.text.body,
      paddingLeft: theme.spacing.standard / 2,
    },
  })
  return styles
})
