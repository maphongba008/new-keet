import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import GestureContainer from 'component/GestureContainer'
import { MarkDown } from 'component/MarkDown'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  FONT_SIZE_600,
  NETWORK_WARNING,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { navigate, SCREEN_VIEW_RECOVERY_PHRASE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const RecoveryPhraseSettings = () => {
  const styles = getStyles()
  const theme = useTheme()
  const { settings } = useStrings()
  const recoveryStrings = settings.recoveryPhraseSettings

  const [checked, setChecked] = useState(false)

  const handleViewPhrase = useCallback(() => {
    navigate(SCREEN_VIEW_RECOVERY_PHRASE)
  }, [])

  return (
    <GestureContainer>
      <NavBar title={settings.privacyAndSecurity.recoveryPhraseSettings} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={[theme.text.body, styles.desc]}>
          {recoveryStrings.desc}
        </Text>
        <View style={[s.row, styles.warningBlock]}>
          <SvgIcon
            name="warning"
            width={20}
            height={20}
            color={NETWORK_WARNING}
          />
          <View style={[s.container, styles.warningTextContainer]}>
            <Text style={[theme.text.body, styles.warningText]}>
              {recoveryStrings.warningText}
            </Text>
            <MarkDown
              style={styles.markdown}
              md={recoveryStrings.warningTextList1}
            />
            <MarkDown
              style={styles.markdown}
              md={recoveryStrings.warningTextList2}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.scrollView}>
        <View style={s.container} />
        <LabeledCheckbox
          label={recoveryStrings.checkbox}
          onChange={setChecked}
          value={checked}
          style={s.justifyCenter}
          textStyle={[s.flex0, styles.checkboxText]}
        />
        <TextButton
          text={recoveryStrings.viewPhrase}
          type={TextButtonType.primary}
          onPress={handleViewPhrase}
          disabled={!checked}
        />
      </View>
    </GestureContainer>
  )
}

export default RecoveryPhraseSettings

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    checkboxText: {
      fontWeight: FONT_SIZE_600,
    },
    desc: {
      fontSize: UI_SIZE_16,
      lineHeight: UI_SIZE_24,
    },
    markdown: {
      paddingLeft: UI_SIZE_8,
    },
    scrollView: {
      flexGrow: 1,
      gap: UI_SIZE_16,
      padding: UI_SIZE_16,
    },
    warningBlock: {
      backgroundColor: theme.color.yellow_950,
      borderRadius: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    warningText: {
      marginBottom: UI_SIZE_4,
    },
    warningTextContainer: {
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})
