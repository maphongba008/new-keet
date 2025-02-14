import React, { memo, useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'

import {
  getAccountRecoveryErrorMsg,
  getAccountRecoveryLoading,
  phraseToWords,
  SECRET_PHRASE_WORDS_COUNT,
  submitAccountRecovery,
} from '@holepunchto/keet-store/store/identity'

import { IconButton, TextButton, TextButtonType } from 'component/Button'
import { KeetLoading } from 'component/Loading'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  ICON_SIZE_16,
  INPUT_ICON_COLOR,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_64,
} from 'lib/commonStyles'
import { keyboardBehavior } from 'lib/keyboard'

import { useStrings } from 'i18n/strings'

const RecoverAccountForm = memo(() => {
  const styles = getStyles()
  const { recoverAccount: strings } = useStrings()
  const theme = useTheme()

  const dispatch = useDispatch()
  const errorMsg: string = useSelector(getAccountRecoveryErrorMsg)
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
    dispatch(submitAccountRecovery(value))
  }, [dispatch, value])

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <KeetLoading style={styles.loadingIcon} />
        <Text style={styles.loadingText}>{strings.loading}</Text>
      </View>
    )
  }

  return (
    <>
      <NavBar title={strings.inputSeed} />
      <KeyboardAvoidingView behavior={keyboardBehavior} style={s.container}>
        <ScrollView contentContainerStyle={styles.root} bounces={false}>
          <Text style={styles.text}>{strings.enterToSync}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              multiline
              placeholderTextColor={theme.color.grey_300}
              placeholder={strings.inputPlaceholder}
              style={
                [
                  styles.input,
                  inputFocused && styles.formInputFocused,
                  !!errorMsg && styles.formInputError,
                ] as any
              }
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
              <Text style={styles.errorText}>{strings.recoverError}</Text>
            )}
          </View>
          <View style={s.container} />
          <TextButton
            text={strings.recoverAccount}
            onPress={submit}
            type={canSubmit ? TextButtonType.primary : TextButtonType.gray}
            disabled={!canSubmit}
            {...appiumTestProps(APPIUM_IDs.recover_btn_continue)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    errorText: {
      ...theme.text.body,
      color: theme.color.red_400,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_8,
    },
    formInputError: {
      borderColor: theme.color.red_400,
    },
    formInputFocused: {
      borderColor: theme.color.blue_400,
    },
    input: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderColor: theme.color.grey_600,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      height: 182,
      paddingHorizontal: theme.spacing.standard,
      paddingRight: UI_SIZE_64,
      paddingVertical: theme.spacing.standard,
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
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: UI_SIZE_14,
      marginVertical: UI_SIZE_12,
    },
    loadingWrapper: {
      ...s.container,
      ...s.centeredLayout,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: UI_SIZE_14,
    },
  })
  return styles
})

export default RecoverAccountForm
