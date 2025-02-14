import { memo, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  getBackupCreateLoading,
  getBackupCreateSuccess,
} from '@holepunchto/keet-store/store/identity'

import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import SeedPhraseVerification from 'component/RecoveryPhrase/RecoveryPhrase.Verification'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { generatedSeedPhrase, getSeedPhraseVerifyItems } from 'lib/id'
import {
  navigate,
  SCREEN_WALLET_RECOVERY_COMPLETE,
  SCREEN_WALLET_RECOVERY_PHRASE,
} from 'lib/navigation'
import { getPaymentBackend } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

import WalletConfig from './config.json'

const WalletPhraseVerification = memo(() => {
  const { wallet: strings } = useStrings()

  const loading: boolean = useSelector(getBackupCreateLoading)
  const success: boolean = useSelector(getBackupCreateSuccess)

  const seedPhrase = generatedSeedPhrase()
  const seedPhraseVerifyItems = getSeedPhraseVerifyItems(seedPhrase)

  const onSubmitSuccess = useCallback(() => {
    getPaymentBackend().setupWallet({
      network: WalletConfig.network,
      host: WalletConfig.electrum_host,
      port: WalletConfig.electrum_port,
      ws_indexer: WalletConfig.web3_indexer_ws,
    })
    navigate(SCREEN_WALLET_RECOVERY_COMPLETE)
  }, [])

  const onSubmitFail = useCallback(() => {
    navigate(SCREEN_WALLET_RECOVERY_PHRASE)
  }, [])

  useEffect(() => {
    if (success) {
      navigate(SCREEN_WALLET_RECOVERY_COMPLETE)
    }
  }, [success])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar
        title=""
        right={null}
        middle={<ThreeDotsIndicator currentIndex={2} />}
      />
      <SeedPhraseVerification
        loading={loading}
        success={success}
        checkWords={seedPhraseVerifyItems}
        title={strings.recoveryPhrase.verifyTitle}
        description={strings.recoveryPhrase.verifyDescription}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />
    </GestureContainer>
  )
})

export default WalletPhraseVerification
