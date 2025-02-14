import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { MarkDown } from 'component/MarkDown'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, gradient } from 'component/theme'
import s, {
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_36,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const RecoveryPhraseAccessGuide = memo(() => {
  const strings = useStrings()
  const styles = getStyles()

  return (
    <LinearGradient style={styles.container} {...gradient.keet_tooltip_gray}>
      <View style={s.rowStartCenter}>
        <LinearGradient
          style={styles.checkIconContainer}
          {...gradient.keet_gradient_brightBlue20}
        >
          <SvgIcon name="shieldFilled" width={UI_SIZE_24} height={UI_SIZE_24} />
        </LinearGradient>
        <Text style={styles.title}>{strings.syncDevice.accessGuide.title}</Text>
      </View>
      <MarkDown md={strings.syncDevice.accessGuide.path} />
    </LinearGradient>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    checkIconContainer: {
      ...s.centeredLayout,
      borderRadius: UI_SIZE_8,
      height: UI_SIZE_36,
      width: UI_SIZE_36,
    },
    container: {
      borderRadius: UI_SIZE_16,
      gap: UI_SIZE_8,
      padding: UI_SIZE_16,
    },
    title: {
      ...theme.text.title,
      flex: 1,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})

export default RecoveryPhraseAccessGuide
