import { useMemo, useState } from 'react'

import { ModalPickerItemI } from 'component/ModalPicker/ModalPicker'
import { getPaymentBackend } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

export const useWalletServiceProvider = () => {
  const {
    wallet: { send: strings },
  } = useStrings()
  const { getKeetContactList, getAvailableTokens } = getPaymentBackend()
  const [description, setDescription] = useState('')
  const [walletAddress, setWalletAddress] = useState<any>(null)
  const [selectedCurrency, setSelectedCurrency] = useState({
    label: strings.currencyPlaceholder,
    value: null,
  })
  const [selectedContact, setSelectedContact] = useState({
    label: strings.namePlaceholder,
    value: null,
    avatarUrl: null,
  })

  const memoizedContactList: ModalPickerItemI[] = useMemo(
    () =>
      getKeetContactList().map(({ id, name, avatar }) => ({
        label: name,
        value: id,
        avatarUrl: avatar!,
      })),
    [getKeetContactList],
  )

  const memoizedCcyList: ModalPickerItemI[] = useMemo(
    () =>
      getAvailableTokens().map(({ ccy }) => ({
        label: ccy,
        value: ccy,
        icon: ccy,
      })),
    [getAvailableTokens],
  )

  return {
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
  }
}
