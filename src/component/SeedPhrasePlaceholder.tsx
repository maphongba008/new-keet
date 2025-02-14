import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import s, {
  TRANSPARENT,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
} from 'lib/commonStyles'

export const SeedPhrasePlaceholder = memo(({ words }: any) => {
  const styles = getStyles()

  return (
    <View style={styles.placeholderContainer}>
      {words.map((word: any) => (
        <View key={word.index} style={styles.wordBox}>
          <Text style={styles.wordText}>{word.value}</Text>
        </View>
      ))}
    </View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    placeholderContainer: {
      ...s.row,
      ...s.justifyCenter,
      ...s.wrapFlex,
      backgroundColor: theme.color.grey_700,
      borderRadius: theme.border.radiusNormal,
      columnGap: UI_SIZE_4,
      padding: UI_SIZE_16,
      rowGap: UI_SIZE_8,
    },
    wordBox: {
      ...s.centeredLayout,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusLarge,
      height: 42,
      paddingHorizontal: UI_SIZE_8,
    },
    wordText: {
      ...theme.text.body,
      color: TRANSPARENT,
    },
  })
  return styles
})
