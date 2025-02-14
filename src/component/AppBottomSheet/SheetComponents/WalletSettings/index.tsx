import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import { ButtonBase } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'
import { navigate, SCREEN_WALLET_SETTINGS } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import BottomSheetEnum from '../BottomSheetEnum'

const WalletSettings = () => {
  const styles = getStyles()
  const {
    wallet: { settings: strings },
  } = useStrings()

  const onPressDelete = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.WalletDelete,
    })
  }, [])

  const onPressSettings = useCallback(() => {
    closeBottomSheet()
    navigate(SCREEN_WALLET_SETTINGS)
  }, [])

  return (
    <>
      <View style={s.centerAlignedRow}>
        <Text style={styles.title}>{strings.title}</Text>
        <CloseButton
          onPress={closeBottomSheet}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
      </View>
      <ButtonBase onPress={onPressSettings} style={styles.button}>
        <Text style={styles.buttonText}>{strings.transferSettings}</Text>
        <SvgIcon
          name="settings"
          width={UI_SIZE_20}
          height={UI_SIZE_20}
          color={colors.white_snow}
        />
      </ButtonBase>
      <ButtonBase onPress={onPressDelete} style={styles.button}>
        <Text style={[styles.buttonText, styles.buttonWarningText]}>
          {strings.deleteWallet}
        </Text>
        <SvgIcon
          name="trash"
          width={UI_SIZE_20}
          height={UI_SIZE_20}
          color={colors.red_400}
        />
      </ButtonBase>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_16,
      marginTop: UI_SIZE_16,
      padding: UI_SIZE_16,
    },
    buttonText: {
      ...s.container,
      ...theme.text.body,
      fontSize: 15,
    },
    buttonWarningText: {
      color: theme.color.red_400,
    },
    title: {
      ...s.container,
      ...theme.text.title,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default WalletSettings
