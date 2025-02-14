import React, { memo, useCallback } from 'react'
import { Text } from 'react-native'
import { useRoute } from '@react-navigation/native'

import { IconButton } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { UI_SIZE_24 } from 'lib/commonStyles'
import { useTimeout } from 'lib/hooks'
import { setStoragePasscode } from 'lib/localStorage'
import { APP_ROOT, back, navigate } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { PasscodeInput } from './PasscodeInput'
import PasscodeMessage from './PasscodeMessage'
import { MessageType, usePasscodeStore } from './usePasscodeStore'

const PasscodeConfirmationScreen: React.FC = () => {
  const strings = useStrings()
  const route = useRoute()
  const styles = getStyles()
  const {
    setMessage,
    setMessageType,
    message,
    messageType,
    setUserHasPasscode,
  } = usePasscodeStore()

  const initialPasscode = (route.params as { passcode: string }).passcode

  const navigateToRootWithDelay = useTimeout(() => navigate(APP_ROOT), 1000)

  const handlePasscodeComplete = useCallback(
    (confirmedPasscode: string) => {
      if (confirmedPasscode === initialPasscode) {
        setStoragePasscode(confirmedPasscode)
        setMessageType(MessageType.Success)
        setMessage(strings.passcode.passcodeSettingSuccessfull)
        setUserHasPasscode(true)
        navigateToRootWithDelay()
      } else {
        setMessageType(MessageType.Error)
        setMessage(strings.passcode.passcodeDoesNotMatch)
      }
    },
    [
      initialPasscode,
      setMessage,
      setMessageType,
      setUserHasPasscode,
      strings.passcode.passcodeDoesNotMatch,
      strings.passcode.passcodeSettingSuccessfull,
      navigateToRootWithDelay,
    ],
  )

  return (
    <>
      <NavBar
        title={null}
        left={
          <IconButton
            onPress={back}
            {...appiumTestProps(APPIUM_IDs.passcode_confirm_btn_back)}
          >
            <SvgIcon name="arrowLeft" width={UI_SIZE_24} height={UI_SIZE_24} />
          </IconButton>
        }
        middle={
          <Text style={styles.title}>{strings.passcode.setupPasscode}</Text>
        }
        right={
          <IconButton
            onPress={back}
            {...appiumTestProps(APPIUM_IDs.passcode_confirm_btn_close)}
          >
            <SvgIcon name="close" width={UI_SIZE_24} height={UI_SIZE_24} />
          </IconButton>
        }
      />
      <PasscodeInput
        title={strings.passcode.confirm4Digit}
        description={strings.passcode.confirm4DigitDesc}
        onComplete={handlePasscodeComplete}
        showBiometrics={false}
      />
      <PasscodeMessage message={message} messageType={messageType} />
    </>
  )
}

export default memo(PasscodeConfirmationScreen)

const getStyles = createThemedStylesheet(() => ({
  title: {
    color: colors.white_snow,
    textAlign: 'center' as 'center',
  },
}))
