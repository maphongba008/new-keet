import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import ModalPicker from 'component/ModalPicker/ModalPicker'
import { NavBar } from 'component/NavBar'
import ScreenKeypad from 'component/ScreenKeypad'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { getPaymentBackend } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

interface WalletReceiveFormI {
  ccyList: Array<any>
  currency: any
  setCurrency: any
  amount: any
  setAmount: any
  setInvoice: any
}
const WalletReceiveForm = ({
  ccyList,
  currency,
  setCurrency,
  amount,
  setAmount,
  setInvoice,
}: WalletReceiveFormI) => {
  const styles = getStyles()
  const strings = useStrings()

  const onPressGenerate = useCallback(() => {
    setInvoice(getPaymentBackend().generateInvoice(amount))
  }, [amount, setInvoice])

  const buttonType = useMemo(
    () =>
      Number(amount) > 0 ? TextButtonType.primary : TextButtonType.disabled,
    [amount],
  )
  const buttonDisabled = useMemo(() => Number(amount) === 0, [amount])

  return (
    <>
      <NavBar title={strings.wallet.receive.title} right={null} />
      <View style={styles.root}>
        <View style={s.container}>
          <ModalPicker
            values={ccyList}
            currentValue={currency}
            onSelectItem={setCurrency}
            containerStyle={s.centeredLayout}
          />
          <ScreenKeypad label={currency?.label} onChangeValue={setAmount} />
        </View>
        <TextButton
          text={strings.wallet.receive.generateInvoice}
          onPress={onPressGenerate}
          style={styles.btnNext}
          type={buttonType}
          disabled={buttonDisabled}
          {...appiumTestProps(APPIUM_IDs.wallet_receive_generate_invoice_btn)}
        />
      </View>
    </>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    btnNext: {
      marginVertical: UI_SIZE_16,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_16,
    },
  })
  return styles
})

export default memo(WalletReceiveForm)
