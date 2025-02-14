import React from 'react'
import { View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_12, UI_SIZE_16 } from 'lib/commonStyles'

import { SecurityOption } from './SecurityOption'

type SecurityOptionsListProps = {
  options: Array<{
    text: string
    action: () => void
    show: boolean
    textStyle?: any
  }>
}

export const SecurityOptionsList = ({ options }: SecurityOptionsListProps) => {
  const styles = getStyles()

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <SecurityOption
          key={index}
          text={option.text}
          action={option.action}
          textStyle={option.textStyle}
        />
      ))}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => ({
  container: {
    ...s.column,
    paddingHorizontal: UI_SIZE_16,
    backgroundColor: theme.background.bg_1,
    borderRadius: UI_SIZE_12,
  },
}))
