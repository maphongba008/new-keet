import { create } from 'zustand'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'

export const useWalletStore = create((set) => ({
  hasWalletSetup: false,
  networkData: null,
  setWallet: () => set(() => ({ hasWalletSetup: true })),
  resetWallet: () => set(() => ({ hasWalletSetup: false })),
  setNetworkData: (success: boolean, error: string) =>
    set(() => ({
      networkData: {
        success,
        error,
      },
    })),
  resetNetworkData: () =>
    set(() => ({
      networkData: null,
    })),
}))

const REGEXP_VALID_INTEGER = /^[0-9.]*$/
const REGEXP_FORMAT_NUMBER = /\B(?=(\d{3})+(?!\d))/g

export const MAX_INPUT_DECIMAL = 10
export const NETWORK_TYPES = {
  ETH: 'ETH',
  BTC: 'BTC',
}

// MOCK core.api.payment backend API
export const newWallet = () =>
  'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat birth route series fuel drill very cave tooth worth mesh crunch fragile'

export const getBalance = () => ({
  btc: 0.0025499,
  usdEquiv: 176.54,
})

export const getChainNetworks = () => [
  { ccy: NETWORK_TYPES.BTC, label: 'Bitcoin', icon: 'CurrencyBtc' },
  { ccy: NETWORK_TYPES.ETH, label: 'Ethereum', icon: 'CurrencyEth' },
]

export const getNetworkMode = () => ['Mainnet', 'Testnet', 'Regtest']

export const getTransactionData = () => [
  {
    id: 1,
    from: 'Chris',
    timestamp: 1728380667366,
    amountBtc: 0.00024,
    amountUsd: 15,
    desc: '',
  },
  {
    id: 2,
    to: '0x3A9Ee880x3A9Ee880x3A9Ee880x3A9Ee880x3A9Ee88',
    timestamp: 1728380667366,
    amountBtc: -0.001,
    amountUsd: -500,
    desc: 'October rent',
  },
  {
    id: 3,
    from: 'Chris',
    timestamp: 1728380667366,
    amountBtc: 0.00024,
    amountUsd: 15,
    desc: '',
  },
  {
    id: 4,
    to: '0x3A9Ee880x3A9Ee880x3A9Ee880x3A9Ee880x3A9Ee88',
    timestamp: 1728380667366,
    amountBtc: -0.001,
    amountUsd: -500,
    desc: 'September rent',
  },
]

const getKeetContactList = () => [
  {
    id: 1,
    name: 'Amelia Carter',
    avatar:
      'https://static-00.iconduck.com/assets.00/bitcoin-icon-2048x2048-t8gwld81.png',
    timestamp: 1728380667366,
  },
  {
    id: 2,
    name: 'Ava Morgan',
    avatar: null,
    timestamp: 1728380667366,
  },
  {
    id: 3,
    name: 'Ariana Bennett',
    avatar: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    timestamp: 1728380667366,
  },
  {
    id: 4,
    name: 'Abigail Turner',
    avatar: null,
    timestamp: 1728380667366,
  },
  {
    id: 5,
    name: 'Alyssa Hayes',
    avatar: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    timestamp: 1728380667366,
  },
]

const getAvailableTokens = () => [
  { value: 'USDT', label: 'USDT', icon: 'USDT', ccy: 'USDT', default: true },
  { value: 'BTC', label: 'BTC', icon: 'BTC', ccy: 'BTC' },
]

export const importWallet = (values: string) => {
  const seeds = newWallet()
  if (values !== seeds) {
    return false
  }
  return true
}

export const sanitizeCredentials = (value: string, skipSanitize = false) => {
  if (skipSanitize) {
    return value
  }
  return `${value.slice(0, 5)}...${value.slice(-4)}`
}

/** Calculate the font size based on the text length
 * The longer the text, the smaller the font */
export const calculateFontSize = (
  text: string,
  maxFontSize = 38,
  minFontSize = 15,
  maxLength = 8,
) => {
  if (text.length <= maxLength) {
    return maxFontSize
  }
  const fontSize = maxFontSize - (text.length - maxLength) * 2
  return Math.max(fontSize, minFontSize)
}

export function formatAmount(value: string) {
  if (!value) return value
  const [integer, decimal] = value.split('.')
  const integerPart = integer.replace(REGEXP_FORMAT_NUMBER, ',')
  const decimalPart = decimal ?? 0
  return value.split('.').length > 1
    ? `${integerPart}.${decimalPart}`
    : integerPart
}

export const isFirstDigit = (screenInputValue: string, currValue: number) => {
  return (
    !Number(screenInputValue) &&
    Number.isFinite(currValue) &&
    !screenInputValue.includes('.')
  )
}

export const validateInput = (
  currentValue: string,
  screenInputValue: string,
) => {
  const sanitizedValue = screenInputValue.split('.').join('')
  if (sanitizedValue.length >= MAX_INPUT_DECIMAL) return

  const isInvalidInput =
    !REGEXP_VALID_INTEGER.test(currentValue) && currentValue !== '.'
  if (isInvalidInput) return

  if (screenInputValue === '' && currentValue === '.') return

  const hasPeriodAlready = screenInputValue.includes('.')
  if (currentValue === '.' && hasPeriodAlready) return

  return true
}

export function filterSearchData(items: any, searchValue: any) {
  const replacedText = searchValue.replace(/ /g, '').toUpperCase()

  if (!replacedText || _isEmpty(items)) return items

  return _filter(items, ({ label, value }) => {
    const normalizedLabel = (label || value).replace(/ /g, '').toUpperCase()
    return _includes(normalizedLabel, replacedText)
  })
}

export const generateTransactionPayload = ({
  description,
  selectedCurrency,
  walletAddress,
  selectedContact,
  isCryptoTransaction,
}: any) => {
  return {
    description,
    isCryptoTransaction,
    ccy: selectedCurrency?.label,
    receiver: walletAddress ?? selectedContact?.label,
    avatarUrl: selectedContact?.avatarUrl,
  }
}

export const generateInvoice = (amount: number) => {
  return `Temp Generated invoice with amount ${amount}`
}

export const setupWallet = (opts = {}) => {
  return opts
}

export const connectNetwork = (configs: {
  network: string
  mode: string
  host: string
  port: string
  indexerWs: string
}) => {
  const { host, network, indexerWs } = configs || {}
  if (
    !host.startsWith('ws://') ||
    (network === 'ETH' && !indexerWs.startsWith('http://'))
  ) {
    return {
      success: false,
      error: 'Verify your network settings and try again.',
    }
  }
  return { success: true, data: configs }
}

const APIS = {
  newWallet,
  getBalance,
  getTransactionData,
  importWallet,
  getKeetContactList,
  getAvailableTokens,
  generateInvoice,
  getChainNetworks,
  getNetworkMode,
  setupWallet,
  connectNetwork,
}

export const getPaymentBackend = () => APIS
