/* eslint-disable react/jsx-no-bind */
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_18,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { TrasnsferTypeI, WALLET_TRANSFER_TYPES } from './types'

function SelectTransferType({ onSelectType }: TrasnsferTypeI) {
  const styles = getStyles()
  const { wallet: strings } = useStrings()

  return (
    <>
      <Text style={styles.text}>{strings.send.description}</Text>
      <ButtonBase
        style={styles.btnType}
        onPress={() => onSelectType(WALLET_TRANSFER_TYPES.KEET_CONTACT)}
        {...appiumTestProps(APPIUM_IDs.wallet_btn_select_keet_contact)}
      >
        <View style={[s.row, s.alignItemsCenter, styles.textWrapper]}>
          <Text style={styles.btnTypeLabel}>{strings.send.keetContact}</Text>
        </View>
        <SvgIcon
          name="arrowRight"
          width={UI_SIZE_18}
          height={UI_SIZE_18}
          color={colors.white_snow}
        />
      </ButtonBase>
      <ButtonBase
        style={styles.btnType}
        onPress={() => onSelectType(WALLET_TRANSFER_TYPES.CRYPTO_WALLET)}
        {...appiumTestProps(APPIUM_IDs.wallet_btn_select_crypto_wallet)}
      >
        <View style={[s.row, s.alignItemsCenter]}>
          <View style={styles.textWrapper}>
            <Text style={styles.btnTypeLabel}>{strings.send.cryptoWallet}</Text>
          </View>
        </View>
        <SvgIcon
          name="arrowRight"
          width={UI_SIZE_18}
          height={UI_SIZE_18}
          color={colors.white_snow}
        />
      </ButtonBase>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btnType: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.flexSpaceBetween,
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_12,
      height: 52,
      marginTop: theme.spacing.standard,
      padding: theme.spacing.standard,
    },
    btnTypeLabel: {
      ...theme.text.bodySemiBold,
    },
    text: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
    },
    textWrapper: {
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})

export default SelectTransferType
