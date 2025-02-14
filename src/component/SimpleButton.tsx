import React from 'react'
import { StyleSheet, Text, type ViewStyle } from 'react-native'

import { ButtonBase } from 'component/Button'
import commonStyles from 'lib/commonStyles'

import { createThemedStylesheet } from './theme'

interface SimpleButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
}

export const SimpleButton = (props: SimpleButtonProps) => {
  const styles = getStyles()

  return (
    <ButtonBase
      onPress={props.onPress}
      style={[props.style, styles.rootSimple]}
    >
      <Text style={styles.text}>{props.title}</Text>
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    rootSimple: {
      ...commonStyles.centeredLayout,
      borderColor: theme.button.borderColor,
      borderRadius: 12,
      borderWidth: 1,
      height: 5 + 44 + 4,
    },
    text: {
      ...theme.text.body,
    },
  })
  return styles
})
