import React, { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  getNick,
  getTimePub,
  getUserProfile,
  setUserProfile,
} from '@holepunchto/keet-store/store/userProfile'

import { closeAppModal } from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import InputWithLabel from 'component/InputWithLabel'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_16, width } from 'lib/commonStyles'
import { PROFILE_NAME_CHAR_LIMIT } from 'lib/constants'
import { keyboardBehavior } from 'lib/keyboard'
import { validateProfileName } from 'lib/validation'

import { useStrings } from 'i18n/strings'

const SetupNameScreen = () => {
  const dispatch = useDispatch()
  const styles = getStyles()
  const { top: marginTop, bottom: marginBottom } = useSafeAreaInsets()
  const { setup_name: strings } = useStrings()

  const profile = useSelector(getUserProfile)
  const [username, setUsername] = useState(
    (!profile?.needsName && profile?.name) || '',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (username) {
      setErrorMessage('')
    }
  }, [username])

  const onComplete = useCallback(() => {
    if (!username) {
      return setErrorMessage(strings.error)
    }

    dispatch(setUserProfile({ name: username, needsName: false }))
    dispatch(closeAppModal())
  }, [dispatch, username, strings.error])

  const onChangeText = useCallback((newUsername: string) => {
    const value = validateProfileName(newUsername)
    if (value === null && newUsername !== '') {
      return
    }
    setUsername(newUsername)
  }, [])

  const generate = useCallback(() => setUsername(getNick(getTimePub())), [])

  const isDisabled = username.length === 0

  return (
    <>
      <View style={[s.container, s.justifyEnd]}>
        <SvgIcon
          width={width}
          height={(width * 536) / 393}
          name="backgroundCircles"
        />
      </View>
      <View style={s.absoluteFill}>
        <KeyboardAvoidingView
          behavior={keyboardBehavior}
          style={[s.container, { marginTop, marginBottom }]}
        >
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            bounces={false}
          >
            <Text style={styles.title}>{strings.title}</Text>
            <InputWithLabel
              label={strings.name}
              rightLabelText={strings.generate}
              rightLabelOnPress={generate}
              value={username}
              onChangeText={onChangeText}
              maxLength={PROFILE_NAME_CHAR_LIMIT}
              placeholder={strings.inputPlaceholder}
              testID={APPIUM_IDs.onboarding_input_username}
              descriptionMD={strings.disclaimer}
              errorMessage={errorMessage}
            />
            <View style={s.container} />
            <TextButton
              onPress={onComplete}
              text={strings.save}
              type={TextButtonType.primary}
              key={`skip-btn-${isDisabled}`}
              {...appiumTestProps(APPIUM_IDs.onboarding_btn_save_username)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  )
}

export default SetupNameScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    contentContainer: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    title: {
      ...theme.text.title2,
    },
  })
  return styles
})
