import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import { createThemedStylesheet } from 'component/theme'
import { usePasscodeStore } from 'screen/Passcode/usePasscodeStore'
import s, {
  DIRECTION_CODE,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { removeStoragePasscode } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

export default memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const { setUserHasPasscode } = usePasscodeStore()

  const onRemovePasscode = useCallback(() => {
    removeStoragePasscode()
    setUserHasPasscode(false)
    closeBottomSheet()
  }, [setUserHasPasscode])

  const onPressClose = useCallback(() => {
    closeBottomSheet()
  }, [])

  return (
    <>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{strings.passcode.turnOffPasscode}?</Text>
        <CloseButton
          onPress={onPressClose}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
      </View>

      <Text style={styles.text}>{strings.passcode.turnOffPasscodeDesc}</Text>

      <TextButton
        text={strings.passcode.yesTurnItOff}
        onPress={onRemovePasscode}
        type={TextButtonType.danger}
        style={styles.actionBtn}
      />
      <TextButton
        text={strings.common.cancel}
        onPress={onPressClose}
        type={TextButtonType.secondary}
        style={styles.actionBtn}
      />
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      marginTop: UI_SIZE_16,
    },
    text: {
      color: theme.color.grey_300,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_8,
      writingDirection: DIRECTION_CODE,
    },
    title: {
      ...s.container,
      ...theme.text.title,
      writingDirection: DIRECTION_CODE,
    },

    titleWrapper: {
      ...s.centerAlignedRow,
      marginBottom: UI_SIZE_8,
    },
  })
  return styles
})
