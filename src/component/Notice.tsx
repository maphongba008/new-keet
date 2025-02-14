import React, { useCallback } from 'react'
import { StyleSheet, Text, ViewStyle } from 'react-native'

import s, { UI_SIZE_4, UI_SIZE_14, UI_SIZE_18 } from 'lib/commonStyles'

import { ButtonBase } from './Button'
import SvgIcon from './SvgIcon'
import { createThemedStylesheet, useTheme } from './theme'

function Notice({
  label,
  styleProp,
}: {
  label: string
  styleProp?: ViewStyle
}) {
  const theme = useTheme()
  const styles = getStyles()

  const handlePress = useCallback(() => {
    // TODO: open bottom sheet/modal/external link
  }, [])

  return (
    <ButtonBase
      style={[s.row, s.alignSelfEnd, styleProp]}
      onPress={handlePress}
    >
      <SvgIcon
        name="info"
        width={UI_SIZE_18}
        height={UI_SIZE_18}
        color={theme.color.blue_400}
      />
      <Text style={styles.infoLabel}>{label}</Text>
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    infoLabel: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_4,
    },
  })
  return styles
})

export default Notice
