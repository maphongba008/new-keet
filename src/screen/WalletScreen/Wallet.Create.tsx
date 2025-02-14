import React, { memo, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { APP_STATUS, setAppStatus } from '@holepunchto/keet-store/store/app'
// @ts-ignore
import { resetBackupCreate } from '@holepunchto/keet-store/store/identity'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { TextButton, TextButtonType } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import MaskGradient from 'component/MaskGradient'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet, gradient } from 'component/theme'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12 } from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'
import { back, navigate, SCREEN_WALLET_RECOVERY_PHRASE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const CreateWallet = memo(() => {
  const { wallet: strings } = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setAppStatus(APP_STATUS.IDENTITY_SETUP))
    return () => {
      dispatch(setAppStatus(APP_STATUS.RUNNING))
    }
  }, [dispatch])

  const onBack = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.IdentityBackupConfirmSheet,
      onDoItLater: () => {
        closeBottomSheet()
        back()
      },
      onContinue: () => {
        closeBottomSheet()
      },
    })
    return true
  }, [])
  useFocusedBackHandler(onBack)

  const onPressAction = useCallback(() => {
    navigate(SCREEN_WALLET_RECOVERY_PHRASE)
  }, [])

  useEffect(() => {
    dispatch(resetBackupCreate())
  }, [dispatch])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar
        title=""
        right={null}
        middle={<ThreeDotsIndicator currentIndex={0} />}
      />
      <View style={styles.root}>
        <View style={s.container}>
          <MaskGradient
            linearGradientProps={gradient.keet_gradient_pink}
            MaskElement={
              <Text style={styles.title}>{strings.recoveryPhrase.title}</Text>
            }
          />
          <Text style={styles.text}>{strings.recoveryPhrase.text1}</Text>
          <Text style={styles.text}>{strings.recoveryPhrase.text2}</Text>
        </View>
        <TextButton
          text={strings.recoveryPhrase.setupAction}
          type={TextButtonType.primary}
          onPress={onPressAction}
          {...appiumTestProps(APPIUM_IDs.wallet_create_agreement_btn)}
        />
      </View>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    text: {
      ...theme.text.body,
      ...theme.text.subtitle,
      ...theme.text.greyText,
      marginBottom: UI_SIZE_12,
    },
    title: {
      ...theme.text.title,
      fontSize: 24,
      marginBottom: UI_SIZE_12,
    },
  })
  return styles
})

export default CreateWallet
