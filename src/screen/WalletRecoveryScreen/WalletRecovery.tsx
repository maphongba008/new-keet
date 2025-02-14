import React, { memo, useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'

import {
  getAccountRecoveryLoading,
  phraseToWords,
  SECRET_PHRASE_WORDS_COUNT,
} from '@holepunchto/keet-store/store/identity'

import { IconButton, TextButton, TextButtonType } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import { KeetLoading } from 'component/Loading'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  ICON_SIZE_16,
  INPUT_ICON_COLOR,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { navigate, SCREEN_WALLET_IMPORT_COMPLETE } from 'lib/navigation'
import { isIOS } from 'lib/platform'
import { getPaymentBackend } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

const WalletRecovery = memo(() => {
  const styles = getStyles()
  const { wallet: strings } = useStrings()
  const theme = useTheme()

  const [errorMsg, setErrorMsg] = useState(false)
  const loading = useSelector(getAccountRecoveryLoading)

  const [value, setValue] = useState('')
  const [inputFocused, setInputFocused] = useState<boolean>(false)

  const valid = phraseToWords(value).length >= SECRET_PHRASE_WORDS_COUNT

  const canSubmit = valid && !loading

  const onPressPaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync()
    text && setValue(text)
  }, [setValue])

  const onFocus = useCallback(() => setInputFocused(true), [])
  const onBlur = useCallback(() => setInputFocused(false), [])

  const submit = useCallback(() => {
    if (!getPaymentBackend().importWallet(value)) {
      setErrorMsg(true)
      return
    }
    navigate(SCREEN_WALLET_IMPORT_COMPLETE)
  }, [value])

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <KeetLoading style={styles.loadingIcon} />
        <Text style={styles.loadingText}>{strings.import.loading}</Text>
      </View>
    )
  }

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.import.title} right={null} />
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Text style={styles.text}>{strings.import.inputDesc}</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            multiline
            placeholderTextColor={theme.text.placeholder.color}
            placeholder={strings.import.inputPlaceholder}
            style={[
              styles.input,
              inputFocused && styles.formInputFocused,
              !!errorMsg && styles.formInputError,
            ]}
            onChangeText={setValue}
            defaultValue={value}
            onFocus={onFocus}
            onBlur={onBlur}
            {...appiumTestProps(APPIUM_IDs.recover_input_passphrase)}
          />
          <IconButton
            onPress={onPressPaste}
            style={styles.inputIconPaste}
            {...appiumTestProps(APPIUM_IDs.recover_btn_paste)}
          >
            <SvgIcon
              name="paste"
              width={ICON_SIZE_16}
              height={ICON_SIZE_16}
              color={colors.white_snow}
            />
          </IconButton>
          {!!errorMsg && (
            <Text style={styles.errorText}>{strings.import.error}</Text>
          )}
        </View>
        <View style={s.container} />
        <TextButton
          text={strings.import.btnAction}
          style={styles.button}
          onPress={submit}
          type={canSubmit ? TextButtonType.primary : TextButtonType.gray}
          disabled={!canSubmit}
          {...appiumTestProps(APPIUM_IDs.recover_btn_continue)}
        />
      </KeyboardAvoidingView>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      marginBottom: UI_SIZE_8,
    },
    errorText: {
      ...theme.text.bodySemiBold,
      color: theme.color.danger,
      marginTop: UI_SIZE_8,
    },
    formInputError: {
      borderColor: theme.color.danger,
    },
    formInputFocused: {
      borderColor: theme.color.blue_400,
    },
    input: {
      ...theme.text.body,
      backgroundColor: theme.background.bg_2,
      borderColor: theme.border.color,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      height: 160,
      lineHeight: 25,
      paddingHorizontal: theme.spacing.standard,
      paddingRight: UI_SIZE_48,
      paddingVertical: theme.spacing.standard / (isIOS ? 1 : 2),
      textAlignVertical: 'top',
    },
    inputIconPaste: {
      backgroundColor: INPUT_ICON_COLOR,
      borderRadius: theme.border.radiusNormal,
      bottom: UI_SIZE_4,
      height: 42,
      position: 'absolute',
      right: UI_SIZE_4,
      top: UI_SIZE_4,
      width: 42,
      ...s.centeredLayout,
    },
    inputWrapper: {
      marginVertical: UI_SIZE_16,
    },
    loadingIcon: {
      flexGrow: 0,
    },
    loadingText: {
      ...theme.text.greyText,
      marginVertical: UI_SIZE_12,
    },
    loadingWrapper: {
      ...s.container,
      ...s.centeredLayout,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    text: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: 14,
    },
    title: {
      ...theme.text.title,
      fontSize: 24,
      marginBottom: UI_SIZE_8,
    },
  })
  return styles
})

export default WalletRecovery
