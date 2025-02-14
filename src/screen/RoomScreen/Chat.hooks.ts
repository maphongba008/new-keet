// https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/hooks.js
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import roomsApi from '@holepunchto/keet-store/api/rooms'
import { getChatMessageCoreIdById } from '@holepunchto/keet-store/store/chat'

import { getIsHistoryMode } from 'reducers/application'

import { usePrevious } from 'lib/hooks'
import { showErrorNotifier } from 'lib/hud'
import { type ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { useRoomScreenRefContext } from './ContextProvider/RoomScreenRefProvider'

const { useRemoveChatMessageMutation } = roomsApi

export const CHAT_EVENT_FILE_GROUP_ID = 'CHAT_EVENT_FILE'

export const useScrollToLatestOnLatestChatEventHeightChange = () => {
  const [latestChatEventHeight, setLatestChatEventHeight] = useState<{
    id: string
    height: number
  }>({ id: '', height: 0 })
  const prev = usePrevious(latestChatEventHeight)
  const isHistoryMode = useSelector(getIsHistoryMode)
  const { scrollToEndDirectly } = useRoomScreenRefContext()

  useEffect(() => {
    if (
      prev?.id === latestChatEventHeight.id &&
      prev?.height !== latestChatEventHeight.height &&
      !isHistoryMode
    ) {
      scrollToEndDirectly()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestChatEventHeight])

  return setLatestChatEventHeight
}

export function useRemoveChatMessage({
  roomId,
  messageId,
}: {
  roomId: string
  messageId: ChatEventType['id']
}) {
  const [removeChatMessage, { isError }] = useRemoveChatMessageMutation()
  const coreId = useSelector((state) =>
    getChatMessageCoreIdById(state, messageId),
  )
  const strings = useStrings()

  useEffect(() => {
    if (isError) {
      showErrorNotifier(strings.chat.deleteMessageError, false)
    }
  }, [isError, strings.chat.deleteMessageError])

  return () => {
    removeChatMessage({ roomId, id: coreId })
  }
}
