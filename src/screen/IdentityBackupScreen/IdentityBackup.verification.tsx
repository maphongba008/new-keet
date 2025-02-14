import { memo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getBackupCreateCheckWords,
  getBackupCreateLoading,
  getBackupCreateSuccess,
  resetBackupCreateCheckWords,
  submitBackupCreate,
} from '@holepunchto/keet-store/store/identity'

import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import SeedPhraseVerification from 'component/RecoveryPhrase/RecoveryPhrase.Verification'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { back, navigate, SCREEN_IDENTITY_BACKUP_DEVICE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const IdentityBackupVerification = memo(() => {
  const { syncDevice: strings } = useStrings()
  const dispatch = useDispatch()

  const loading = useSelector(getBackupCreateLoading)
  const checkWords = useSelector(getBackupCreateCheckWords)
  const success = useSelector(getBackupCreateSuccess)

  useEffect(() => {
    dispatch(resetBackupCreateCheckWords())
  }, [dispatch])

  const onSubmitSuccess = useCallback(() => {
    dispatch(submitBackupCreate())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      navigate(SCREEN_IDENTITY_BACKUP_DEVICE)
    }
  }, [success])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title="" middle={<ThreeDotsIndicator currentIndex={1} />} />
      <SeedPhraseVerification
        loading={loading}
        success={success}
        checkWords={checkWords}
        title={strings.verifyTitle}
        description={strings.toEnsureTheSecurity}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={back}
      />
    </GestureContainer>
  )
})

export default IdentityBackupVerification
