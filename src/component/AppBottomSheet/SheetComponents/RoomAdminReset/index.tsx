import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export interface RoomAdminResetInterface {
  close: () => void
}

const RoomAdminReset = ({ close }: RoomAdminResetInterface) => {
  const strings = useStrings()
  const styles = getStyles()

  const onPressReset = useCallback(() => {
    close()
  }, [close])

  const onPressCancel = useCallback(() => {
    close()
  }, [close])

  return (
    <View>
      <Text style={styles.title}>{`${strings.chat.forceResetAdmin}?`}</Text>
      <Text style={styles.desc}>{strings.chat.resetAdminSheetMessage}</Text>
      <View style={styles.buttonWrapper}>
        <TextButton
          onPress={onPressReset}
          text={strings.chat.resetAdminConfirm}
          type={TextButtonType.secondaryDanger}
          style={styles.button}
        />
        <TextButton
          onPress={onPressCancel}
          text={strings.common.cancel}
          type={TextButtonType.primaryOutline}
          style={styles.button}
        />
      </View>
    </View>
  )
}

export default RoomAdminReset

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      borderWidth: 0,
      height: 46,
      paddingVertical: 0,
    },
    buttonWrapper: {
      gap: UI_SIZE_8,
    },
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
