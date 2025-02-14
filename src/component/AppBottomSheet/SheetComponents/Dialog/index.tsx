import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'

import { TextButton, TextButtonType } from '../../../Button'

interface Button {
  text: string
  onPress: () => void
  type?: TextButtonType
}

export interface DialogInterface {
  title?: string
  description?: string
  buttons: Button[]
}
const Dialog = ({ title, description, buttons }: DialogInterface) => {
  const styles = getStyles()
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
      {buttons.map(({ text, type, onPress }) => (
        <TextButton
          style={styles.button}
          key={text}
          text={text}
          onPress={onPress}
          type={type}
        />
      ))}
    </>
  )
}

export default memo(Dialog)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    body: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: 14,
      marginBottom: theme.spacing.standard,
    },
    button: {
      marginTop: UI_SIZE_16,
    },
    title: {
      ...theme.text.title,
      fontSize: UI_SIZE_20,
      marginBottom: theme.spacing.normal,
    },
  })
  return styles
})
