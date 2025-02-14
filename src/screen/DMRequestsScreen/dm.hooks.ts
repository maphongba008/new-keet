import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getIsIdentityComplete } from '@holepunchto/keet-store/store/identity'
import {
  DMItem,
  dmReplySubmit,
  getDmRejectedBySenderId,
  ROOM_DM_REPLY,
  setDmActiveId,
} from '@holepunchto/keet-store/store/room'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { TextButtonType } from 'component/Button'
import { useMember } from 'lib/hooks/useMember'
import { useConfig } from 'lib/hooks/useRoom'
import { storeLastRoomProps } from 'lib/localStorage'
import {
  navigate,
  navReplace,
  SCREEN_MY_DEVICES,
  SCREEN_ROOM,
} from 'lib/navigation'
import { MemberType } from 'lib/types'
import { wait } from 'lib/wait'

import { useStrings } from 'i18n/strings'

const useOnPressAcceptDmRequest = (item: DMItem) => {
  const { member } = useMember(item.roomId, item.senderId)
  const dispatch = useDispatch()
  const { title } = useConfig(item.roomId)
  return useCallback(() => {
    dispatch(dmReplySubmit(ROOM_DM_REPLY.ACCEPT, item.id))
    navReplace(SCREEN_ROOM, {
      dmConfig: {
        member,
        roomTitle: title,
        roomId: item.roomId,
      },
    })
    closeBottomSheet()
  }, [dispatch, item.id, item.roomId, member, title])
}

const useOnPressIgnoreDmRequest = (item: DMItem) => {
  const strings = useStrings()
  const dispatch = useDispatch()
  return useCallback(async () => {
    closeBottomSheet()
    await wait(300)
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: strings.chat.dm.ignoreDmTitle,
      description: strings.chat.dm.ignoreDmDescription,
      confirmButton: {
        text: strings.chat.dm.ignoreConfirm,
        type: TextButtonType.danger,
        onPress: () => {
          dispatch(dmReplySubmit(ROOM_DM_REPLY.REJECT, item.id))
          closeBottomSheet()
        },
      },
      buttons: [
        {
          text: strings.chat.dm.ignoreCancel,
          type: TextButtonType.secondary,
          onPress: closeBottomSheet,
        },
      ],
    })
  }, [dispatch, item.id, strings])
}

export const useOnPressOnDmRequest = (item: DMItem) => {
  const strings = useStrings()
  const dispatch = useDispatch()
  const { member } = useMember(item.roomId, item.senderId)
  const displayName = member.displayName || ''
  const handleAcceptDmRequest = useOnPressAcceptDmRequest(item)
  const handleIgnoreDmRequest = useOnPressIgnoreDmRequest(item)
  return useCallback(() => {
    dispatch(setDmActiveId(item.id))
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: strings.chat.dm.acceptRequestFrom.replace('$1', displayName),
      description: strings.chat.dm.acceptRequestFromDescription.replace(
        '$1',
        displayName,
      ),
      reverse: true,
      confirmButton: {
        text: strings.common.accept,
        onPress: handleAcceptDmRequest,
        type: TextButtonType.primary,
      },
      buttons: [
        {
          text: strings.common.ignore,
          onPress: handleIgnoreDmRequest,
          type: TextButtonType.danger,
        },
      ],
    })
  }, [
    dispatch,
    displayName,
    handleAcceptDmRequest,
    handleIgnoreDmRequest,
    item.id,
    strings,
  ])
}

const useShowIdentityNotComplete = () => {
  const strings = useStrings()
  return useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: strings.chat.dm.no_id_title,
      description: strings.chat.dm.no_id_description,
      confirmButton: {
        text: strings.chat.dm.no_id_setup_id,
        onPress: () => {
          storeLastRoomProps()
          closeBottomSheet()
          navigate(SCREEN_MY_DEVICES)
        },
        type: TextButtonType.primary,
      },
      buttons: [
        {
          text: strings.chat.dm.no_id_setup_later,
          type: TextButtonType.secondary,
          onPress: () => {
            closeBottomSheet()
          },
        },
      ],
    })
  }, [strings])
}

const useShowDmRequestIgnored = (item?: DMItem) => {
  const strings = useStrings()
  const dispatch = useDispatch()
  return useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: strings.chat.dm.messageRequest,
      description: strings.chat.dm.sendDmToRejectedRequest,
      confirmButton: {
        text: strings.common.accept,
        onPress: () => {
          item?.id && dispatch(dmReplySubmit(ROOM_DM_REPLY.ACCEPT, item.id))
          closeBottomSheet()
        },
        type: TextButtonType.primary,
      },
      buttons: [
        {
          text: strings.common.cancel,
          type: TextButtonType.secondary,
          onPress: closeBottomSheet,
        },
      ],
    })
  }, [dispatch, item?.id, strings])
}

export const useOnSendDm = (member: MemberType) => {
  const isIdentityComplete = useSelector(getIsIdentityComplete)
  const rejectedDmRequest = useSelector(getDmRejectedBySenderId(member.id))

  const showIdentityNotComplete = useShowIdentityNotComplete()
  const showDmRequestIgnored = useShowDmRequestIgnored(rejectedDmRequest)
  return useCallback(() => {
    if (!isIdentityComplete) {
      return showIdentityNotComplete()
    }
    if (rejectedDmRequest) {
      return showDmRequestIgnored()
    }
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.DMRequest,
      member,
    })
  }, [
    isIdentityComplete,
    member,
    rejectedDmRequest,
    showDmRequestIgnored,
    showIdentityNotComplete,
  ])
}
