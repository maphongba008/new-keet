import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'

import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_8, UI_SIZE_18, UI_SIZE_20 } from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'

import { ButtonBase } from './Button'
import { createThemedStylesheet } from './theme'

interface LabeledRadioType {
  value: boolean
  onChange: (value: boolean) => void
  label?: string
  disabled?: boolean
}

const LabeledRadio = memo(
  ({ label, value, onChange = _noop, disabled = false }: LabeledRadioType) => {
    const styles = getStyles()

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
        disabled={disabled}
        style={s.centerAlignedRow}
        {...appiumTestProps(APPIUM_IDs.radio_btn)}
      >
        <View
          style={styles.radioButtonChecked}
          testID={APPIUM_IDs.radio_btn_checked}
        >
          {!!value && <View style={styles.radioDot} />}
        </View>
        <Text style={styles.text}>{label}</Text>
      </ButtonBase>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    radioBtnActive: {
      backgroundColor: theme.color.blue_400,
    },
    radioButtonChecked: {
      ...s.centeredLayout,
      borderColor: theme.color.blue_400,
      borderRadius: UI_SIZE_20 / 2,
      borderWidth: 1,
      height: UI_SIZE_20,
      marginRight: UI_SIZE_8,
      width: UI_SIZE_20,
    },
    radioDot: {
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_18 / 2,
      height: UI_SIZE_18 / 2,
      width: UI_SIZE_18 / 2,
    },
    text: {
      ...theme.text.body,
      fontSize: 14,
    },
  })
  return styles
})

export default LabeledRadio
