import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { setUserProfile } from '@holepunchto/keet-store/store/userProfile'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_16 } from 'lib/commonStyles'
import { useExitOnboardingIDSetup } from 'lib/hooks/useAppNavigation'

import { useStrings } from 'i18n/strings'

const RecoverAccountSuccess = memo(() => {
  const styles = getStyles()
  const { recoverAccount: strings } = useStrings()
  const dispatch = useDispatch()
  const exitIDSetupHandler = useExitOnboardingIDSetup()

  const onFinish = useCallback(() => {
    dispatch(setUserProfile({ needsName: false }))
    exitIDSetupHandler()
  }, [dispatch, exitIDSetupHandler])

  return (
    <View style={styles.container}>
      <View style={styles.container} />
      <Text style={styles.title}>{strings.accountRecovered}</Text>
      <Text style={styles.text}>{strings.welcomeBack}</Text>
      <View style={styles.container} />
      <TextButton
        text={strings.finish}
        onPress={onFinish}
        type={TextButtonType.primary}
        {...appiumTestProps(APPIUM_IDs.recover_btn_success)}
      />
    </View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
      color: theme.color.grey_100,
      textAlign: 'center',
    },
    title: {
      ...theme.text.title,
      fontSize: 26,
      marginBottom: UI_SIZE_16,
      textAlign: 'center',
    },
  })
  return styles
})

export default RecoverAccountSuccess
