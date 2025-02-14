import React, { memo, useCallback } from 'react'
import { Text } from 'react-native'

import { IconButton } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { UI_SIZE_24 } from 'lib/commonStyles'
import {
  back,
  navigate,
  SCREEN_PASSCODE_CHANGE_CONFIRM_NEW,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { PasscodeInput } from './PasscodeInput'

export const PasscodeChangeSetNewScreen: React.FC = () => {
  const strings = useStrings()
  const styles = getStyles()

  const handlePasscodeComplete = useCallback((passcode: string) => {
    navigate(SCREEN_PASSCODE_CHANGE_CONFIRM_NEW, { passcode })
  }, [])

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
        title={strings.passcode.inputNew4Digit}
        description={strings.passcode.inputNew4DigitDesc}
        onComplete={handlePasscodeComplete}
        showBiometrics={false}
      />
    </>
  )
}

export default memo(PasscodeChangeSetNewScreen)

const getStyles = createThemedStylesheet(() => ({
  title: {
    color: colors.white_snow,
    textAlign: 'center' as 'center',
  },
}))
