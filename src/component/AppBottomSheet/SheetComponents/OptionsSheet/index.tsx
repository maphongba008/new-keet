import React from 'react'
import { StyleSheet, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'

import {
  OptionsButtonList,
  OptionSheetOption,
} from '../components/OptionsButtonList'

export interface OptionSheetProps {
  options: OptionSheetOption[]
}

const OptionSheet = (props: OptionSheetProps) => {
  const { options = [] } = props
  const styles = getStyles()

  return (
    <View style={styles.buttonContainer}>
      <OptionsButtonList options={options} />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusLarge,
      overflow: 'hidden',
    },
  })
  return styles
})

export default OptionSheet
