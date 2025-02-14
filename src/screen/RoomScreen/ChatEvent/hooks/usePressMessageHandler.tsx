// https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/hooks.js
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  isMentionUrlDeprecated,
  MENTION_URL_PREFIX,
} from '@holepunchto/keet-store/store/chat'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { isRoomUrl, openLink } from 'lib/linking'
import { navigate, SCREEN_USER_PROFILE } from 'lib/navigation'

export const CHAT_EVENT_FILE_GROUP_ID = 'CHAT_EVENT_FILE'

const usePressMessageHandler = (defaultIsMine = false) => {
  const roomId = useSelector(getAppCurrentRoomId)
  const onPressMessage = useCallback(
    (url: string, isMine: boolean = defaultIsMine) => {
      const isRoomInvitationUrl = isRoomUrl(url)

      if (isMentionUrlDeprecated(url)) {
        const memberId = url.replace(MENTION_URL_PREFIX, '')
        navigate(SCREEN_USER_PROFILE, { roomId, memberId })
        return
      }

      if (isRoomInvitationUrl || isMine) {
        openLink(url)
        return
      }

      showBottomSheet({
        bottomSheetType: BottomSheetEnum.ChatLinkConfirmationSheet,
        url,
      })
    },
    [defaultIsMine, roomId],
  )

  return onPressMessage
}

export default usePressMessageHandler
