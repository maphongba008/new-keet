import { memo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getBackupCreateSecretWords } from '@holepunchto/keet-store/store/identity'

import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import RecoveryPhraseList from 'component/RecoveryPhrase/RecoveryPhrase.List'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { navigate, SCREEN_IDENTITY_BACKUP_VERIFICATION } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const IdentityBackupDisplay = memo(() => {
  const strings = useStrings()

  const words = useSelector(getBackupCreateSecretWords)

  const onPressContinue = useCallback(
    () => navigate(SCREEN_IDENTITY_BACKUP_VERIFICATION),
    [],
  )

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title="" middle={<ThreeDotsIndicator currentIndex={0} />} />
      <RecoveryPhraseList
        seedPhrase={words}
        title={strings.syncDevice.createRecoveryPhrase}
        onClickSubmit={onPressContinue}
      />
    </GestureContainer>
  )
})

export default IdentityBackupDisplay
