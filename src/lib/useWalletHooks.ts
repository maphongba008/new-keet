import { useState } from 'react'

import { getPaymentBackend } from 'lib/wallet'

const ccyList = getPaymentBackend().getAvailableTokens()

export const useWalletCcy = () => {
  const [currency, setCurrency] = useState(ccyList.find((ccy) => ccy.default))

  return {
    ccyList,
    currency,
    setCurrency,
  }
}
