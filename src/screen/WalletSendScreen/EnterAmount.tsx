import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import _get from 'lodash/get'

import { TextButton, TextButtonType } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import ScreenKeypad from 'component/ScreenKeypad'
import StatusScreen from 'component/StatusScreen'
import { createThemedStylesheet } from 'component/theme'
import WalletUserDetails from 'component/WalletUserDetails'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { navigate, SCREEN_WALLET } from 'lib/navigation'
import { sanitizeCredentials } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

function EnterAmount({ route }: any) {
  const styles = getStyles()
  const { wallet: strings, ...restStrings } = useStrings()
  const { ccy, receiver, avatarUrl, isCryptoTransaction } = _get(
    route,
    'params',
    {},
  )

  const [currentAmount, setCurrentAmount] = useState('')
  const [transactionCompleted, setTransactionCompleted] = useState(false)

  const onSubmit = useCallback(() => {
    setTransactionCompleted(true)
  }, [])

  const backToWallet = useCallback(() => navigate(SCREEN_WALLET), [])

  if (transactionCompleted) {
    return (
      <StatusScreen
        title={strings.send.transferSuccess}
        subTitle={`You sent ${currentAmount} BTC to ${sanitizeCredentials(
          receiver,
          !isCryptoTransaction,
        )}.`}
        onFinish={backToWallet}
      />
    )
  }

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.send.amountPlaceholder} right={null} />
      <View style={styles.container}>
        <WalletUserDetails
          walletAddress={receiver}
          avatarUrl={avatarUrl}
          isCryptoTransaction={isCryptoTransaction}
        />
        <ScreenKeypad label={ccy} onChangeValue={setCurrentAmount} />
      </View>
      <TextButton
        text={restStrings.common.submit}
        onPress={onSubmit}
        style={styles.btnNext}
        type={TextButtonType.primary}
        disabled={!currentAmount}
        {...appiumTestProps(APPIUM_IDs.wallet_send_submit_btn)}
      />
    </GestureContainer>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    btnNext: {
      marginHorizontal: UI_SIZE_16,
    },
    container: {
      flex: 1,
      ...s.centeredLayout,
      justifyContent: 'space-around',
      marginHorizontal: UI_SIZE_16,
    },
  })
  return styles
})

export default EnterAmount
