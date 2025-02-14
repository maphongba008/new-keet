import React, { useCallback, useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, { UI_SIZE_6, UI_SIZE_8, UI_SIZE_18 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { timestampToTimeString } from 'lib/date'
import { navigate, SCREEN_ERROR_LOG_REPORT } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { ErrorType } from './ErrorLog'
import { getErrorLogText } from './ErrorLog.helpers'

const ErrorDetails = ({
  route,
}: {
  route: { params: { error: ErrorType } }
}) => {
  const theme = useTheme()
  const { errorLog: strings } = useStrings()
  const styles = getStyles()

  const error: ErrorType = useMemo(
    () => route?.params?.error || {},
    [route?.params?.error],
  )

  const handleReport = useCallback(() => {
    navigate(SCREEN_ERROR_LOG_REPORT, { error })
  }, [error])

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(getErrorLogText(error))
  }, [error])

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.errorDetails} />
      <View style={[s.container, styles.contentContainer]}>
        <View style={[styles.errorColor, s.row, styles.container]}>
          <Text style={[theme.text.body, s.container, styles.errorTitle]}>
            {error?.message}
          </Text>
        </View>
        {error?.roomTitle && (
          <Text style={[theme.text.body, styles.details]}>
            {strings.room}
            {error?.roomTitle}
          </Text>
        )}
        <Text style={[theme.text.body, styles.details]}>
          {strings.time}
          {timestampToTimeString(error?.timestamp)}
        </Text>
        <ScrollView style={styles.errorContainer}>
          <Text style={[theme.text.body, styles.errorDetail]}>
            {error?.stack}
          </Text>
        </ScrollView>
        <View style={s.container} />
        <View style={styles.buttonContainer}>
          <TextButton
            type={TextButtonType.outline}
            text={strings.report}
            onPress={handleReport}
          />
          <TextButton
            type={TextButtonType.outline}
            text={strings.copyDetails}
            onPress={handleCopy}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ErrorDetails

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      gap: UI_SIZE_18,
    },
    container: {
      marginBottom: UI_SIZE_8,
    },
    contentContainer: {
      padding: theme.spacing.normal,
    },
    details: {
      fontSize: 14,
      marginBottom: UI_SIZE_8,
    },
    errorColor: {
      borderLeftColor: theme.color.red_600,
      borderLeftWidth: UI_SIZE_6,
      paddingLeft: UI_SIZE_8,
    },
    errorContainer: {
      marginVertical: UI_SIZE_8,
    },
    errorDetail: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: UI_SIZE_8,
    },
    errorTitle: {
      fontSize: 14,
      paddingVertical: UI_SIZE_8,
    },
  })

  return styles
})
