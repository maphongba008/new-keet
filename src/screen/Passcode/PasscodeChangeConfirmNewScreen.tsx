import React, { memo, useCallback, useEffect } from 'react'
import { Text } from 'react-native'
import { useRoute } from '@react-navigation/native'

import { IconButton } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { UI_SIZE_24 } from 'lib/commonStyles'
import { useTimeout } from 'lib/hooks'
import { setStoragePasscode } from 'lib/localStorage'
import { APP_ROOT, back, navigate } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { PasscodeInput } from './PasscodeInput'
import PasscodeMessage from './PasscodeMessage'
import { MessageType, usePasscodeStore } from './usePasscodeStore'

const PasscodeChangeConfirmNewScreen: React.FC = () => {
  const strings = useStrings()
  const styles = getStyles()
  const route = useRoute()
  const { setUserHasPasscode } = usePasscodeStore()
  const { setMessage, setMessageType, message, messageType, resetMessage } =
    usePasscodeStore()

  const newPasscode = (route.params as { passcode: string }).passcode

  const navigateToRootWithDelay = useTimeout(() => navigate(APP_ROOT), 1000)

  const handlePasscodeComplete = useCallback(
    (confirmedPasscode: string) => {
      if (confirmedPasscode === newPasscode) {
        setStoragePasscode(confirmedPasscode)
        setMessageType(MessageType.Success)
        setUserHasPasscode(true)
        setMessage(strings.passcode.passcodeSettingSuccessfull)
        navigateToRootWithDelay()
      } else {
        setMessageType(MessageType.Error)
        setMessage(strings.passcode.passcodeDoesNotMatch)
      }
    },
    [
      newPasscode,
      setMessage,
      setMessageType,
      setUserHasPasscode,
      strings.passcode.passcodeDoesNotMatch,
      strings.passcode.passcodeSettingSuccessfull,
      navigateToRootWithDelay,
    ],
  )

  useEffect(() => {
    resetMessage()
  }, [resetMessage])

  return (
    <>
      <NavBar
        title={null}
        left={
          <IconButton onPress={back}>
            <SvgIcon name="arrowLeft" width={UI_SIZE_24} height={UI_SIZE_24} />
          </IconButton>
        }
        middle={
          <Text style={styles.title}>{strings.passcode.changePasscode}</Text>
        }
        right={
          <IconButton onPress={back}>
            <SvgIcon name="close" width={UI_SIZE_24} height={UI_SIZE_24} />
          </IconButton>
        }
      />
      <PasscodeInput
        title={strings.passcode.confirmNew4Digit}
        description={strings.passcode.confirmNew4DigitDesc}
        onComplete={handlePasscodeComplete}
        showBiometrics={false}
      />
      <PasscodeMessage message={message} messageType={messageType} />
    </>
  )
}

export default memo(PasscodeChangeConfirmNewScreen)

const getStyles = createThemedStylesheet(() => ({
  title: {
    color: colors.white_snow,
    textAlign: 'center' as 'center',
  },
}))
