import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_18,
} from 'lib/commonStyles'
import { timestampToTimeString } from 'lib/date'
import { navigate, SCREEN_ERROR_LOG_DETAILS } from 'lib/navigation'

import { ErrorType } from './ErrorLog'

const ErrorLogItem = ({ error }: { error: ErrorType }) => {
  const theme = useTheme()
  const styles = getStyles()

  const handleErrorDetails = useCallback(() => {
    navigate(SCREEN_ERROR_LOG_DETAILS, { error })
  }, [error])

  return (
    <TouchableOpacity
      style={[styles.errorColor, s.row, s.alignItemsCenter, styles.container]}
      onPress={handleErrorDetails}
    >
      {error?.grouped > 1 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorCount}>{error?.grouped}</Text>
        </View>
      )}
      <Text
        style={[theme.text.body, s.container, styles.errorTitle]}
        numberOfLines={1}
      >
        {error?.message}
      </Text>
      <Text style={[theme.text.greyText, styles.errorTime]}>
        {timestampToTimeString(error?.timestamp)}
      </Text>
      <SvgIcon
        name="chevronRight"
        color={colors.white_snow}
        width={UI_SIZE_18}
        height={UI_SIZE_18}
      />
    </TouchableOpacity>
  )
}

export default ErrorLogItem

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: UI_SIZE_8,
    },
    errorColor: {
      borderLeftColor: theme.color.red_600,
      borderLeftWidth: UI_SIZE_6,
      paddingLeft: UI_SIZE_8,
    },
    errorContainer: {
      backgroundColor: colors.keet_grey_200,
      borderRadius: UI_SIZE_16,
      marginRight: UI_SIZE_4,
      padding: 3,
      paddingHorizontal: 7,
    },
    errorCount: {
      fontSize: 12,
    },
    errorTime: {
      fontSize: 12,
      marginRight: UI_SIZE_8,
    },
    errorTitle: {
      fontSize: 14,
      marginRight: UI_SIZE_4,
      paddingVertical: UI_SIZE_12,
    },
  })

  return styles
})
