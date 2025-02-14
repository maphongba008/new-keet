import React, { useCallback, useState } from 'react'
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native'

import { ButtonBase, TextButton, TextButtonType } from 'component/Button'
import { BackButton, NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { PROFILE_NAME_CHAR_LIMIT } from 'lib/constants'

import { useStrings } from 'i18n/strings'

import { ALPHA_NUMERIC_REGEXP, useAccountStore } from './Account.helper'

function SetUsername() {
  const styles = getStyles()
  const strings = useStrings()

  const [text, setText] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const { setUsername }: any = useAccountStore()

  const toggleModalVisible = useCallback(() => setVisible(!visible), [visible])

  const onCancel = useCallback(() => toggleModalVisible(), [toggleModalVisible])

  const handleChangeText = useCallback(
    (value: string) => {
      if (errMsg) {
        setErrMsg('')
      }
      setText(value)
    },
    [errMsg],
  )

  const handleSave = useCallback(() => {
    // simulate username taken error, replace with actual api
    const apiResponse = Math.random() > 0.9
    if (apiResponse) {
      setErrMsg('This username is already taken.')
      return
    }
    setUsername(text)
    onCancel()
  }, [onCancel, setUsername, text])

  return (
    <>
      <ButtonBase onPress={toggleModalVisible}>
        <Text style={styles.setUsernameLbl}>{strings.account.setUsername}</Text>
      </ButtonBase>

      <Modal
        statusBarTranslucent
        visible={visible}
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.container}>
          <NavBar
            title={strings.account.setUsername}
            left={<BackButton overrideOnPress={onCancel} />}
          />
          <View style={styles.wrapper}>
            <View>
              <Text style={styles.description}>
                {strings.account.createUniqueUsername}
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputPlaceholder}>
                  {strings.account.username}
                </Text>
                <View style={[s.posRelative, s.justifyCenter]}>
                  <TextInput
                    style={[styles.input, errMsg && styles.errFocused]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={PROFILE_NAME_CHAR_LIMIT}
                    onChangeText={handleChangeText}
                  />
                  <View style={styles.prefix}>
                    <Text style={styles.prefixLbl}>@</Text>
                  </View>
                </View>
                {!!errMsg && <Text style={styles.inputErrLbl}>{errMsg}</Text>}
              </View>

              <View style={styles.instructionWrapper}>
                <View style={s.row}>
                  <View style={styles.statusDot} />
                  <Text style={styles.instructionLbl}>
                    {strings.account.usernameNoChange}
                  </Text>
                </View>
                <View style={s.row}>
                  <View style={styles.statusDot} />
                  <Text style={styles.instructionLbl}>
                    {strings.account.usernameRequirement}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.btnContainer}>
              <TextButton
                text={strings.common.save}
                onPress={handleSave}
                type={
                  !ALPHA_NUMERIC_REGEXP.test(text)
                    ? TextButtonType.disabled
                    : TextButtonType.primary
                }
                style={styles.btn}
              />
              <TextButton
                text={strings.common.cancel}
                onPress={onCancel}
                type={TextButtonType.secondary}
                style={styles.btn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btn: {
      marginBottom: UI_SIZE_14,
      paddingVertical: UI_SIZE_14,
    },
    btnContainer: {
      paddingBottom: UI_SIZE_24,
    },
    container: {
      backgroundColor: theme.background.bg_1,
      flex: 1,
    },
    description: {
      ...theme.text.body,
      color: theme.color.grey_100,
      lineHeight: UI_SIZE_24,
      marginTop: UI_SIZE_6,
    },
    errFocused: {
      borderColor: theme.color.red_400,
      borderWidth: 0.5,
    },
    input: {
      ...theme.text.body,
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusNormal,
      height: 48,
      paddingHorizontal: theme.spacing.standard,
      paddingLeft: UI_SIZE_24 + UI_SIZE_6,
    },
    inputErrLbl: {
      ...theme.text.body,
      color: theme.color.red_400,
      fontSize: 13,
      lineHeight: 20,
      marginTop: UI_SIZE_4,
    },
    inputPlaceholder: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_200,
      fontSize: 14,
      paddingBottom: UI_SIZE_8,
    },
    inputRow: {
      marginBottom: UI_SIZE_8,
      marginTop: UI_SIZE_24,
    },
    instructionLbl: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      lineHeight: 21,
    },
    instructionWrapper: {
      marginLeft: UI_SIZE_12,
    },
    prefix: {
      paddingHorizontal: UI_SIZE_12,
      position: 'absolute',
    },
    prefixLbl: {
      ...theme.text.body,
      color: theme.color.grey_300,
    },
    setUsernameLbl: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
      marginTop: UI_SIZE_6,
    },
    statusDot: {
      backgroundColor: theme.color.grey_000,
      borderRadius: UI_SIZE_4 / 2,
      height: UI_SIZE_4,
      marginRight: UI_SIZE_8,
      width: UI_SIZE_4,
      ...s.alignSelfCenter,
    },
    wrapper: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingHorizontal: UI_SIZE_12,
    },
  })
  return styles
})

export default SetUsername
