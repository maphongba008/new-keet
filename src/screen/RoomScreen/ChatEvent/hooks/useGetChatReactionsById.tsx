import { createSelector } from '@reduxjs/toolkit'

import { getChatReactionsById } from '@holepunchto/keet-store/store/chat'

import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { ReactionsType } from 'lib/types'

const useGetChatReactionsById = (id: string) => {
  const reactions: ReactionsType = useDeepEqualSelector(
    createSelector(getChatReactionsById(id), (chatReactions) => {
      return {
        reactions: chatReactions?.reactions || [],
        mine: chatReactions?.mine || [],
        mineInappropriateReported: chatReactions?.reportedByMe,
        inappropriateMessage: chatReactions?.reported,
      }
    }),
  )
  return reactions
}
export default useGetChatReactionsById
