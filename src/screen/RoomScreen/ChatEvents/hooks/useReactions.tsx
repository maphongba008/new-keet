import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import {
  getChatMessageCoreIdById,
  toggleReactionCmd,
} from '@holepunchto/keet-store/store/chat'

import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { ChatEventType } from 'lib/types'

export const useToggleReaction = (messageId: string) => {
  const dispatch = useDispatch()
  const coreId: ChatEventType['coreId'] = useDeepEqualSelector((state) =>
    getChatMessageCoreIdById(state, messageId),
  )

  return useCallback(
    (text: string) => {
      dispatch(toggleReactionCmd({ coreId, text }))
    },
    [coreId, dispatch],
  )
}
