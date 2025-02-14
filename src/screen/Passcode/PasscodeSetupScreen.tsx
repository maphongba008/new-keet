import React, { memo, useCallback } from 'react'
import { Text } from 'react-native'

import { IconButton } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { UI_SIZE_24 } from 'lib/commonStyles'
import { back, navigate, SCREEN_PASSCODE_CONFIRMATION } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { PasscodeInput } from './PasscodeInput'

const PasscodeSetupScreen = () => {
  const strings = useStrings()
  const styles = getStyles()

  const handlePasscodeComplete = useCallback((passcode: string) => {
    navigate(SCREEN_PASSCODE_CONFIRMATION, { passcode })
  }, [])

  const handleBack = useCallback(() => {
    back()
  }, [])

  return (
    <>
      <NavBar
        title={null}
        left={
          <IconButton
            onPress={back}
            {...appiumTestProps(APPIUM_IDs.passcode_btn_back)}
          >
            <SvgIcon name="arrowLeft" width={UI_SIZE_24} height={UI_SIZE_24} />
          </IconButton>
        }
        middle={
          <Text style={styles.title}>{strings.passcode.setupPasscode}</Text>
        }
        right={
          <IconButton
            onPress={handleBack}
            {...appiumTestProps(APPIUM_IDs.passcode_btn_close)}
          >
            <SvgIcon name="close" width={UI_SIZE_24} height={UI_SIZE_24} />
          </IconButton>
        }
      />
      <PasscodeInput
        title={strings.passcode.set4Digit}
        description={strings.passcode.set4DigitDesc}
        onComplete={handlePasscodeComplete}
        showBiometrics={false}
      />
    </>
  )
}

export default memo(PasscodeSetupScreen)

const getStyles = createThemedStylesheet(() => ({
  title: {
    color: colors.white_snow,
    textAlign: 'center' as 'center',
  },
}))
