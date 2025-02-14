import { ReactRenderer } from 'marked-react'
import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { resetBackupCreate } from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import { mdRenderer as defaultRenderer, MarkDown } from 'component/MarkDown'
import MaskGradient from 'component/MaskGradient'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet, gradient } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_16, UI_SIZE_24 } from 'lib/commonStyles'
import {
  navigate,
  SCREEN_IDENTITY_SYNC,
  SCREEN_RECOVER_ACCOUNT,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const RecoverAccountAgreement = memo(() => {
  const { recoverAccount: strings } = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(resetBackupCreate())
  }, [dispatch])

  const onPressExisting = useCallback(() => navigate(SCREEN_IDENTITY_SYNC), [])

  const onPressRecover = useCallback(() => navigate(SCREEN_RECOVER_ACCOUNT), [])

  const mdRenderer = useMemo(
    (): Partial<ReactRenderer> => ({
      ...defaultRenderer,
      // eslint-disable-next-line react/no-unstable-nested-components
      text(text: string) {
        return (
          <Text style={styles.textMD} key={`${this.elementId}`}>
            {text}
          </Text>
        )
      },
    }),
    [styles.textMD],
  )
  const renderer = useCallback(() => mdRenderer, [mdRenderer])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.setupModal.setupAction} />
      <View style={styles.root}>
        <View style={s.container}>
          <MaskGradient
            linearGradientProps={gradient.keet_gradient_pink}
            MaskElement={
              <Text style={styles.title}>{strings.setupModal.title}</Text>
            }
          />
          <Text style={styles.text}>{strings.setupModal.text1}</Text>
          <MarkDown md={strings.setupModal.text2} renderer={renderer} />
        </View>
        <TextButton
          text={strings.setupModal.existingAction}
          style={styles.bottomButton}
          type={TextButtonType.primary}
          onPress={onPressExisting}
          {...appiumTestProps(APPIUM_IDs.recover_btn_link)}
        />
        <TextButton
          text={strings.setupModal.setupAction}
          style={styles.bottomButton}
          type={TextButtonType.secondary}
          onPress={onPressRecover}
          {...appiumTestProps(APPIUM_IDs.recover_btn_recover)}
        />
      </View>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    bottomButton: {
      marginBottom: UI_SIZE_16,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
    },
    text: {
      ...theme.text.body,
      color: theme.color.grey_100,
      marginBottom: UI_SIZE_24,
    },
    textMD: {
      color: theme.color.grey_100,
      fontSize: UI_SIZE_16,
    },
    title: {
      ...theme.text.title,
      fontSize: 26,
      marginBottom: UI_SIZE_24,
    },
  })
  return styles
})

export default RecoverAccountAgreement
