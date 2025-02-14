import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, Text } from 'react-native'
import isEqual from 'react-fast-compare'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { getEmojiData } from '@holepunchto/emojis'

import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import { EmojiRive } from 'component/EmojiRive'
import { createThemedStylesheet, getTheme } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_24,
  UI_SIZE_44,
} from 'lib/commonStyles'

interface SingleReactionType {
  text: string
  count: number
  isMineEvent?: boolean
  isMine: boolean
  onPress: (e: string) => void
  onLongPressEmoji: (e: string) => void
}

export const reactionHitSlop = {
  top: UI_SIZE_4,
  right: UI_SIZE_2,
  bottom: UI_SIZE_8,
  left: UI_SIZE_2,
}

export const useReactionBackground = (
  isMine: boolean,
  isMineEvent?: boolean,
) => {
  const theme = getTheme()
  const backgroundColor = useMemo(() => {
    if (isMine) {
      return theme.reactions.active
    }
    if (isMineEvent) {
      return theme.reactions.mine
    }
    return theme.reactions.other
  }, [
    isMine,
    isMineEvent,
    theme.reactions.active,
    theme.reactions.mine,
    theme.reactions.other,
  ])

  return backgroundColor
}

const SingleReaction = memo(
  ({
    text,
    count,
    isMine,
    isMineEvent,
    onPress,
    onLongPressEmoji,
  }: SingleReactionType) => {
    const styles = getStyles()

    const onPressEmoji = useCallback(() => {
      onPress(text)
    }, [text, onPress])

    const onLongPress = useCallback(() => {
      onLongPressEmoji(text)
    }, [onLongPressEmoji, text])

    const backgroundColor = useReactionBackground(isMine, isMineEvent)
    const emojiObj = getEmojiData(text)

    const renderItem = useCallback(
      (emoji: EmojiData) => {
        if (emoji?.url) {
          return (
            <EmojiRive
              shortCode={emoji.shortCodes[0]}
              isDisableTouch
              style={styles.customEmoji}
            />
          )
        } else {
          return <Text style={styles.emojiText}>{emoji?.emoji}</Text>
        }
      },
      [styles],
    )

    return (
      <TouchableOpacity
        style={[
          styles.reaction,
          {
            backgroundColor,
          },
        ]}
        onPress={onPressEmoji}
        onLongPress={onLongPress}
        hitSlop={reactionHitSlop}
        disallowInterruption
      >
        {renderItem(emojiObj)}
        <Text style={styles.emojiCount}>{count}</Text>
      </TouchableOpacity>
    )
  },
  isEqual,
)

export default SingleReaction

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    customEmoji: {
      height: 15,
      width: 15,
    },
    emojiCount: {
      marginLeft: UI_SIZE_4,
      ...theme.text.bodySemiBold,
      fontSize: 12,
    },
    emojiText: {
      ...theme.text.body,
      fontSize: 12,
    },
    reaction: {
      ...s.centerAlignedRow,
      ...s.justifyCenter,
      borderRadius: UI_SIZE_8,
      height: UI_SIZE_24 + UI_SIZE_4,
      minWidth: UI_SIZE_44,
      paddingHorizontal: UI_SIZE_4,
    },
  })
  return styles
})
