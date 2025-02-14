import React, { memo, useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native'
import { useSelector } from 'react-redux'

import {
  getIdentitySecretPhrase,
  getIsIdentityAnonymous,
} from '@holepunchto/keet-store/store/identity'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { BackButton, NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import PasscodeCheckScreen from 'screen/Passcode/PasscodeCheckScreen'
import { usePasscodeStore } from 'screen/Passcode/usePasscodeStore'
import { SHOW_PASSCODE } from 'lib/build.constants'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
} from 'lib/commonStyles'
import {
  navigate,
  SCREEN_APP_AUTO_LOCK,
  SCREEN_PASSCODE_CHANGE,
  SCREEN_PASSCODE_SETUP,
  SCREEN_RECOVERY_PHRASE_SETTINGS,
} from 'lib/navigation'

import { getStrings, useStrings } from 'i18n/strings'

import { AppAutoLockTime } from './AppAutoLockTime'
import { SecurityOption } from './SecurityOption'

type passcodeOptionsType = {
  text?: string
  action?: () => void
  visible?: boolean
  textStyle?: TextStyle | TextStyle[]
}

type renderOptionsType = {
  key: string
  title: string | passcodeOptionsType[]
  desc?: string
  action?: () => void
  right?: boolean
  visible?: boolean
  textOnly?: boolean
}

type securityOptions = {
  userHasPasscode: boolean
  isIdentityAnonymous: boolean
  seedPhrase: string | null
  passcodeOptions: passcodeOptionsType[]
}

const getPasscodeOptions = (
  userHasPasscode: boolean,
  handleShowTurnOffPasscode: Function,
) => {
  const strings = getStrings()
  const styles = getStyles()
  return [
    {
      text: userHasPasscode
        ? strings.passcode.change
        : strings.settings.privacyAndSecurity.setPasscode,
      action: () => {
        userHasPasscode
          ? navigate(SCREEN_PASSCODE_CHANGE)
          : navigate(SCREEN_PASSCODE_SETUP)
      },
    },
    {
      text: strings.passcode.turnOffPasscode,
      action: handleShowTurnOffPasscode,
      visible: userHasPasscode,
      textStyle: styles.danger,
    },
  ]
}

const getSecurityOptions = ({
  userHasPasscode,
  isIdentityAnonymous,
  seedPhrase,
  passcodeOptions,
}: securityOptions) => {
  const strings = getStrings()
  const securityStrings = strings.settings.privacyAndSecurity
  return [
    {
      key: 'passcode',
      title: passcodeOptions,
      desc: securityStrings.setPasscodeDesc,
      visible: SHOW_PASSCODE,
    },
    {
      key: 'auto_lock',
      title: strings.passcode.autoLock,
      desc: strings.passcode.addALayerOfSecurity,
      right: <AppAutoLockTime />,
      visible: userHasPasscode,
      action: () => {
        navigate(SCREEN_APP_AUTO_LOCK)
      },
    },
    {
      key: 'recovery_phrase',
      title: securityStrings.recoveryPhraseSettings,
      desc: securityStrings.recoveryPhraseSettingsDesc,
      visible: !isIdentityAnonymous && seedPhrase,
      action: () => {
        navigate(SCREEN_RECOVERY_PHRASE_SETTINGS)
      },
    },
    {
      key: 'no_recovery',
      desc: (securityStrings as any).noRecoveryPhraseWarning,
      visible: !seedPhrase,
      textOnly: true,
    },
  ]
}

const SecurityScreen = () => {
  const styles = getStyles()
  const strings = useStrings()
  const { userHasPasscode } = usePasscodeStore()
  const [showPasscodeCheck, setShowPasscodeCheck] = useState(false)
  const isIdentityAnonymous = useSelector(getIsIdentityAnonymous)
  const seedPhrase = useSelector(getIdentitySecretPhrase)

  const handleShowTurnOffPasscode = useCallback(() => {
    setShowPasscodeCheck(true)
  }, [])

  const handlePasscodeSuccess = useCallback(() => {
    setShowPasscodeCheck(false)
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.TurnOffPasscodeSheet,
    })
  }, [])

  const passcodeOptions = getPasscodeOptions(
    userHasPasscode,
    handleShowTurnOffPasscode,
  ) as passcodeOptionsType[]

  const securityOptions = useMemo(() => {
    const params = {
      userHasPasscode,
      isIdentityAnonymous,
      seedPhrase,
      passcodeOptions,
    }
    return getSecurityOptions(params)
  }, [isIdentityAnonymous, passcodeOptions, seedPhrase, userHasPasscode])

  const renderOptions = useCallback(
    (
      {
        key,
        title,
        desc,
        action,
        right,
        visible = true,
        textOnly = false,
      }: renderOptionsType,
      optionIndex: number,
    ) => {
      if (!visible) return
      return (
        <View key={key + optionIndex}>
          {!textOnly && (
            <View style={styles.container}>
              {typeof title === 'string' ? (
                <SecurityOption
                  key={key}
                  text={title}
                  action={action}
                  visible={visible}
                  right={right}
                />
              ) : (
                passcodeOptions.map((option, index) => (
                  <SecurityOption
                    key={index}
                    text={option.text}
                    action={option.action}
                    visible={option.visible}
                    textStyle={option.textStyle}
                  />
                ))
              )}
            </View>
          )}
          <Text style={[styles.text, !textOnly && styles.description]}>
            {desc}
          </Text>
        </View>
      )
    },
    [passcodeOptions, styles.container, styles.description, styles.text],
  )

  if (showPasscodeCheck) {
    return (
      <PasscodeCheckScreen
        onSuccess={handlePasscodeSuccess}
        hasBackButton
        hasCloseButton
      />
    )
  }

  return (
    <>
      <NavBar left={<BackButton />} title={strings.account.security} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* @ts-ignore */}
        {securityOptions.map(renderOptions)}
      </ScrollView>
    </>
  )
}

export default memo(SecurityScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.column,
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_12,
      paddingHorizontal: UI_SIZE_16,
    },
    danger: {
      color: theme.color.red_400,
    },
    description: {
      ...theme.text.greyText,
      fontSize: UI_SIZE_14,
      fontWeight: '400',
      marginHorizontal: UI_SIZE_16,
      marginTop: UI_SIZE_8,
    },
    scrollView: {
      flexGrow: 1,
      gap: UI_SIZE_24,
      padding: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
    },
  })
  return styles
})
