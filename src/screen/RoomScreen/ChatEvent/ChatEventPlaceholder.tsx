import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_4, UI_SIZE_14, UI_SIZE_16, UI_SIZE_48 } from 'lib/commonStyles'

const ChatEventPlaceholder = memo(() => {
  const styles = getStyles()
  return <View style={styles.eventPlaceholder} />
}, isEqual)

export default memo(ChatEventPlaceholder)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    eventPlaceholder: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_14,
      height: UI_SIZE_48,
      marginHorizontal: UI_SIZE_16,
      marginVertical: UI_SIZE_4,
    },
  })
  return styles
})
