import React, { memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getAccountRecoverySuccess,
  resetAccountRecovery,
} from '@holepunchto/keet-store/store/identity'

import { setAppActive } from 'reducers/application'

import GestureContainer from 'component/GestureContainer'
import { ScreenSystemBars } from 'component/NavBar'

import RecoverAccountForm from './RecoverAccount.form'
import RecoverAccountSuccess from './RecoverAccount.success'

const RecoverAccount = memo(() => {
  const success = useSelector(getAccountRecoverySuccess)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(resetAccountRecovery())
  }, [dispatch])

  useEffect(() => {
    dispatch(setAppActive(false))

    return () => {
      dispatch(setAppActive(true))
    }
  }, [dispatch])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      {success ? <RecoverAccountSuccess /> : <RecoverAccountForm />}
    </GestureContainer>
  )
})

export default RecoverAccount
