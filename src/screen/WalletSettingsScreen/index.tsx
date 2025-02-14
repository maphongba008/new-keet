import React, { memo, useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar } from 'component/NavBar'
import LabeledRadio from 'component/RadioButton'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_48,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const OPTIONS = {
  any: 'any',
  custom: 'custom',
}

const WalletSettingsScreen = () => {
  const styles = getStyles()
  const strings = useStrings()

  const [isAccepted, setIsAccepted] = useState(false)
  const [option, setOption] = useState('')
  const [customAmount, setCustomAmount] = useState('')

  const onSelectAny = useCallback(() => setOption(OPTIONS.any), [])
  const onSelectCustom = useCallback(() => setOption(OPTIONS.custom), [])

  useEffect(() => {
    if (!isAccepted) {
      setOption('')
    }
  }, [isAccepted])

  return (
    <>
      <NavBar title={strings.account.walletSettings} />
      <ScrollView style={styles.root} contentContainerStyle={styles.spacing}>
        <View style={s.centerAlignedRow}>
          <Text style={styles.radioText}>
            {strings.wallet.settings.switchLabel}
          </Text>
          <Switch
            trackColor={{
              true: colors.blue_400,
              false: colors.keet_grey_500,
            }}
            thumbColor={isAccepted ? colors.blue_950 : colors.keet_grey_200}
            ios_backgroundColor={colors.keet_grey_500}
            onValueChange={setIsAccepted}
            value={isAccepted}
          />
        </View>
        <TouchableOpacity
          onPress={onSelectAny}
          style={[styles.options, !isAccepted && styles.optionsDisabled]}
          disabled={!isAccepted}
          {...appiumTestProps(APPIUM_IDs.wallet_settings_option_any)}
        >
          <Text style={styles.text}>{strings.wallet.settings.anyAmount}</Text>
          <LabeledRadio
            value={option === OPTIONS.any}
            onChange={onSelectAny}
            disabled={!isAccepted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSelectCustom}
          style={[styles.options, !isAccepted && styles.optionsDisabled]}
          disabled={!isAccepted}
          {...appiumTestProps(APPIUM_IDs.wallet_settings_option_custom)}
        >
          <Text style={styles.text}>
            {strings.wallet.settings.customAmount}
          </Text>
          <LabeledRadio
            value={option === OPTIONS.custom}
            onChange={onSelectCustom}
            disabled={!isAccepted}
          />
        </TouchableOpacity>
        {option === OPTIONS.custom && (
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              value={customAmount}
              inputMode="decimal"
              keyboardType="decimal-pad"
              onChangeText={setCustomAmount}
              placeholder={strings.wallet.settings.amountLabel}
              placeholderTextColor={colors.keet_grey_400}
              {...appiumTestProps(APPIUM_IDs.wallet_settings_amount_input)}
            />
            <Text style={styles.textInputSuffix}>
              {strings.wallet.settings.amountSuffix}
            </Text>
          </View>
        )}
        <View style={s.container} />
        <TextButton
          text={strings.common.save}
          type={TextButtonType.primary}
          {...appiumTestProps(APPIUM_IDs.wallet_settings_save_btn)}
        />
      </ScrollView>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    options: {
      ...s.centerAlignedRow,
    },
    optionsDisabled: {
      opacity: 0.5,
    },
    radioText: {
      ...s.container,
      ...theme.text.body,
    },
    root: {
      padding: theme.spacing.standard,
      paddingTop: UI_SIZE_16,
    },
    spacing: {
      ...s.container,
      gap: UI_SIZE_24,
    },
    text: {
      ...theme.text.body,
      ...s.container,
    },
    textInput: {
      ...s.container,
      backgroundColor: colors.keet_grey_600,
      borderRadius: UI_SIZE_8,
      color: colors.white_snow,
      height: 42,
      paddingHorizontal: UI_SIZE_16,
      paddingRight: UI_SIZE_48,
    },
    textInputSuffix: {
      ...theme.text.body,
      color: theme.color.grey_000,
      position: 'absolute',
      right: UI_SIZE_16,
    },
    textInputWrapper: {
      ...s.centerAlignedRow,
    },
  })
  return styles
})

export default memo(WalletSettingsScreen)
