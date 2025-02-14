import React, { memo, useCallback, useEffect } from 'react'
import { Text } from 'react-native'

import { IconButton } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { UI_SIZE_24 } from 'lib/commonStyles'
import { getStoragePasscode } from 'lib/localStorage'
import { back, navigate, SCREEN_PASSCODE_CHANGE_SET_NEW } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { PasscodeInput } from './PasscodeInput'
import PasscodeMessage from './PasscodeMessage'
import { MessageType, usePasscodeStore } from './usePasscodeStore'

const PasscodeChangeScreen: React.FC = () => {
  const strings = useStrings()
  const styles = getStyles()
  const { setMessage, setMessageType, message, messageType, resetMessage } =
    usePasscodeStore()

  const handlePasscodeComplete = useCallback(
    (passcode: string) => {
      const currentPasscode = getStoragePasscode()

      if (passcode === currentPasscode) {
        navigate(SCREEN_PASSCODE_CHANGE_SET_NEW, { passcode })
        setMessageType(MessageType.Success)
        setMessage(strings.passcode.passcodeCorrect)
      } else {
        setMessageType(MessageType.Error)
        setMessage(strings.passcode.passcodeIncorrect)
      }
    },
    [
      setMessage,
      setMessageType,
      strings.passcode.passcodeCorrect,
      strings.passcode.passcodeIncorrect,
    ],
  )

  useEffect(() => {
    resetMessage()

    return () => {
      resetMessage()
    }
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
        title={strings.passcode.inputOld4Digit}
        description={strings.passcode.inputOld4DigitDesc}
        onComplete={handlePasscodeComplete}
        showBiometrics={false}
      />
      <PasscodeMessage message={message} messageType={messageType} />
    </>
  )
}

export default memo(PasscodeChangeScreen)

const getStyles = createThemedStylesheet(() => ({
  title: {
    color: colors.white_snow,
    textAlign: 'center' as 'center',
  },
}))
