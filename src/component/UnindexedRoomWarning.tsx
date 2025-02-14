import React, { memo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import {
  getRoomIndexingStatus,
  UNINDEXED_ROOM_TYPE,
} from '@holepunchto/keet-store/store/room'

import 'lib/commonStyles'

import { UI_SIZE_24 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import {
  closeBottomSheet,
  showBottomSheet,
} from './AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from './AppBottomSheet/SheetComponents/BottomSheetEnum'
import { IconButton, TextButtonType } from './Button'
import SvgIcon from './SvgIcon'
import { colors } from './theme'

const UnindexedRoomWarning = memo(() => {
  const strings = useStrings()
  const indexingStatus = useSelector(getRoomIndexingStatus)

  const openWarning = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: strings.chat.unindexedRoomTitle,
      description: strings.chat.unindexedRoomDescription,
      closeButton: true,
      confirmButton: {
        text: strings.common.okGotIt,
        type: TextButtonType.primary,
        onPress: closeBottomSheet,
      },
    })
  }, [strings])

  if (indexingStatus === UNINDEXED_ROOM_TYPE.NORMAL) {
    return null
  }

  return (
    <IconButton onPress={openWarning}>
      <SvgIcon
        name="warningCircle"
        color={colors.yellow_500}
        width={UI_SIZE_24}
        height={UI_SIZE_24}
      />
    </IconButton>
  )
})

export default UnindexedRoomWarning
