import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import PasscodeCheckScreen from 'screen/Passcode/PasscodeCheckScreen'
import { usePasscodeStore } from 'screen/Passcode/usePasscodeStore'
import s, { UI_SIZE_14 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

interface PasscodeI {
  onSubmitSuccess: () => void
}

export const withPasscode = (WrappedComponent: any) => (props: any) => {
  const styles = getStyles()
  const { passcode: strings } = useStrings()
  const [passcodeConfig, setPasscodeConfig] = useState<PasscodeI | null>(null)
  const { userHasPasscode } = usePasscodeStore()

  const handleSubmit = useCallback(() => {
    const { onSubmitSuccess } = passcodeConfig!
    onSubmitSuccess()
    setPasscodeConfig(null)
  }, [passcodeConfig])

  if (!userHasPasscode && passcodeConfig) {
    handleSubmit()
  }

  if (userHasPasscode && passcodeConfig) {
    return (
      <View style={styles.fullscreenView}>
        <PasscodeCheckScreen
          title={strings.confirmTransfer}
          description=""
          titleStyleProp={styles.passcodeTitle}
          onSuccess={handleSubmit}
        />
      </View>
    )
  }
  return <WrappedComponent {...props} showPasscode={setPasscodeConfig} />
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    fullscreenView: {
      ...StyleSheet.absoluteFillObject,
      ...s.centeredLayout,
      backgroundColor: theme.background.bg_1,
      zIndex: 10,
    },
    passcodeTitle: {
      fontSize: UI_SIZE_14,
    },
  })
  return styles
})
