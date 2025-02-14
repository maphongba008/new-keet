import { type Animated } from 'react-native/types'

export enum WALLET_TRANSFER_TYPES {
  KEET_CONTACT,
  CRYPTO_WALLET,
}

export type WalletTypeI =
  | (typeof WALLET_TRANSFER_TYPES)[keyof typeof WALLET_TRANSFER_TYPES]
  | null

export interface WalletTransferFormI {
  isCryptoTransaction: boolean
  heightOffset: Animated.Value
}

export interface TrasnsferTypeI {
  onSelectType: (type: WalletTypeI) => void
}

export interface WalletUserDetailsI {
  avatarUrl: string | null
  walletAddress: string | null
  isCryptoTransaction: boolean
}
