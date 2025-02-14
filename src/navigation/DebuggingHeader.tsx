/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-native/no-color-literals */
import { StyleSheet, Text, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { navigate, SCREEN_DEBUGGING } from 'lib/navigation'

export default () => {
  const styles = getStyles()

  return (
    <View style={styles.root}>
      <Text onPress={() => navigate(SCREEN_DEBUGGING)}>
        Hypertrace is running
      </Text>
    </View>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    root: {
      alignItems: 'center',
      backgroundColor: 'red',
      height: 50,
      paddingTop: 20,
    },
  })
  return styles
})
