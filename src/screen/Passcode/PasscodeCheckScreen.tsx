import React, { memo, useCallback, useEffect } from 'react'
import { Text, TextStyle, View } from 'react-native'

import { IconButton } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { UI_SIZE_24 } from 'lib/commonStyles'
import { useAppStore, useTimeout } from 'lib/hooks'
import { getStoragePasscode } from 'lib/localStorage'
import {
  back,
  getCurrentRoute,
  reset,
  SCREEN_HOME,
  SCREEN_PASSCODE_CHECK,
} from 'lib/navigation'

// Adjust the import path as necessary

import { useStrings } from 'i18n/strings'

import { BIOMETRICS_SUCCESS, PasscodeInput } from './PasscodeInput'
import PasscodeMessage from './PasscodeMessage'
import { MessageType, usePasscodeStore } from './usePasscodeStore'

interface PasscodeCheckProps {
  title?: string
  description?: string
  titleStyleProp?: TextStyle
  onSuccess?: () => void
  hasBackButton?: boolean
  hasCloseButton?: boolean
}

const PasscodeCheckScreen: React.FC<PasscodeCheckProps> = ({
  title,
  description,
  titleStyleProp,
  onSuccess,
  hasBackButton = false,
  hasCloseButton = false,
}) => {
  const strings = useStrings()
  const styles = getStyles()
  const { message, messageType, setMessage, setMessageType, resetMessage } =
    usePasscodeStore()

  const handleCorrectPasscodeWithDelay = useTimeout(() => {
    useAppStore.setState({
      isAuthenticated: true,
    })
    if (onSuccess) {
      onSuccess()
    } else {
      const currentRoute = getCurrentRoute()
      if (currentRoute === SCREEN_PASSCODE_CHECK) {
        back()
      } else {
        reset(SCREEN_HOME)
      }
    }
  }, 500)

  const handlePasscodeComplete = useCallback(
    (passcode: string) => {
      const isCorrectPasscode =
        passcode === BIOMETRICS_SUCCESS || passcode === getStoragePasscode()

      if (isCorrectPasscode) {
        setMessageType(MessageType.Success)
        setMessage(strings.passcode.passcodeCorrect)
        handleCorrectPasscodeWithDelay()
      } else {
        setMessageType(MessageType.Error)
        setMessage(strings.passcode.passcodeDoesNotMatch)
      }
    },
    [
      setMessage,
      setMessageType,
      strings.passcode.passcodeCorrect,
      strings.passcode.passcodeDoesNotMatch,
      handleCorrectPasscodeWithDelay,
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
          hasBackButton ? (
            <IconButton onPress={back}>
              <SvgIcon
                name="arrowLeft"
                width={UI_SIZE_24}
                height={UI_SIZE_24}
              />
            </IconButton>
          ) : null
        }
        middle={
          !title ? (
            <Text style={styles.title}>{strings.passcode.inputPasscode}</Text>
          ) : null
        }
        right={
          hasCloseButton ? (
            <IconButton onPress={back}>
              <SvgIcon name="close" width={UI_SIZE_24} height={UI_SIZE_24} />
            </IconButton>
          ) : null
        }
      />
      <View style={styles.container}>
        <PasscodeInput
          titleStyleProp={titleStyleProp}
          title={title ?? strings.passcode.input4DigitPasscode}
          description={description ?? strings.passcode.inputPasscodeDesc}
          onComplete={handlePasscodeComplete}
        />
        <PasscodeMessage message={message} messageType={messageType} />
      </View>
    </>
  )
}

export default memo(PasscodeCheckScreen)

const getStyles = createThemedStylesheet((theme) => ({
  container: {
    alignItems: 'center' as 'center',
    backgroundColor: theme.background.bg_1,
    flex: 1,
  },
  title: {
    color: colors.white_snow,
    textAlign: 'center' as 'center',
  },
}))
