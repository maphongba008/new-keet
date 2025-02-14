import { ReactRenderer } from 'marked-react'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { setSyncDeviceAgreement } from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import { mdRenderer as defaultRenderer, MarkDown } from 'component/MarkDown'
import MaskGradient from 'component/MaskGradient'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet, gradient } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const IdentitySyncAgreement = memo(() => {
  const strings = useStrings()
  const styles = getStyles()
  const [agree, setAgree] = useState<boolean>(false)

  const dispatch = useDispatch()

  const submit = useCallback(() => {
    if (agree) {
      dispatch(setSyncDeviceAgreement(true))
    }
  }, [agree, dispatch])

  const mdRenderer = useMemo(
    (): Partial<ReactRenderer> => ({
      ...defaultRenderer,
      // eslint-disable-next-line react/no-unstable-nested-components
      text(text: string) {
        return (
          <Text style={styles.textBase} key={`${this.elementId}`}>
            {text}
          </Text>
        )
      },
    }),
    [styles.textBase],
  )
  const renderer = useCallback(() => mdRenderer, [mdRenderer])

  return (
    <>
      <NavBar title={strings.syncDevice.navTitle} />
      <View style={styles.root}>
        <MaskGradient
          linearGradientProps={gradient.keet_gradient_pink}
          MaskElement={
            <Text style={styles.title}>
              {strings.syncDevice.syncModal.title}
            </Text>
          }
        />
        <MarkDown md={strings.syncDevice.syncModal.text1} renderer={renderer} />
        <Text style={[styles.description, styles.textBase]}>
          {strings.syncDevice.syncModal.text2}
        </Text>
        <Text style={[styles.description, styles.textBase]}>
          {strings.syncDevice.syncModal.text3}
        </Text>
        <View style={s.container} />
        <LabeledCheckbox
          label={strings.syncDevice.syncModal.checkbox}
          onChange={setAgree}
          value={agree}
          style={styles.checkboxContainer as any}
          textStyle={styles.checkboxText}
          checkboxStyle={styles.checkbox}
          {...appiumTestProps(APPIUM_IDs.identity_accept_checkbox)}
        />
        <TextButton
          text={strings.syncDevice.syncModal.setupAction}
          type={TextButtonType.primary}
          onPress={submit}
          disabled={!agree}
          {...appiumTestProps(APPIUM_IDs.identity_btn_accept)}
        />
      </View>
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    checkbox: {
      alignSelf: 'flex-start',
      marginTop: UI_SIZE_4,
    },
    checkboxContainer: {
      marginBottom: UI_SIZE_16,
    },
    checkboxText: {
      ...theme.text.bodySemiBold,
      fontSize: UI_SIZE_14,
    },
    description: {
      ...theme.text.body,
      marginTop: UI_SIZE_24,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    textBase: {
      color: theme.color.grey_100,
      fontSize: UI_SIZE_14,
      textAlign: 'center',
    },
    title: {
      ...theme.text.title,
      fontSize: 26,
      marginBottom: UI_SIZE_16,
      marginTop: UI_SIZE_24,
      textAlign: 'center',
    },
  })
  return styles
})

export default IdentitySyncAgreement
