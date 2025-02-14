import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_16 } from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'

import { useStrings } from 'i18n/strings'

export default function IdentitySyncSuccess({
  onFinishSync,
}: {
  onFinishSync: () => void
}) {
  const styles = getStyles()
  const strings = useStrings()

  const onPressBack = useCallback(() => {
    onFinishSync()
    return true
  }, [onFinishSync])
  useFocusedBackHandler(onPressBack)

  return (
    <View style={styles.container}>
      <View style={s.container} />
      <Text style={styles.title}>
        {strings.syncDevice.syncDeviceOpts.successTitle}
      </Text>
      <Text style={styles.description}>
        {strings.syncDevice.syncDeviceOpts.welcomeBack}
      </Text>
      <View style={s.container} />
      <TextButton
        text={strings.common.finish}
        type={TextButtonType.primary}
        onPress={onFinishSync}
        {...appiumTestProps(APPIUM_IDs.identity_sync_invite_request_success)}
      />
    </View>
  )
}

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
