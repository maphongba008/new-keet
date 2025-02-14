import React, { memo, useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { OptionButton, TextButton, TextButtonType } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import { CloseButton } from 'component/CloseButton'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_12,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_120,
} from 'lib/commonStyles'
import useFeedback from 'lib/hooks/useFeedback'
import { isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

const FEEDBACK_TYPES = {
  bug: 'Bug reporting',
  feature: 'Feature',
  suggestion: 'Suggestions',
}

export interface FeedbackFormSheetInterface {}

export default memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()

  const {
    text,
    setText,
    feedbackType,
    sendDeviceData,
    setSendDeviceData,
    canSubmit,
    loading,
    onPressBug,
    onPressFeature,
    onPressSuggestion,
    onPressSubmit: onFeedbackSubmit,
  } = useFeedback()

  const [inputFocused, setInputFocused] = useState<boolean>(false)

  const onPressClose = useCallback(() => {
    closeBottomSheet()
  }, [])

  const onInputFocus = useCallback(() => setInputFocused(true), [])
  const onInputBlur = useCallback(() => setInputFocused(false), [])

  const onPressSubmit = useCallback(() => {
    onFeedbackSubmit('')
  }, [onFeedbackSubmit])

  return (
    <>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{strings.feedback.title}</Text>
        <CloseButton
          onPress={onPressClose}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
      </View>

      <ScrollView>
        <Text style={styles.text}>{strings.feedback.type}</Text>
        <View style={styles.feedbackView}>
          <OptionButton
            text={strings.feedback.type_1}
            selected={feedbackType === FEEDBACK_TYPES.bug}
            onPress={onPressBug}
            style={styles.feedbackButton}
            textStyle={styles.feedbackText}
          />
          <OptionButton
            text={strings.feedback.type_2}
            selected={feedbackType === FEEDBACK_TYPES.feature}
            onPress={onPressFeature}
            style={styles.feedbackButton}
            textStyle={styles.feedbackText}
          />
          <OptionButton
            text={strings.feedback.type_3}
            selected={feedbackType === FEEDBACK_TYPES.suggestion}
            onPress={onPressSuggestion}
            style={styles.feedbackButton}
            textStyle={styles.feedbackText}
          />
        </View>
        <Text style={styles.text}>{strings.feedback.input}</Text>
        <BottomSheetTextInput
          returnKeyType="done"
          style={[
            styles.feedbackTextInput,
            inputFocused && styles.formInputFocused,
          ]}
          multiline
          placeholderTextColor={theme.text.placeholder.color}
          placeholder={strings.common.typeItHere}
          onChangeText={setText}
          defaultValue={text}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <LabeledCheckbox
          label={strings.feedback.collectDeviceData}
          onChange={setSendDeviceData}
          value={sendDeviceData}
        />
        <TextButton
          text={loading ? strings.common.loading : strings.common.submit}
          onPress={onPressSubmit}
          type={canSubmit ? TextButtonType.primary : TextButtonType.disabled}
          style={styles.actionBtn}
        />
      </ScrollView>
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      marginTop: UI_SIZE_24,
    },
    feedbackButton: {
      ...s.container,
      ...s.alignSelfStretch,
    },
    feedbackText: {
      fontSize: 14,
      writingDirection: DIRECTION_CODE,
    },
    feedbackTextInput: {
      ...theme.text.body,
      backgroundColor: theme.background.bg_2,
      borderColor: theme.border.color,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      height: UI_SIZE_120,
      marginBottom: UI_SIZE_24,
      marginTop: UI_SIZE_12,
      paddingHorizontal: theme.spacing.standard,
      paddingVertical: theme.spacing.standard / (isIOS ? 1 : 2),
      textAlignVertical: 'top',
      ...s.bidirectionalInput,
    },
    feedbackView: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_12,
      marginBottom: UI_SIZE_24,
      marginTop: UI_SIZE_12,
    },
    formInputFocused: {
      borderColor: theme.color.blue_400,
    },
    text: {
      ...theme.text.body,
      writingDirection: DIRECTION_CODE,
    },
    title: {
      ...s.container,
      ...theme.text.bodyBold,
      writingDirection: DIRECTION_CODE,
    },
    titleWrapper: {
      ...s.centerAlignedRow,
      marginBottom: theme.spacing.standard * 2,
    },
  })
  return styles
})
