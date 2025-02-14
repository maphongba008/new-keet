/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler'

import {
  isControlWordIndex,
  resetBackupCreateCheckWords,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { navigate, SCREEN_IDENTITY_BACKUP_COMPLETE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

export interface SeedWord {
  index: number
  value: string
}

interface SeedPhraseVerificationI {
  title: string
  description: string
  loading: boolean
  checkWords: SeedWord[]
  success: boolean
  onSubmitFail: () => void
  onSubmitSuccess: () => void
}

const SeedPhraseVerification = memo(
  ({
    title,
    description,
    loading,
    checkWords,
    success,
    onSubmitFail,
    onSubmitSuccess,
  }: SeedPhraseVerificationI) => {
    const { syncDevice: strings } = useStrings()
    const styles = getStyles()
    const dispatch = useDispatch()

    const [selectedIndexes, setSelectedIndexes] = useState<any>([])
    const [tooltipWord, setTooltipWord] = useState<SeedWord | null>(null)
    const [tooltipMessage, setTooltipMessage] = useState<string>(
      strings.fifthWord,
    )

    const onWordClick = useCallback(
      (word: SeedWord) => {
        setSelectedIndexes((prev: any) => {
          if (prev.includes(word.index)) {
            // If the word is already selected, remove the tooltip and deselect
            setTooltipWord(null)
            return prev.filter((value: any) => value !== word.index)
          }

          // If selecting a new word and we already have 2 selected, prevent adding more
          if (prev.length >= 2) {
            return prev
          }

          // If selecting the first word, set the tooltip to "5th word"
          if (prev.length === 0) {
            setTooltipWord(word)
            setTooltipMessage(strings.fifthWord)
          }

          // If selecting the second word, set the tooltip to "12th word"
          if (prev.length === 1) {
            setTooltipWord(word)
            setTooltipMessage(strings.fifteenthWord)
          }

          return [...prev, word.index]
        })
      },
      [strings.fifteenthWord, strings.fifthWord],
    )

    const selectionComplete = selectedIndexes.length >= 2
    const selectionInvalid = !!selectedIndexes.find(
      (index: string) => !isControlWordIndex(index),
    )
    const failed = selectionComplete && selectionInvalid

    useEffect(() => {
      dispatch(resetBackupCreateCheckWords())
    }, [dispatch])

    const onSubmit = useCallback(() => {
      if (failed) {
        onSubmitFail()
      } else {
        onSubmitSuccess()
      }
    }, [failed, onSubmitFail, onSubmitSuccess])

    useEffect(() => {
      if (success) {
        navigate(SCREEN_IDENTITY_BACKUP_COMPLETE)
      }
    }, [success])

    const getWordStyle = useCallback(
      (index: any) => {
        if (!selectedIndexes?.includes(index)) {
          return {
            backgroundColor: colors.keet_grey_700,
            color: colors.white_snow,
          }
        }
        if (!selectionComplete || isControlWordIndex(index)) {
          return {
            backgroundColor: colors.indigo_700,
            color: colors.white_snow,
          }
        }
        return {
          backgroundColor: colors.red_400,
          color: colors.keet_almostBlack,
        }
      },
      [selectedIndexes, selectionComplete],
    )

    return (
      <View style={styles.root}>
        <ScrollView
          style={s.container}
          contentContainerStyle={styles.scrollView}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.phraseContainer}>
            {checkWords.map((word: any, index) => (
              <View key={word.index} style={styles.customTooltipWrapper}>
                <TouchableOpacity
                  // eslint-disable-next-line react/jsx-no-bind
                  onPress={() => onWordClick(word)}
                  accessible={true}
                  accessibilityLabel={`$ {
                    appiumTestProps(APPIUM_IDs.create_id_verification_word)
                      ?.accessibilityLabel
                  }_${index + 1}`}
                >
                  <View
                    style={[
                      styles.wordBox,
                      {
                        backgroundColor: getWordStyle(word.index)
                          ?.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.wordText,
                        {
                          color: getWordStyle(word.index)?.color,
                        },
                      ]}
                    >
                      {word.value}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {!!failed && (
            <Text style={styles.errorMessage}>{strings.errorWrongWords}</Text>
          )}
        </ScrollView>
        <TextButton
          text={failed ? strings.lookAtThePhraseAgain : strings.continue}
          type={TextButtonType.primary}
          onPress={onSubmit}
          disabled={!!loading || !selectionComplete}
          {...appiumTestProps(APPIUM_IDs.create_id_submit_verification)}
        />
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    customTooltipWrapper: {
      alignItems: 'center',
      position: 'relative',
    },
    description: {
      ...theme.text.body,
      color: theme.color.grey_100,
    },
    errorMessage: {
      ...theme.text.body,
      ...s.textAlignCenter,
      color: theme.color.red_400,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_8,
    },
    phraseContainer: {
      ...s.row,
      ...s.wrapFlex,
      ...s.justifyCenter,
      gap: UI_SIZE_12,
      marginTop: UI_SIZE_8,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    scrollView: {
      gap: UI_SIZE_16,
    },
    title: {
      ...theme.text.title,
    },
    wordBox: {
      ...s.centeredLayout,
      borderRadius: theme.border.radiusLarge,
      padding: UI_SIZE_10,
    },
    wordText: {
      ...theme.text.body,
    },
  })
  return styles
})

export default SeedPhraseVerification
