import React, { memo, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { APP_STATUS, setAppStatus } from '@holepunchto/keet-store/store/app'
import {
  createAndSubmitBackup,
  getBackupCreateSuccess,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import { EmojiCustomPng } from 'component/EmojiRive'
import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import RecoveryPhraseAccessGuide from 'component/RecoveryPhrase/RecoveryPhrase.AccessGuide'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_14, UI_SIZE_16 } from 'lib/commonStyles'
import { useExitOnboardingIDSetup } from 'lib/hooks/useAppNavigation'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'

import { useStrings } from 'i18n/strings'

const IdentityBackupQuickSetup = memo(() => {
  const { syncDevice } = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()
  const exitIDSetupHandler = useExitOnboardingIDSetup()

  const success = useSelector(getBackupCreateSuccess)

  useEffect(() => {
    dispatch(createAndSubmitBackup())
  }, [dispatch])

  const onFinish = useCallback(async () => {
    dispatch(setAppStatus(APP_STATUS.RUNNING))
    exitIDSetupHandler()
  }, [dispatch, exitIDSetupHandler])

  const onPressBack = useCallback(() => {
    if (success) {
      onFinish()
    }
    return true
  }, [success, onFinish])
  useFocusedBackHandler(onPressBack)

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={null} left={null} />
      <View style={styles.root}>
        <Text style={styles.title}>
          {success
            ? syncDevice.quickSetup.completeTitle
            : syncDevice.quickSetup.loadingTitle}
        </Text>
        {success ? (
          <>
            <View style={s.flex0_5} />
            <SvgIcon
              name={'checkCircleFilled'}
              color={colors.green_300}
              width={80}
              height={80}
              style={styles.icon}
            />
            <Text style={[styles.description, styles.completeColor]}>
              {syncDevice.quickSetup.completeDesciption}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>{syncDevice.quickSetup.loadingNote}</Text>
            <EmojiCustomPng shortCode="keet_music" style={styles.icon} />
            <Text style={styles.description}>
              {syncDevice.quickSetup.loadingDesciption}
            </Text>
          </>
        )}
        <View style={s.container} />
        {!!success && (
          <TextButton
            text={syncDevice.finish}
            type={TextButtonType.primary}
            onPress={onFinish}
          />
        )}
        <RecoveryPhraseAccessGuide />
      </View>
    </GestureContainer>
  )
})

export default IdentityBackupQuickSetup

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    completeColor: {
      color: theme.color.green_300,
    },
    description: {
      ...theme.text.body,
      ...s.textAlignCenter,
      fontSize: UI_SIZE_14,
    },
    icon: {
      alignSelf: 'center',
      height: 80,
      marginTop: UI_SIZE_16,
      width: 80,
    },
    root: {
      ...s.container,
      gap: UI_SIZE_16,
      paddingHorizontal: theme.spacing.standard,
    },
    text: {
      ...theme.text.body,
      ...s.textAlignCenter,
      color: theme.color.grey_200,
      marginTop: UI_SIZE_8,
    },
    title: {
      ...theme.text.title,
      ...s.textAlignCenter,
      fontSize: 26,
    },
  })
  return styles
})
