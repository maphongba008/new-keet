import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getChatMessageIds,
  getChatMessageInitialCache,
  getChatMessageUnreadCount,
} from '@holepunchto/keet-store/store/chat'

import { setIsHistoryMode } from 'reducers/application'

import { LIST_RENDER_COMPLETION_DELAY } from 'screen/RoomScreen/ChatEvent/hooks/useAutoScrollOnNewMessage'
import { useRoomScreenRefContext } from 'screen/RoomScreen/ContextProvider/RoomScreenRefProvider'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'

const MAX_SCROLL_UNREAD_COUNT = 6

const canAutoScroll = (unreadCount: number) => {
  return unreadCount < MAX_SCROLL_UNREAD_COUNT
}

/**
 * Automatically scrolls to the bottom of the chat (aka latest message) if unreadCount < 6 when
 * 1. Switching from cached mode to live mode (initialCache true -> false) or
 * 2. Entering a newly joined room with no messages, transitioning to live mode (initialCache false -> false, we use messages [] -> to [...])
 *
 * Additionally, if there are no unread messages, it marks the user as viewing the latest message.
 */
const useAutoScrollIfLowUnreadOnInit = (): void => {
  const dispatch = useDispatch()
  const { scrollToEndDirectly } = useRoomScreenRefContext()
  const initialCache = useSelector((state) => getChatMessageInitialCache(state))
  const unreadCount = useSelector(getChatMessageUnreadCount)
  const messageIds: Array<string> = useDeepEqualSelector(getChatMessageIds)
  const hasRunOnce = useRef(false)
  let listTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      listTimer.current && clearTimeout(listTimer.current)
    }
  }, [])

  useEffect(() => {
    // Exit if the effect has already run
    if (hasRunOnce.current) return

    if (!initialCache && messageIds.length) {
      hasRunOnce.current = true

      if (unreadCount === 0) dispatch(setIsHistoryMode(false))

      if (canAutoScroll(unreadCount)) {
        listTimer.current = setTimeout(() => {
          scrollToEndDirectly()
        }, LIST_RENDER_COMPLETION_DELAY)
      }
    }
  }, [messageIds, initialCache, unreadCount, scrollToEndDirectly, dispatch])
}

export default useAutoScrollIfLowUnreadOnInit
