import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { setSyncDeviceDeclined } from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_16 } from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'

import { useStrings } from 'i18n/strings'

const IdentitySyncDeclined = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()

  const onPressDeclined = useCallback(() => {
    dispatch(setSyncDeviceDeclined(false))
    return true
  }, [dispatch])

  useFocusedBackHandler(onPressDeclined)

  return (
    <>
      <View style={styles.container}>
        <View style={s.container} />
        <Text style={styles.title}>
          {strings.syncDevice.syncDeviceOpts.errorTitle}
        </Text>
        <Text style={styles.description}>
          {strings.syncDevice.syncDeviceOpts.errorDesc}
        </Text>
        <View style={s.container} />
        <TextButton
          text={strings.syncDevice.syncDeviceOpts.errorAction}
          type={TextButtonType.danger}
          onPress={onPressDeclined}
          {...appiumTestProps(APPIUM_IDs.identity_sync_invite_link_declined)}
        />
      </View>
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    description: {
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

export default IdentitySyncDeclined
