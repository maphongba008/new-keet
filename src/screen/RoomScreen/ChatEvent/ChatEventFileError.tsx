import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'

interface ChatEventFileErrorProps {
  name: string
}

export const ChatEventFileError = memo(({ name }: ChatEventFileErrorProps) => {
  const styles = getStyles()
  return (
    <View style={styles.placeholderMessage}>
      <Text style={styles.editedText} numberOfLines={1}>
        {name}
      </Text>
    </View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    editedText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 12,
      paddingHorizontal: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
    placeholderMessage: {
      ...s.centeredLayout,
      backgroundColor: theme.color.bg2,
      borderRadius: UI_SIZE_14,
      padding: theme.spacing.standard / 2,
      paddingVertical: UI_SIZE_16,
      rowGap: UI_SIZE_8,
    },
  })
  return styles
})
