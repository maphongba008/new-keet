import React, { useMemo } from 'react'
import { StyleSheet, Text, TextStyle, View } from 'react-native'

import { getEmojiData } from '@holepunchto/emojis'

import { UI_SIZE_4, UI_SIZE_6 } from 'lib/commonStyles'

import { EmojiRive } from './EmojiRive'
import { createThemedStylesheet } from './theme'

export const RoomTitle: React.FC<{
  fontSize: number
  title: string
  style?: TextStyle
}> = ({ fontSize, title, style }) => {
  const styles = getStyles(fontSize)
  const processed = useMemo(
    () =>
      title.split(/:([a-zA-Z0-9_\-+]+):/g).map((string, index) => {
        if (index % 2 === 0) {
          return string
        }
        const data = getEmojiData(string)
        if (!data) return `:${string}:`
        if (data.url) {
          return (
            <View style={styles.riveContainer}>
              <EmojiRive
                shortCode={string}
                isDisableTouch
                style={styles.riveImage}
              />
            </View>
          )
        }
        const { emoji, alt } = data
        return alt || emoji
      }),
    [styles, title],
  )
  return (
    <Text style={[styles.title, style]} numberOfLines={1} ellipsizeMode="tail">
      {processed}
    </Text>
  )
}

const getStyles = (fontSize = 15) =>
  createThemedStylesheet((theme) => {
    const styles = StyleSheet.create({
      riveContainer: {
        width: fontSize + UI_SIZE_4,
      },
      riveImage: {
        height: fontSize + UI_SIZE_4,
        width: fontSize + UI_SIZE_4,
      },
      title: {
        ...theme.text.title,
        fontFamily: theme.text.bodySemiBold.fontFamily,
        fontSize,
        lineHeight: fontSize + UI_SIZE_6,
      },
    })
    return styles
  })()
