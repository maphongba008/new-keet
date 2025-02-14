import { memo, useCallback } from 'react'

import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import RecoveryPhraseList from 'component/RecoveryPhrase/RecoveryPhrase.List'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { generatedSeedPhrase } from 'lib/id'
import {
  navigate,
  SCREEN_WALLET_RECOVERY_PHRASE_VERIFICATION,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const SetupRecoveryPhrase = memo(() => {
  const { wallet: strings } = useStrings()
  const seedPhrase = generatedSeedPhrase()

  const onPressContinue = useCallback(
    () => navigate(SCREEN_WALLET_RECOVERY_PHRASE_VERIFICATION),
    [],
  )

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar
        title=""
        right={null}
        middle={<ThreeDotsIndicator currentIndex={1} />}
      />
      <RecoveryPhraseList
        seedPhrase={seedPhrase}
        title={strings.recoveryPhrase.title}
        onClickSubmit={onPressContinue}
      />
    </GestureContainer>
  )
})

export default SetupRecoveryPhrase
