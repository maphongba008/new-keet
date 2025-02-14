import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

import { APP_STATUS, setAppStatus } from '@holepunchto/keet-store/store/app'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_16, UI_SIZE_24, width } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { useExitOnboardingIDSetup } from 'lib/hooks/useAppNavigation'
import { useBackHandler } from 'lib/hooks/useBackHandler'

import { useStrings } from 'i18n/strings'

const IdentityBackupComplete = memo(() => {
  const dispatch = useDispatch()
  const styles = getStyles()
  const { syncDevice: strings } = useStrings()
  const exitIDSetupHandler = useExitOnboardingIDSetup()

  const onFinish = useCallback(async () => {
    dispatch(setAppStatus(APP_STATUS.RUNNING))
    exitIDSetupHandler()
  }, [dispatch, exitIDSetupHandler])

  const onPressBack = useCallback(() => {
    onFinish()
    return true
  }, [onFinish])
  useBackHandler(onPressBack)

  return (
    <>
      <ScreenSystemBars />
      <View style={[s.container, s.justifyEnd]}>
        <SvgIcon
          width={width}
          height={(width * 536) / 393}
          name="backgroundCircles"
        />
      </View>
      <SafeAreaView style={[s.container, s.absoluteFill]} edges={SAFE_EDGES}>
        <NavBar left={null} title={null} />
        <View style={styles.root}>
          <View style={styles.container}>
            <Text style={styles.title}>{strings.congratulations}</Text>
            <Text style={styles.description}>{strings.nowYouCanLogin}</Text>
          </View>
          <TextButton
            text={strings.finish}
            type={TextButtonType.primary}
            onPress={onFinish}
            {...appiumTestProps(APPIUM_IDs.create_id_onFinish_btn)}
          />
        </View>
      </SafeAreaView>
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.container,
      ...s.centeredLayout,
      gap: UI_SIZE_16,
    },
    description: {
      ...theme.text.body,
      ...s.textAlignCenter,
      color: theme.color.grey_200,
    },
    root: {
      ...s.container,
      gap: UI_SIZE_24,
      padding: theme.spacing.standard,
    },
    title: {
      ...theme.text.title,
      ...s.textAlignCenter,
      fontSize: UI_SIZE_24,
    },
  })
  return styles
})

export default IdentityBackupComplete
