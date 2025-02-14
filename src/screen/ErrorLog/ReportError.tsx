import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, { UI_SIZE_6, UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import useFeedback, { FEEDBACK_TYPES } from 'lib/hooks/useFeedback'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { ErrorType } from './ErrorLog'
import { getErrorLogText } from './ErrorLog.helpers'

const ReportError = ({
  route,
}: {
  route: { params: { error: ErrorType } }
}) => {
  const theme = useTheme()
  const strings = useStrings()
  const styles = getStyles()

  const [value, setValue] = useState('')
  const { loading, onPressSubmit } = useFeedback({
    defaultFeedbackType: FEEDBACK_TYPES.bug,
  })

  const errorDetails = useMemo(
    () => getErrorLogText(route?.params?.error || {}),
    [route?.params?.error],
  )

  const handleChangeText = useCallback((text: string) => setValue(text), [])

  const handleSubmit = useCallback(async () => {
    const feedback = errorDetails + '\n' + value
    await onPressSubmit(feedback)
    back()
  }, [errorDetails, onPressSubmit, value])

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.errorLog.reportBug} />
      <ScrollView style={[s.container, styles.contentContainer]}>
        <Text style={[theme.text.body, styles.desc]}>
          {strings.errorLog.reportDesc}
        </Text>
        <Text
          style={[theme.text.replyBold, theme.text.greyText, styles.details]}
        >
          {strings.errorLog.details}
        </Text>
        <ScrollView style={styles.errorContainer}>
          <Text style={[theme.text.body, styles.errorDetail]}>
            {errorDetails}
          </Text>
        </ScrollView>
        <Text
          style={[theme.text.replyBold, theme.text.greyText, styles.details]}
        >
          {strings.errorLog.additionalComment}
        </Text>
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={strings.errorLog.commentPlaceholder}
          style={[styles.errorContainer, theme.text.body]}
          multiline
        />
        <View style={styles.separator} />
        <TextButton
          type={TextButtonType.primary}
          text={strings.common.submit}
          onPress={handleSubmit}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default ReportError

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    contentContainer: {
      padding: theme.spacing.normal,
    },
    desc: {
      fontSize: 14,
      marginBottom: UI_SIZE_16,
    },
    details: {
      fontSize: 12,
      marginBottom: UI_SIZE_6,
    },
    errorContainer: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_8,
      height: 200,
      marginBottom: UI_SIZE_16,
      padding: UI_SIZE_16,
    },
    errorDetail: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: UI_SIZE_8,
    },
    separator: {
      marginBottom: 50,
    },
  })

  return styles
})
