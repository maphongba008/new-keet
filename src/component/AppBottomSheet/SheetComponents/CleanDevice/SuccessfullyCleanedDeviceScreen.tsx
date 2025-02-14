import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import { colors, createThemedStylesheet } from 'component/theme'
import {
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { APP_ROOT, navigate } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

export const SuccessfullyCleanedDeviceScreen = () => {
  const styles = getStyles()
  const strings = useStrings()

  const onPressFinish = useCallback(() => {
    navigate(APP_ROOT)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.cleanDevice.dataCleared}</Text>
      <Text style={styles.text}>{strings.cleanDevice.dataClearedDesc}</Text>

      <TextButton
        text={strings.cleanDevice.finish}
        onPress={onPressFinish}
        type={TextButtonType.primary}
        style={styles.button}
      />
    </View>
  )
}

export default SuccessfullyCleanedDeviceScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      marginBottom: UI_SIZE_32,
      marginTop: 'auto',
    },
    container: {
      alignContent: 'center',
      backgroundColor: theme.color.bg5,
      flex: 1,
      justifyContent: 'center',
      padding: UI_SIZE_16,
      textAlign: 'center',
    },
    text: {
      color: colors.white_snow,
      fontSize: UI_SIZE_16,
      textAlign: 'center',
    },
    title: {
      ...theme.text.title,
      fontSize: UI_SIZE_24,
      marginBottom: UI_SIZE_12,
      marginTop: 'auto',
      textAlign: 'center',
    },
  })
  return styles
})
