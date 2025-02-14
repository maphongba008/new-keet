import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BackButton, NavBar } from 'component/NavBar'
import LabeledRadio from 'component/RadioButton'
import { colors, createThemedStylesheet } from 'component/theme'
import {
  AutoLockTime,
  usePasscodeStore,
} from 'screen/Passcode/usePasscodeStore'
import s, { UI_SIZE_20, UI_SIZE_24, UI_SIZE_48 } from 'lib/commonStyles'
import { getAppAutoLockTime, setAppAutoLockTime } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

const AppAutoLockScreen = () => {
  const styles = getStyles()
  const strings = useStrings()
  const { bottom: paddingBottom } = useSafeAreaInsets()

  const { autoLockTime, setAutoLockTime } = usePasscodeStore()

  const options = useMemo(
    () => [
      { label: AutoLockTime.OneMinute, value: AutoLockTime.OneMinute },
      { label: AutoLockTime.TwoMinutes, value: AutoLockTime.TwoMinutes },
      { label: AutoLockTime.FiveMinutes, value: AutoLockTime.FiveMinutes },
      {
        label: AutoLockTime.FifteenMinutes,
        value: AutoLockTime.FifteenMinutes,
      },
      { label: strings.passcode.never, value: AutoLockTime.Never },
    ],
    [strings.passcode.never],
  )

  const handleSelect = useCallback(
    async (key: AutoLockTime) => {
      setAutoLockTime(key)
      setAppAutoLockTime(key)
    },
    [setAutoLockTime],
  )

  const renderOptionLabel = (label: string) => {
    if (label === strings.passcode.never) {
      return label
    }
    const unit =
      label === AutoLockTime.OneMinute
        ? strings.passcode.minute
        : strings.passcode.minutes
    return `${label} ${unit}`
  }

  const renderOption = ({
    label,
    value,
  }: {
    label: string
    value: AutoLockTime
  }) => (
    <View key={label}>
      <TouchableOpacity
        style={[styles.innerContainer, styles.border]}
        // eslint-disable-next-line react/jsx-no-bind
        onPress={() => handleSelect(value)}
      >
        <Text style={styles.text}>{renderOptionLabel(label)}</Text>
        <LabeledRadio
          value={autoLockTime === value}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={() => null}
        />
      </TouchableOpacity>
    </View>
  )

  useEffect(() => {
    const time = getAppAutoLockTime()
    setAutoLockTime(time)
    setAppAutoLockTime(time)
  }, [setAutoLockTime])

  return (
    <>
      <NavBar
        left={<BackButton />}
        title={null}
        middle={
          <Text style={styles.navTitle}>{strings.passcode.appAutoLock}</Text>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scrollView, { paddingBottom }]}
      >
        {options.map(renderOption)}
      </ScrollView>
    </>
  )
}

export default memo(AppAutoLockScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    border: {
      borderBottomColor: theme.color.grey_600,
      borderBottomWidth: 1,
    },
    innerContainer: {
      ...s.row,
      ...s.flexSpaceBetween,
      alignItems: 'center',
      height: UI_SIZE_48,
    },
    navTitle: {
      color: colors.white_snow,
      marginRight: UI_SIZE_20,
      textAlign: 'center',
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: UI_SIZE_24,
    },
    text: {
      ...theme.text.body,
    },
  })
  return styles
})
