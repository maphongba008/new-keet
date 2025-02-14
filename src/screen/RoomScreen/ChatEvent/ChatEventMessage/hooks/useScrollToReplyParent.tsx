import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  chatMessageJumpToCmd,
  getChatMessageSeqLoaded,
} from '@holepunchto/keet-store/store/chat'

import { getMessages, setIsHistoryMode } from 'reducers/application'

import { useRoomScreenRefContext } from 'screen/RoomScreen/ContextProvider/RoomScreenRefProvider'
import { ChatEventType } from 'lib/types'

export const useScrollToReplyParent = ({
  replyMessageEvent,
}: {
  replyMessageEvent: ChatEventType
}) => {
  const { flatListRef } = useRoomScreenRefContext()
  const messages = useSelector(getMessages)
  const seqLoaded = useSelector(getChatMessageSeqLoaded)
  const dispatch = useDispatch()

  const onTapReplyMessage = useCallback(() => {
    if (!replyMessageEvent) return

    // Compute target index only when the function is called
    const targetIndex = messages.findIndex(
      (msg) => msg.seq === replyMessageEvent.seq,
    )

    const { top } = seqLoaded
    if (top > replyMessageEvent.seq) {
      dispatch(chatMessageJumpToCmd({ messageId: replyMessageEvent.id }))
    } else if (targetIndex !== -1) {
      flatListRef?.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      })
    }

    dispatch(setIsHistoryMode(true))
  }, [dispatch, flatListRef, messages, replyMessageEvent, seqLoaded])

  return onTapReplyMessage
}
