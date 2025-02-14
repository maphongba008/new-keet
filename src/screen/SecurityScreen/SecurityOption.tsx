import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_16, UI_SIZE_48 } from 'lib/commonStyles'

type SecurityOptionProps = {
  text?: string
  action?: () => void | undefined
  visible?: boolean
  textStyle?: any
  right?: any
}

export const SecurityOption = ({
  text,
  action,
  visible = true,
  right,
  textStyle,
}: SecurityOptionProps) => {
  const styles = getStyles()

  if (!visible) return null

  return (
    <TouchableOpacity style={styles.innerContainer} onPress={action}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
      {!!right && right}
      <SvgIcon
        name="chevronRight"
        width={UI_SIZE_16}
        height={UI_SIZE_16}
        color={colors.white_snow}
      />
    </TouchableOpacity>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    innerContainer: {
      ...s.row,
      ...s.flexSpaceBetween,
      alignItems: 'center',
      height: UI_SIZE_48,
    },
    text: {
      ...theme.text.body,
      flex: 1,
    },
  })
  return styles
})
