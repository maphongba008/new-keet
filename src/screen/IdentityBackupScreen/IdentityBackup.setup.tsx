import { memo, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { askBackupCreateSecretWords } from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { navigate, SCREEN_IDENTITY_BACKUP_DISPLAY } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const IdentityBackupSetup = memo(() => {
  const { syncDevice: strings } = useStrings()
  const dispatch = useDispatch()
  const styles = getStyles()

  useEffect(() => {
    dispatch(askBackupCreateSecretWords())
  }, [dispatch])

  const onPressViewPhrase = useCallback(
    () => navigate(SCREEN_IDENTITY_BACKUP_DISPLAY),
    [],
  )

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title="" />
      <View style={styles.root}>
        <Text style={styles.title}>{strings.createRecoveryPhrase}</Text>
        <Text style={styles.description}>{strings.ensureTheSafety}</Text>
        <Text style={styles.description}>{strings.doNotShare}</Text>
        <View style={s.container} />
        <TextButton
          text={strings.viewPhrase}
          type={TextButtonType.primary}
          onPress={onPressViewPhrase}
          {...appiumTestProps(APPIUM_IDs.create_identity_view_phrase_btn)}
        />
      </View>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    description: {
      ...theme.text.body,
      color: theme.color.grey_100,
      marginTop: UI_SIZE_16,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    title: {
      ...theme.text.title,
    },
  })
  return styles
})

export default IdentityBackupSetup
