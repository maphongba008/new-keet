import React, { useCallback, useMemo } from 'react'
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import { ButtonBase, TextButton, TextButtonType } from 'component/Button'
import ModalPicker from 'component/ModalPicker/ModalPicker'
import PageWrapper from 'component/PageWrapper'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  ICON_SIZE_20,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_20,
  UI_SIZE_32,
} from 'lib/commonStyles'
import {
  navigate,
  SCREEN_WALLET_ENTER_AMOUNT,
  SCREEN_WALLET_SCANNER_VIEW,
} from 'lib/navigation'
import { generateTransactionPayload } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

import { WalletTransferFormI } from './types'
import { useWalletServiceProvider } from './useWalletServiceProvider'

function WalletTransferForm({
  isCryptoTransaction,
  heightOffset,
}: WalletTransferFormI) {
  const theme = useTheme()
  const styles = getStyles()
  const { wallet: strings, ...restStrings } = useStrings()

  const animatedHeight = heightOffset.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%'],
  })

  const {
    description,
    walletAddress,
    memoizedCcyList,
    selectedContact,
    selectedCurrency,
    memoizedContactList,
    setDescription,
    setWalletAddress,
    setSelectedContact,
    setSelectedCurrency,
  } = useWalletServiceProvider()

  const buttonDisabled = useMemo(
    () => !(selectedCurrency.value && (selectedContact.value || walletAddress)),
    [selectedCurrency, selectedContact, walletAddress],
  )

  const onClickSubmit = useCallback(async () => {
    const walletPayload = generateTransactionPayload({
      description,
      selectedContact,
      selectedCurrency,
      walletAddress,
      isCryptoTransaction,
    })
    navigate(SCREEN_WALLET_ENTER_AMOUNT, walletPayload)
  }, [
    description,
    selectedContact,
    selectedCurrency,
    walletAddress,
    isCryptoTransaction,
  ])

  const handlePaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync()
    setWalletAddress(text)
  }, [setWalletAddress])

  const handleScanner = useCallback(
    () => navigate(SCREEN_WALLET_SCANNER_VIEW),
    [],
  )

  return (
    <PageWrapper>
      <Animated.View style={{ height: animatedHeight }}>
        <View style={s.container}>
          <Text style={styles.placeholder}>{strings.send.currency}</Text>
          <ModalPicker
            values={memoizedCcyList}
            currentValue={selectedCurrency}
            onSelectItem={setSelectedCurrency}
          />

          {!isCryptoTransaction && (
            <View>
              <Text style={styles.placeholder}>{strings.send.transferTo}</Text>
              <ModalPicker
                hasSearch
                values={memoizedContactList}
                currentValue={selectedContact}
                onSelectItem={setSelectedContact}
              />
            </View>
          )}

          {isCryptoTransaction && (
            <>
              <Text style={[styles.placeholder, styles.extraBottom]}>
                {strings.send.walletAddress}
              </Text>
              <View style={styles.inputWithPasteIcon}>
                <TextInput
                  style={styles.inputStyle}
                  placeholder={strings.send.walletAddressPlaceholder}
                  autoCorrect={false}
                  placeholderTextColor={theme.color.grey_300}
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  {...appiumTestProps(APPIUM_IDs.wallet_input_wallet_address)}
                />
                <ButtonBase
                  style={styles.pasteIcon}
                  onPress={handlePaste}
                  {...appiumTestProps(APPIUM_IDs.wallet_send_paste_btn)}
                >
                  <SvgIcon
                    name="copy"
                    width={ICON_SIZE_20}
                    height={ICON_SIZE_20}
                    color={theme.color.grey_200}
                  />
                </ButtonBase>
              </View>
              <ButtonBase
                style={styles.scanWrapper}
                onPress={handleScanner}
                {...appiumTestProps(APPIUM_IDs.wallet_send_open_scanner_btn)}
              >
                <SvgIcon
                  name="qrcode"
                  width={UI_SIZE_20}
                  height={UI_SIZE_20}
                  color={theme.color.blue_400}
                />
                <Text style={styles.scanPlaceholder}>{strings.send.scan}</Text>
              </ButtonBase>
            </>
          )}

          <View>
            <Text style={[styles.placeholder, styles.extraBottom]}>
              {strings.send.message}
            </Text>
            <TextInput
              style={[styles.inputStyle, styles.inputStyleDesc]}
              placeholder={strings.send.messagePlaceHolder}
              placeholderTextColor={theme.color.grey_300}
              multiline
              onChangeText={setDescription}
              {...appiumTestProps(
                APPIUM_IDs.wallet_input_transaction_description,
              )}
            />
          </View>
        </View>
      </Animated.View>
      <View style={[s.container, s.justifyEnd]}>
        <TextButton
          {...appiumTestProps(APPIUM_IDs.wallet_btn_transfer_next)}
          style={styles.btnWrapper}
          text={restStrings.common.next}
          onPress={onClickSubmit}
          type={buttonDisabled ? TextButtonType.gray : TextButtonType.primary}
          disabled={buttonDisabled}
        />
      </View>
    </PageWrapper>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btnWrapper: {
      marginTop: UI_SIZE_4,
    },
    extraBottom: {
      paddingBottom: UI_SIZE_8,
    },
    inputStyle: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusNormal,
      fontSize: 15,
      height: 42,
      marginBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingRight: UI_SIZE_32 + UI_SIZE_4,
      paddingVertical: theme.spacing.normal + UI_SIZE_2,
    },
    inputStyleDesc: {
      height: 169,
      paddingTop: theme.spacing.normal + UI_SIZE_2,
      textAlignVertical: 'top',
    },
    inputWithPasteIcon: {
      height: 42,
    },
    pasteIcon: {
      position: 'absolute',
      right: UI_SIZE_8,
      ...s.fullHeight,
      ...s.justifyCenter,
    },
    placeholder: {
      ...theme.text.body,
      ...theme.text.greyText,
      fontSize: UI_SIZE_14,
    },
    scanPlaceholder: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_4,
    },
    scanWrapper: {
      ...s.row,
      ...s.alignSelfEnd,
      marginVertical: UI_SIZE_6,
    },
  })
  return styles
})

export default WalletTransferForm
