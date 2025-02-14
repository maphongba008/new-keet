import React, { useEffect } from 'react'
import { StyleSheet, Text } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import {
  AutoLockTime,
  usePasscodeStore,
} from 'screen/Passcode/usePasscodeStore'
import { UI_SIZE_8 } from 'lib/commonStyles'
import { getAppAutoLockTime } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

export const AppAutoLockTime = () => {
  const styles = getStyles()
  const strings = useStrings()
  const { autoLockTime, setAutoLockTime } = usePasscodeStore()

  useEffect(() => {
    const fetchedAutolockTime = getAppAutoLockTime()
    setAutoLockTime(fetchedAutolockTime)
  }, [setAutoLockTime])

  const renderAutoLockText = () => {
    if (autoLockTime === AutoLockTime.Never) {
      return strings.passcode.never
    }

    const unit =
      autoLockTime === AutoLockTime.OneMinute
        ? strings.passcode.minute
        : strings.passcode.minutes
    return `${autoLockTime} ${unit}`
  }

  return (
    <Text style={[styles.text, styles.autoLockSuffixText]}>
      {autoLockTime ? renderAutoLockText() : strings.common.loading}
    </Text>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    autoLockSuffixText: {
      color: theme.color.grey_300,
      marginRight: UI_SIZE_8,
    },
    text: {
      ...theme.text.body,
    },
  })
  return styles
})
