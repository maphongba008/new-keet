import React, { memo, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'

import s, { UI_SIZE_4, UI_SIZE_8, UI_SIZE_20 } from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'

import { ButtonBase } from './Button'
import SvgIcon from './SvgIcon'
import { createThemedStylesheet, useTheme } from './theme'

interface LabeledCheckboxType {
  value: boolean
  onChange: (value: boolean) => void
  label?: string
  style?: ViewStyle
  textStyle?: TextStyle | TextStyle[]
  checkboxStyle?: ViewStyle
  testProps?: Partial<ViewProps>
}
const LabeledCheckbox = memo(
  ({
    label,
    value,
    onChange = _noop,
    style,
    textStyle,
    checkboxStyle,
    testProps,
  }: LabeledCheckboxType) => {
    const styles = getStyles()
    const theme = useTheme()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleValue = useCallback(
      _debounce(
        () => {
          onChange(!value)
        },
        BACK_DEBOUNCE_DELAY,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [onChange, value],
    )

    return (
      <ButtonBase
        onPress={toggleValue}
        style={[s.centerAlignedRow, style]}
        {...testProps}
      >
        <View
          style={[
            styles.checkboxView,
            !!value && styles.checkboxSelectedView,
            checkboxStyle,
          ]}
          testID="checkbox_checked"
        >
          {!!value && <SvgIcon name="checkFat" color={theme.color.bg} />}
        </View>
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </ButtonBase>
    )
  },
)

export default LabeledCheckbox

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    checkboxSelectedView: {
      backgroundColor: theme.color.blue_400,
    },
    checkboxView: {
      ...s.centeredLayout,
      borderColor: theme.color.blue_400,
      borderRadius: UI_SIZE_4,
      borderWidth: 1,
      height: UI_SIZE_20,
      marginRight: UI_SIZE_8,
      width: UI_SIZE_20,
    },
    text: {
      ...theme.text.body,
      flex: 1,
      fontSize: 14,
    },
  })
  return styles
})
