import React, { useCallback } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'

import { TextButton } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_16 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export interface PermissionRequiredInterface {
  title: string
  close: () => void
}

const PermissionRequired = ({ close, title }: PermissionRequiredInterface) => {
  const strings = useStrings()
  const styles = getStyles()

  const onPressSettings = useCallback(() => {
    close()
    Linking.openSettings()
  }, [close])

  return (
    <View>
      <Text style={[styles.title, s.textAlignCenter]}>
        {title || strings.common.permissionRequired}
      </Text>
      <Text style={styles.desc}>{strings.common.enablePermission}</Text>
      <TextButton
        onPress={onPressSettings}
        text={strings.common.openSettings}
      />
    </View>
  )
}

export default PermissionRequired

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    desc: {
      ...theme.text.body,
      marginBottom: UI_SIZE_16,
    },
    title: {
      ...theme.text.title2,
      marginBottom: UI_SIZE_16,
    },
  })
  return styles
})
