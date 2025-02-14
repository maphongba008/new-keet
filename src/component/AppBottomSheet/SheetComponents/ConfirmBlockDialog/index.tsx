import React, { memo, useCallback } from 'react'
import { useDispatch } from 'react-redux'

// @ts-ignore
import { memberBlockSubmit } from '@holepunchto/keet-store/store/member'

import { useStrings } from 'i18n/strings'

import { closeBottomSheet } from '../../AppBottomSheet.Store'
import ConfirmDialog from '../ConfirmDialog'

export interface ConfirmBlockDialogInterface {
  memberId: string
}

const ConfirmBlockDialog = ({ memberId }: ConfirmBlockDialogInterface) => {
  const dispatch = useDispatch()
  const strings = useStrings()

  const onConfirm = useCallback(() => {
    dispatch(memberBlockSubmit(memberId))
    closeBottomSheet()
  }, [memberId, dispatch])

  return (
    <ConfirmDialog
      description={strings.room.blockUserConfirmHint}
      confirmButton={{
        text: strings.room.blockUserConfirmButton,
        onPress: onConfirm,
      }}
    />
  )
}

export default memo(ConfirmBlockDialog)
