import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { APP_STATUS, setAppStatus } from '@holepunchto/keet-store/store/app'
import {
  getSyncDeviceAgreement,
  getSyncDeviceDeclined,
  getSyncDeviceSuccess,
  initSyncDevice,
} from '@holepunchto/keet-store/store/identity'
import { setUserProfile } from '@holepunchto/keet-store/store/userProfile'

import GestureContainer from 'component/GestureContainer'
import { ScreenSystemBars } from 'component/NavBar'
import { useExitOnboardingIDSetup } from 'lib/hooks/useAppNavigation'

import IdentitySyncAgreement from './IdentitySync.agreement'
import IdentitySyncDeclined from './IdentitySync.declined'
import IdentitySyncForm from './IdentitySync.form'
import { PAGES } from './IdentitySync.helpers'
import SyncDeviceSuccess from './IdentitySync.success'

const IdentitySync = memo(() => {
  const agreement = useSelector(getSyncDeviceAgreement)
  const success = useSelector(getSyncDeviceSuccess)
  const declined = useSelector(getSyncDeviceDeclined)
  const [formMode, setFormMode] = useState(PAGES.camera)

  const dispatch = useDispatch()
  const exitIDSetupHandler = useExitOnboardingIDSetup()

  useEffect(() => {
    dispatch(setAppStatus(APP_STATUS.IDENTITY_SETUP))

    return () => {
      dispatch(setAppStatus(APP_STATUS.RUNNING))
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(initSyncDevice())
  }, [dispatch])

  const onFinishSync = useCallback(() => {
    dispatch(setUserProfile({ needsName: false }))
    dispatch(setAppStatus(APP_STATUS.RUNNING))
    exitIDSetupHandler()
  }, [dispatch, exitIDSetupHandler])

  const content = useMemo(() => {
    if (!agreement) {
      return <IdentitySyncAgreement />
    }

    if (success) {
      return <SyncDeviceSuccess onFinishSync={onFinishSync} />
    }

    if (declined) {
      return <IdentitySyncDeclined />
    }

    return (
      <IdentitySyncForm formMode={formMode} onChangeFormMode={setFormMode} />
    )
  }, [agreement, declined, formMode, onFinishSync, success])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      {content}
    </GestureContainer>
  )
})

export default IdentitySync
