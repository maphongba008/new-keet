import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import {
  getIdentitySecretPhrase,
  phraseToWords,
} from '@holepunchto/keet-store/store/identity'

import GestureContainer from 'component/GestureContainer'
import { NavBar } from 'component/NavBar'
import RecoveryPhraseList from 'component/RecoveryPhrase/RecoveryPhrase.List'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const ViewRecoveryPhrase = () => {
  const strings = useStrings()
  const seedPhrase: string = useSelector(getIdentitySecretPhrase)
  const recoveryStrings = strings.settings.recoveryPhraseSettings

  const secretPhraseWordList = useMemo(
    () => phraseToWords(seedPhrase || ''),
    [seedPhrase],
  )

  const handleBack = useCallback(() => {
    back()
  }, [])

  return (
    <GestureContainer>
      <NavBar title={recoveryStrings.recoveryPhrase} />
      <RecoveryPhraseList
        seedPhrase={secretPhraseWordList}
        buttonText={strings.common.done}
        onClickSubmit={handleBack}
      />
    </GestureContainer>
  )
}

export default ViewRecoveryPhrase
