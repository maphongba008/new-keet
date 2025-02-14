import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_12, UI_SIZE_14 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export default () => {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()

  return (
    <View style={[s.row, s.alignItemsCenter]}>
      <SvgIcon
        name="eye"
        color={theme.text.body.color}
        width={UI_SIZE_12}
        height={UI_SIZE_12}
        style={styles.icon}
      />
      <Text style={styles.text}>{strings.networkStatus.tap}</Text>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    icon: {
      marginRight: theme.spacing.standard / 2,
    },
    text: {
      ...theme.text.body,
      alignSelf: 'flex-start',
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
