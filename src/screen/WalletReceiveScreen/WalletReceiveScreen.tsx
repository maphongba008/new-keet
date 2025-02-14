import React, { memo, useState } from 'react'

import GestureContainer from 'component/GestureContainer'
import { ScreenSystemBars } from 'component/NavBar'
import { useWalletCcy } from 'lib/useWalletHooks'

import PaymentInvoice from './PaymentInvoice'
import WalletReceiveForm from './WalletReceiveForm'

const WalletReceiveScreen = () => {
  const [invoice, setInvoice] = useState('')
  const [amount, setAmount] = useState(0)
  const { ccyList, currency, setCurrency } = useWalletCcy()

  return (
    <GestureContainer>
      <ScreenSystemBars />
      {invoice ? (
        <PaymentInvoice invoice={invoice} />
      ) : (
        <WalletReceiveForm
          ccyList={ccyList}
          currency={currency}
          setCurrency={setCurrency}
          amount={amount}
          setAmount={setAmount}
          setInvoice={setInvoice}
        />
      )}
    </GestureContainer>
  )
}

export default memo(WalletReceiveScreen)
