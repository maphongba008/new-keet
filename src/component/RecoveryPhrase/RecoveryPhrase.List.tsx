import { memo, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { wordsToPhrase } from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { showInfoNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

interface RecoveryPhraseI {
  seedPhrase: any
  title?: string
  buttonText?: string
  onClickSubmit: () => void
}

const RecoveryPhraseList = memo(
  ({ seedPhrase, title, buttonText, onClickSubmit }: RecoveryPhraseI) => {
    const strings = useStrings()
    const styles = getStyles()
    const theme = useTheme()

    const handleCopyPress = useCallback(async () => {
      await Clipboard.setStringAsync(wordsToPhrase(seedPhrase))
      showInfoNotifier(strings.downloads.textCopied)
    }, [strings.downloads.textCopied, seedPhrase])

    return (
      <View style={styles.root}>
        <ScrollView style={s.container}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          <View style={styles.phraseContainer}>
            {seedPhrase.map((phrase: any) => (
              <View key={phrase.index} style={styles.wordBox}>
                <Text style={styles.wordText}>{`${phrase.index + 1}. ${
                  phrase.value
                }`}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleCopyPress}
            style={styles.copyButtonContainer}
            accessible={true}
            accessibilityLabel={
              appiumTestProps(APPIUM_IDs.create_identity_copy_phrase_btn)
                ?.accessibilityLabel
            }
          >
            <SvgIcon
              name="copy"
              width={UI_SIZE_20}
              height={UI_SIZE_20}
              color={theme.color.blue_400}
            />
            <Text style={styles.copyButtonText}>
              {strings.syncDevice.copyPhrase}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <TextButton
          text={buttonText || strings.syncDevice.continue}
          type={TextButtonType.primary}
          onPress={onClickSubmit}
          {...appiumTestProps(APPIUM_IDs.create_identity_setup_continue_btn)}
        />
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    copyButtonContainer: {
      ...s.row,
      ...s.centeredLayout,
      gap: UI_SIZE_8,
      marginTop: UI_SIZE_24,
    },
    copyButtonText: {
      ...theme.text.body,
      color: theme.color.blue_400,
    },
    phraseContainer: {
      ...s.row,
      ...s.wrapFlex,
      ...s.justifyCenter,
      gap: UI_SIZE_12,
      marginTop: UI_SIZE_32,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    title: {
      ...theme.text.title,
    },
    wordBox: {
      ...s.centeredLayout,
      backgroundColor: colors.keet_grey_800,
      borderRadius: theme.border.radiusLarge,
      padding: UI_SIZE_10,
    },
    wordText: {
      ...theme.text.body,
    },
  })
  return styles
})

export default RecoveryPhraseList
