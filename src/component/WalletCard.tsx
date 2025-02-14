import React, { memo, useCallback } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
} from 'lib/commonStyles'
import {
  navigate,
  SCREEN_WALLET_RECEIVE,
  SCREEN_WALLET_SEND,
} from 'lib/navigation'
import { getPaymentBackend } from 'lib/wallet'

import { getStrings } from 'i18n/strings'

import { showBottomSheet } from './AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from './AppBottomSheet/SheetComponents/BottomSheetEnum'
import { TextButton, TextButtonType } from './Button'
import SvgIcon from './SvgIcon'
import { createThemedStylesheet, gradient } from './theme'

const SendButtonIcon = memo(() => {
  return <SvgIcon name="arrowCircleUpRight" width={20} height={20} />
})

const ReceiveButtonIcon = memo(() => {
  return <SvgIcon name="arrowCircleDownLeft" width={20} height={20} />
})

const balance = getPaymentBackend().getBalance()

const WalletCard = () => {
  const styles = getStyles()
  const {
    wallet: { card: strings },
  } = getStrings()

  const onPressSettings = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.WalletSettings,
    })
  }, [])

  const handleWalletSend = useCallback(() => navigate(SCREEN_WALLET_SEND), [])
  const handleWalletReceive = useCallback(
    () => navigate(SCREEN_WALLET_RECEIVE),
    [],
  )

  return (
    <LinearGradient
      style={styles.wrapper}
      {...gradient.keet_gradient_blue_to_orange}
    >
      <LinearGradient
        style={styles.innerWrapper}
        {...gradient.keet_gradient_grey}
      >
        <TouchableOpacity onPress={onPressSettings} style={s.alignSelfEnd}>
          <SvgIcon
            name="dotsHorizontal"
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </TouchableOpacity>
        <View style={styles.contentWrapper}>
          <Text style={styles.walletText}>{strings.title}</Text>
          <Text style={styles.balanceLabel}>{strings.totalBalance}</Text>
          <View style={s.centerAlignedRow}>
            <Image
              style={styles.bitcoinIcon}
              resizeMode="contain"
              source={require('../resources/emojis/bitcoin.png')}
            />
            <Text style={styles.balance}>{balance.btc}</Text>
          </View>
          <Text style={styles.equivalentBalance}>~ ${balance.usdEquiv}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TextButton
            style={styles.button}
            onPress={handleWalletSend}
            text={strings.send}
            icon={SendButtonIcon}
            type={TextButtonType.primaryTransparentBg}
          />
          <TextButton
            style={styles.button}
            onPress={handleWalletReceive}
            text={strings.receive}
            icon={ReceiveButtonIcon}
            type={TextButtonType.primaryTransparentBg}
          />
        </View>
      </LinearGradient>
    </LinearGradient>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    balance: {
      ...theme.text.bodyBold,
      fontSize: 26,
    },
    balanceLabel: {
      ...theme.text.bodySemiBold,
      fontSize: 12,
    },
    bitcoinIcon: {
      height: UI_SIZE_24,
      marginRight: UI_SIZE_4,
      width: UI_SIZE_24,
    },
    button: {
      ...s.container,
      borderColor: theme.color.blue_900,
      borderRadius: UI_SIZE_8,
      height: 36,
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: 0,
    },
    buttonRow: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_8,
      marginTop: UI_SIZE_16,
    },
    contentWrapper: {
      ...s.alignItemsCenter,
      gap: UI_SIZE_8,
    },
    equivalentBalance: {
      ...theme.text.body,
      fontSize: 15,
    },
    innerWrapper: {
      padding: UI_SIZE_16,
    },
    walletText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 15,
    },
    wrapper: {
      borderRadius: UI_SIZE_16,
    },
  })

  return styles
})

export default memo(WalletCard)
