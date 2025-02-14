import React, { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import isEqual from 'react-fast-compare'
import { TouchableOpacity } from 'react-native-gesture-handler'

import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, getTheme } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_24,
  UI_SIZE_44,
} from 'lib/commonStyles'

import { reactionHitSlop, useReactionBackground } from './SingleReaction'

const AddReaction = memo(
  ({
    onPress,
    isMineEvent,
  }: {
    onPress: ({ isSkipToEmojiSheet }: { isSkipToEmojiSheet: boolean }) => void
    isMineEvent?: boolean
  }) => {
    const styles = getStyles()
    const theme = getTheme()

    const onPressCallback = useCallback(() => {
      onPress({ isSkipToEmojiSheet: true })
    }, [onPress])

    const backgroundColor = useReactionBackground(false, isMineEvent)

    return (
      <TouchableOpacity
        style={[styles.reaction, { backgroundColor }]}
        onPress={onPressCallback}
        hitSlop={reactionHitSlop}
        disallowInterruption
      >
        <SvgIcon
          name="emojiAdd"
          width={15}
          height={15}
          color={theme.color.grey_200}
        />
      </TouchableOpacity>
    )
  },
  isEqual,
)

export default AddReaction

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
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
