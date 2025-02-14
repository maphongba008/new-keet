import React, { memo, useCallback } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

import { APP_STATUS, setAppStatus } from '@holepunchto/keet-store/store/app'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_24 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { useBackHandler } from 'lib/hooks/useBackHandler'
import { APP_ROOT, navigate, SCREEN_WALLET } from 'lib/navigation'
import { useWalletStore } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

const WalletRecoveryComplete = memo(() => {
  const dispatch = useDispatch()
  const styles = getStyles()
  const { wallet: strings } = useStrings()
  const { setWallet }: any = useWalletStore()

  const onFinish = useCallback(() => {
    setWallet()
    dispatch(setAppStatus(APP_STATUS.RUNNING))
    navigate(APP_ROOT, {
      screen: SCREEN_WALLET,
    })
  }, [dispatch, setWallet])

  const onPressBack = useCallback(() => {
    onFinish()
    return true
  }, [onFinish])
  useBackHandler(onPressBack)

  return (
    <>
      <ScreenSystemBars />
      <SafeAreaView style={s.container} edges={SAFE_EDGES}>
        <NavBar left={null} title={null} right={null} />
        <View style={styles.root}>
          <View style={styles.container}>
            <Text style={styles.title}>
              {strings.recoveryPhrase.congratulations}
            </Text>
          </View>
          <TextButton
            text={strings.recoveryPhrase.finish}
            type={TextButtonType.primary}
            onPress={onFinish}
            style={styles.button}
            {...appiumTestProps(APPIUM_IDs.wallet_setup_onFinish_btn)}
          />
        </View>
      </SafeAreaView>
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const { width } = Dimensions.get('window')
  const styles = StyleSheet.create({
    button: {
      marginTop: UI_SIZE_12,
    },
    container: {
      ...s.container,
      ...s.centeredLayout,
      gap: UI_SIZE_12,
      paddingHorizontal: 0.05 * width,
    },
    description: {
      ...theme.text.body,
      ...theme.text.subtitle,
      ...theme.text.greyText,
      ...s.textAlignCenter,
    },
    root: {
      ...s.container,
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

export default WalletRecoveryComplete
